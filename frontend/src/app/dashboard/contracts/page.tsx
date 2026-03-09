'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import styles from '../../dashboard.module.css';

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
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function ContractsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [signingContractId, setSigningContractId] = useState<string | null>(null);
  const [signature, setSignature] = useState('');
  const [signingError, setSigningError] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

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
      showToast('Redirecting to secure payment...', 'info');
      const data = await apiFetch('/payments/create-session', {
        method: 'POST',
        body: JSON.stringify({ contractId, type: 'DEPOSIT' }),
      });
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Payment error:', error);
      showToast(error.message || 'Failed to start payment process', 'error');
    }
  };

  const submitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature.trim() || !signingContractId) return;

    setIsSigning(true);
    setSigningError('');

    try {
      await apiFetch(`/contracts/${signingContractId}/sign`, {
        method: 'POST',
        body: JSON.stringify({ signature }),
      });
      
      // Update local state
      setContracts(prev => prev.map(c => c.id === signingContractId ? { ...c, status: 'SIGNED' } : c));
      
      setSigningContractId(null);
      setSignature('');
      showToast('Contract signed successfully!', 'success');
    } catch (error: any) {
      setSigningError(error.message || 'Failed to sign contract');
      showToast(error.message || 'Failed to sign contract', 'error');
    } finally {
      setIsSigning(false);
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
        <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 180px' }}>
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
            <div key={contract.id} className={styles.propertyRow} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 180px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{contract.property.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{contract.property.address}</div>
              </div>
              
              <div>
                <div style={{ fontWeight: 600 }}>{contract.client.profile?.firstName} {contract.client.profile?.lastName}</div>
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

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleDownload(contract.id)}
                  className="btn-outline" 
                  style={{ padding: '0.4rem', fontSize: '0.75rem' }}
                  title="Download PDF"
                >
                  ðŸ“¥ PDF
                </button>
                
                {contract.client.id === user.id && (contract.status === 'DRAFT' || contract.status === 'PENDING_SIGNATURE') && (
                  <button 
                    onClick={() => setSigningContractId(contract.id)}
                    className="btn-primary" 
                    style={{ padding: '0.4rem', fontSize: '0.75rem' }}
                  >
                    âœï¸ Sign
                  </button>
                )}

                {contract.status === 'SIGNED' && (
                  <button 
                    onClick={() => handlePay(contract.id)}
                    className="btn-primary" 
                    style={{ padding: '0.4rem', fontSize: '0.75rem', background: '#059669', borderColor: '#059669' }}
                  >
                    ðŸ’³ Pay
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Signature Modal */}
      {signingContractId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Digital Signature</h2>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.9rem' }}>
              By typing your full legal name below, you agree to the terms and conditions outlined in the contract. This acts as a legally binding digital signature.
            </p>

            {signingError && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{signingError}</div>}

            <form onSubmit={submitSignature}>
              <div className="form-group">
                <label className="input-label">Full Legal Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ fontFamily: 'cursive', fontSize: '1.25rem' }}
                  placeholder="John Doe"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSigning || !signature.trim()}>
                  {isSigning ? 'Signing...' : 'Agree & Sign'}
                </button>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => {
                  setSigningContractId(null);
                  setSignature('');
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
