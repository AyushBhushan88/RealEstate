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

import { FileText, PenTool, CreditCard, Download, Clock, AlertCircle } from 'lucide-react';

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

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusStyle = (status: string, endDate?: string) => {
    if (status === 'ACTIVE' && endDate) {
      const days = getDaysRemaining(endDate);
      if (days < 0) return { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
      if (days <= 30) return { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' };
    }
    
    switch (status) {
      case 'ACTIVE': return { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
      case 'SIGNED': return { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' };
      case 'EXPIRED': return { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
      default: return {};
    }
  };

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
          <span>Status / Expiry</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Syncing contracts...</div>
        ) : contracts.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No digital contracts found.</p>
            <Link href="/dashboard/messages" className="btn-outline">Initiate from Leads</Link>
          </div>
        ) : (
          contracts.map((contract) => {
            const daysLeft = contract.endDate ? getDaysRemaining(contract.endDate) : null;
            
            return (
              <div key={contract.id} className={styles.propertyRow} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 180px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{contract.property.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{contract.property.address}</div>
                </div>
                
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{contract.client.profile?.firstName} {contract.client.profile?.lastName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{contract.client.email}</div>
                </div>

                <div style={{ fontWeight: 600 }}>
                  ${Number(contract.amount).toLocaleString()}
                  <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {contract.type === 'RENTAL' ? '/ month' : 'Total'}
                  </div>
                </div>

                <div>
                  <span className={styles.statusBadge} style={getStatusStyle(contract.status, contract.endDate)}>
                    {contract.status}
                  </span>
                  {contract.status === 'ACTIVE' && daysLeft !== null && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      marginTop: '0.5rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      color: daysLeft <= 30 ? '#b45309' : 'var(--text-muted)',
                      fontWeight: daysLeft <= 30 ? 600 : 400
                    }}>
                      <Clock size={12} />
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleDownload(contract.id)}
                    className={styles.actionBtn} 
                    title="Download PDF"
                  >
                    <Download size={16} />
                  </button>
                  
                  {contract.client.id === user.id && (contract.status === 'DRAFT' || contract.status === 'PENDING_SIGNATURE') && (
                    <button 
                      onClick={() => setSigningContractId(contract.id)}
                      className={styles.actionBtn} 
                      style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)' }}
                      title="Sign Contract"
                    >
                      <PenTool size={16} />
                    </button>
                  )}

                  {contract.status === 'SIGNED' && contract.client.id === user.id && (
                    <button 
                      onClick={() => handlePay(contract.id)}
                      className={styles.actionBtn} 
                      style={{ background: '#000', color: '#fff', borderColor: '#000' }}
                      title="Make Payment"
                    >
                      <CreditCard size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
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
