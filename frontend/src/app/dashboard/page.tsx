'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import styles from './dashboard.module.css';
import OwnerDashboard from './owner/page';
import AdminDashboard from './admin/page';

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

  // Render standard Agent/Admin dashboard for others (Buyer/Tenant can also have simplified views later)
  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user.profile?.firstName || user.role}</h1>
          <p className={styles.subtitle}>Here is what is happening with your listings today.</p>
        </div>
        {(user.role === 'AGENT' || user.role === 'ADMIN') && (
          <Link href="/dashboard/properties/new" className="btn-primary">
            + Add New Property
          </Link>
        )}
      </header>

      {(user.role === 'AGENT' || user.role === 'ADMIN') ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Listings</div>
              <div className={styles.statValue}>{properties.length}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Active Listings</div>
              <div className={styles.statValue}>
                {properties.filter(p => p.status === 'ACTIVE').length}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Pending Deals</div>
              <div className={styles.statValue}>0</div>
            </div>
          </div>

          <div className={styles.sectionTitle}>Recent Properties</div>
          
          <div className={styles.propertyList}>
            <div className={styles.tableHeader}>
              <span>Image</span>
              <span>Property</span>
              <span>Price</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading properties...</div>
            ) : properties.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                No properties found. <Link href="/dashboard/properties/new" style={{ color: 'var(--primary)' }}>Create your first listing.</Link>
              </div>
            ) : (
              properties.slice(0, 5).map((property) => (
                <div key={property.id} className={styles.propertyRow}>
                  <img 
                    src={property.media[0]?.url || 'https://via.placeholder.com/150'} 
                    alt={property.title} 
                    className={styles.propertyImg}
                  />
                  <div>
                    <div className={styles.propertyName}>{property.title}</div>
                    <div className={styles.propertyAddress}>{property.address}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>${Number(property.price).toLocaleString()}</div>
                  <div>
                    <span className={`${styles.statusBadge} ${styles[`status${property.status.charAt(0) + property.status.slice(1).toLowerCase()}`]}`}>
                      {property.status}
                    </span>
                  </div>
                  <div>
                    <button className={styles.actionBtn}>âœŽï¸</button>
                    <button className={styles.actionBtn}>ðŸ—‘ï¸</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Welcome to your dashboard!</h2>
          <p>Please use the sidebar to navigate to your contracts or transactions.</p>
        </div>
      )}
    </>
  );
}
