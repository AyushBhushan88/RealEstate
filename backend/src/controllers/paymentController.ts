import { Request, Response } from 'express';
import stripe from '../lib/stripe';
import prisma from '../lib/prisma';

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { contractId, type } = req.body;
    const userId = (req as any).user.userId;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { property: true, client: true }
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${type} for ${contract.property.title}`,
              description: `Contract ID: ${contract.id}`,
            },
            unit_amount: Math.round(Number(contract.amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard/contracts?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/contracts?canceled=true`,
      customer_email: contract.client.email,
      metadata: {
        contractId,
        userId,
        type
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // Update contract and create transaction
    const { contractId, userId, type } = session.metadata;

    await prisma.transaction.create({
      data: {
        contractId,
        userId,
        amount: session.amount_total / 100,
        type: type as any,
        status: 'COMPLETED',
        stripeId: session.id,
        paymentMethod: session.payment_method_types[0]
      }
    });

    // If it's a signed lease deposit, activate contract
    if (type === 'DEPOSIT' || type === 'RENT') {
      await prisma.contract.update({
        where: { id: contractId },
        data: { status: 'ACTIVE' }
      });
    }
  }

  res.json({ received: true });
};

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { contract: { include: { property: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
