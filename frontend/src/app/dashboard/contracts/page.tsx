'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import styles from '../dashboard.module.css';

interface Contract {
  id: string;
  type: string;
  status: string;
  amount: number;
  startDate: string;
  endDate: string;
  property: {
    title: string;
    address: string;
  };
  client: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const data = await apiFetch('/contracts');
        setContracts(data);
      } catch (error) {
        console.error('Failed to fetch contracts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const handleDownload = async (contractId: string) => {
    try {
      const token = typeof window !== 'undefined' ? document.cookie.split('token=')[1]?.split(';')[0] : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF');
    }
  };

  const handlePay = async (contractId: string) => {
    try {
      const data = await apiFetch('/payments/create-session', {
        method: 'POST',
        body: JSON.stringify({ contractId, type: 'DEPOSIT' }),
      });
      window.location.href = data.url;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to start payment process');
    }
  };

  if (!user) return null;

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Digital Contracts</h1>
          <p className={styles.subtitle}>Manage your lease agreements and sales contracts.</p>
        </div>
      </header>

      <div className={styles.propertyList}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 150px' }}>
          <span>Property</span>
          <span>Client / Tenant</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading contracts...</div>
        ) : contracts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            No contracts found. Go to <Link href="/dashboard/messages" style={{ color: 'var(--primary)' }}>Leads</Link> to create one.
          </div>
        ) : (
          contracts.map((contract) => (
            <div key={contract.id} className={styles.propertyRow} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 150px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{contract.property.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{contract.property.address}</div>
              </div>
              
              <div>
                <div style={{ fontWeight: 600 }}>{contract.client.profile.firstName} {contract.client.profile.lastName}</div>
                <div style={{ fontSize: '0.85rem' }}>{contract.client.email}</div>
              </div>

              <div style={{ fontWeight: 600 }}>
                ${Number(contract.amount).toLocaleString()}
                <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                  {contract.type === 'RENTAL' ? '/ month' : 'Total'}
                </div>
              </div>

              <div>
                <span className={`${styles.statusBadge}`}>
                  {contract.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleDownload(contract.id)}
                  className="btn-outline" 
                  style={{ padding: '0.4rem', fontSize: '0.75rem' }}
                  title="Download PDF"
                >
                  ðŸ“¥ PDF
                </button>
                {(contract.status === 'PENDING_SIGNATURE' || contract.status === 'DRAFT') && (
                  <button 
                    onClick={() => handlePay(contract.id)}
                    className="btn-primary" 
                    style={{ padding: '0.4rem', fontSize: '0.75rem', background: '#059669' }}
                  >
                    ðŸ’³ Pay
                  </button>
                )}
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.4rem', fontSize: '0.75rem' }}
                >
                  Sign
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
