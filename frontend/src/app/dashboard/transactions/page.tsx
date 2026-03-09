'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import styles from '../../dashboard.module.css';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  contract: {
    property: {
      title: string;
      address: string;
    };
  };
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiFetch('/payments/my-transactions');
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (!user) return null;

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>View your payment history and financial records.</p>
        </div>
      </header>

      <div className={styles.propertyList}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr' }}>
          <span>Property</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Type</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            No transactions found.
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className={styles.propertyRow} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{tx.contract?.property.title || 'N/A'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.contract?.property.address || 'N/A'}</div>
              </div>
              
              <div style={{ fontSize: '0.875rem' }}>
                {new Date(tx.createdAt).toLocaleDateString()}
              </div>

              <div style={{ fontWeight: 600 }}>
                ${Number(tx.amount).toLocaleString()}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px', textTransform: 'uppercase' }}>{tx.currency}</span>
              </div>

              <div>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {tx.type}
                </span>
              </div>

              <div>
                <span className={`${styles.statusBadge} ${styles[`status${tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}`] || ''}`} style={{ background: tx.status === 'COMPLETED' ? '#dcfce7' : '#f1f5f9', color: tx.status === 'COMPLETED' ? '#166534' : '#475569' }}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
