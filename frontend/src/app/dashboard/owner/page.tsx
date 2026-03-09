'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import styles from '../dashboard.module.css';

interface OwnerStats {
  summary: {
    totalProperties: number;
    totalInquiries: number;
    totalViews: number;
    monthlyRevenue: number;
  };
  properties: {
    id: string;
    title: string;
    status: string;
    views: number;
    inquiryCount: number;
    contractCount: number;
  }[];
  recentTransactions: any[];
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch('/owners/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch owner stats', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (!user) return null;

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Owner Dashboard</h1>
          <p className={styles.subtitle}>Track your property portfolio performance and revenue.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>
      ) : stats ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Monthly Revenue</div>
              <div className={styles.statValue} style={{ color: '#059669' }}>
                ${stats.summary.monthlyRevenue.toLocaleString()}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Views</div>
              <div className={styles.statValue}>{stats.summary.totalViews.toLocaleString()}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Inquiries</div>
              <div className={styles.statValue}>{stats.summary.totalInquiries}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Owned Properties</div>
              <div className={styles.statValue}>{stats.summary.totalProperties}</div>
            </div>
          </div>

          <div className={styles.sectionTitle}>Your Portfolio</div>
          <div className={styles.propertyList} style={{ marginBottom: '3rem' }}>
            <div className={styles.tableHeader} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
              <span>Property</span>
              <span>Status</span>
              <span>Views</span>
              <span>Inquiries</span>
              <span>Contracts</span>
            </div>
            {stats.properties.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>No properties linked to your account.</div>
            ) : (
              stats.properties.map((prop) => (
                <div key={prop.id} className={styles.propertyRow} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                  <div className={styles.propertyName}>{prop.title}</div>
                  <div>
                    <span className={`${styles.statusBadge} ${styles[`status${prop.status.charAt(0) + prop.status.slice(1).toLowerCase()}`]}`}>
                      {prop.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{prop.views.toLocaleString()}</div>
                  <div style={{ fontWeight: 600 }}>{prop.inquiryCount}</div>
                  <div style={{ fontWeight: 600 }}>{prop.contractCount}</div>
                </div>
              ))
            )}
          </div>

          <div className={styles.sectionTitle}>Recent Transactions</div>
          <div className={styles.propertyList}>
            <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
              <span>Property</span>
              <span>Amount</span>
              <span>Type</span>
              <span>Date</span>
            </div>
            {stats.recentTransactions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>No recent transactions.</div>
            ) : (
              stats.recentTransactions.map((tx) => (
                <div key={tx.id} className={styles.propertyRow} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
                  <div style={{ fontWeight: 500 }}>{tx.contract?.property?.title || 'N/A'}</div>
                  <div style={{ fontWeight: 700, color: '#059669' }}>${Number(tx.amount).toLocaleString()}</div>
                  <div style={{ fontSize: '0.85rem' }}>{tx.type}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Unable to load statistics.</div>
      )}
    </>
  );
}
