'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import styles from '../dashboard.module.css';
import OwnerDashboard from './owner/page';
import AdminDashboard from './admin/page';
import { Plus, Edit3, Trash2 } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  status: string;
  media: { url: string }[];
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'AGENT' || user.role === 'ADMIN')) {
      const fetchMyProperties = async () => {
        try {
          const data = await apiFetch('/properties'); 
          setProperties(data);
        } catch (error) {
          console.error('Failed to fetch properties', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMyProperties();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return null;

  // Render Admin Dashboard for financial overview
  if (user.role === 'ACCOUNT_MANAGER' || (user.role === 'ADMIN' && properties.length === 0)) {
    return <AdminDashboard />;
  }

  // Render Owner Dashboard if role is OWNER
  if (user.role === 'OWNER') {
    return <OwnerDashboard />;
  }

  // Render standard Agent/Admin dashboard for others
  return (
    <div className="fade-in-up">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Overview</h1>
          <p className={styles.subtitle}>Welcome back, {user.profile?.firstName || user.role}.</p>
        </div>
        {(user.role === 'AGENT' || user.role === 'ADMIN') && (
          <Link href="/dashboard/properties/new" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> New Property
          </Link>
        )}
      </header>

      {(user.role === 'AGENT' || user.role === 'ADMIN') ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Portfolio Size</div>
              <div className={styles.statValue}>{properties.length}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Active Listings</div>
              <div className={styles.statValue}>
                {properties.filter(p => p.status === 'ACTIVE').length}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Scheduled Viewings</div>
              <div className={styles.statValue}>0</div>
            </div>
          </div>

          <div className={styles.sectionTitle}>Recent activity</div>
          
          <div className={styles.propertyList}>
            <div className={styles.tableHeader}>
              <span>Preview</span>
              <span>Asset Details</span>
              <span>Valuation</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Synchronizing data...</div>
            ) : properties.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No active listings in your portfolio.</p>
                <Link href="/dashboard/properties/new" className="btn-outline">Create first listing</Link>
              </div>
            ) : (
              properties.slice(0, 5).map((property) => (
                <div key={property.id} className={styles.propertyRow}>
                  <img 
                    src={property.media[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=200'} 
                    alt={property.title} 
                    className={styles.propertyImg}
                  />
                  <div>
                    <div className={styles.propertyName}>{property.title}</div>
                    <div className={styles.propertyAddress}>{property.address}</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>${Number(property.price).toLocaleString()}</div>
                  <div>
                    <span className={`${styles.statusBadge} ${styles[`status${property.status.charAt(0).toUpperCase() + property.status.slice(1).toLowerCase()}`]}`}>
                      {property.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.actionBtn} title="Edit"><Edit3 size={14} /></button>
                    <button className={styles.actionBtn} title="Archive"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Dashboard Home</h2>
          <p style={{ color: 'var(--text-muted)' }}>Select a section from the sidebar to manage your real estate interests.</p>
        </div>
      )}
    </div>
  );
}
