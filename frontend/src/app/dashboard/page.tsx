'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import styles from './dashboard.module.css';

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
    const fetchMyProperties = async () => {
      try {
        // We'll need a specific endpoint for agent's properties later, 
        // for now we'll fetch all and filter or just use general fetch.
        // Assuming we'll have /api/properties/mine or similar
        const data = await apiFetch('/properties'); 
        setProperties(data);
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  if (!user) return null;

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user.profile?.firstName || 'Agent'}</h1>
          <p className={styles.subtitle}>Here is what is happening with your listings today.</p>
        </div>
        <Link href="/dashboard/properties/new" className="btn-primary">
          + Add New Property
        </Link>
      </header>

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
  );
}
