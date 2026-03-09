'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import styles from '../dashboard.module.css';

interface FinancialStats {
  summary: {
    totalVolume: number;
    totalCommissions: number;
    totalFees: number;
  };
  recentTransactions: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        const data = await apiFetch('/admin/financials');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch financial stats', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'ADMIN' || user.role === 'ACCOUNT_MANAGER')) {
      fetchFinancials();
    }
  }, [user]);

  if (!user) return null;

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Financial Overview</h1>
          <p className={styles.subtitle}>Platform-wide transaction and commission tracking.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading financial data...</div>
      ) : stats ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Volume</div>
              <div className={styles.statValue}>
                ${Number(stats.summary.totalVolume).toLocaleString()}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Agent Commissions</div>
              <div className={styles.statValue} style={{ color: '#059669' }}>
                ${Number(stats.summary.totalCommissions).toLocaleString()}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Agency Fees (Revenue)</div>
              <div className={styles.statValue} style={{ color: 'var(--primary)' }}>
                ${Number(stats.summary.totalFees).toLocaleString()}
              </div>
            </div>
          </div>

          <div className={styles.sectionTitle}>Global Transaction Feed</div>
          <div className={styles.propertyList}>
            <div className={styles.tableHeader} style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 100px' }}>
              <span>Payer / Client</span>
              <span>Recipient</span>
              <span>Amount</span>
              <span>Type</span>
              <span>Status</span>
            </div>
            {stats.recentTransactions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>No transactions recorded.</div>
            ) : (
              stats.recentTransactions.map((tx) => (
                <div key={tx.id} className={styles.propertyRow} style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 100px' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600 }}>{tx.user?.profile?.firstName} {tx.user?.profile?.lastName}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{tx.user?.email}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    {tx.recipient ? (
                      <>
                        <div style={{ fontWeight: 600 }}>{tx.recipient?.profile?.firstName} {tx.recipient?.profile?.lastName}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{tx.recipient?.email}</div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>System / Agency</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700 }}>${Number(tx.amount).toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      background: tx.type === 'FEE' ? '#ede9fe' : tx.type === 'COMMISSION' ? '#dcfce7' : '#f1f5f9',
                      color: tx.type === 'FEE' ? '#5b21b6' : tx.type === 'COMMISSION' ? '#166534' : '#475569'
                    }}>
                      {tx.type}
                    </span>
                  </div>
                  <div>
                    <span className={styles.statusBadge} style={{ fontSize: '0.7rem' }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Unable to load financial statistics.</div>
      )}
    </>
  );
}
