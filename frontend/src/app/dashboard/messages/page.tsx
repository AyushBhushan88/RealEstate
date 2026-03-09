'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import styles from '../dashboard.module.css';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
  property: {
    title: string;
    address: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const data = await apiFetch('/inquiries/my-leads');
        setInquiries(data);
      } catch (error) {
        console.error('Failed to fetch inquiries', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/inquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (!user) return null;

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Inquiries & Leads</h1>
          <p className={styles.subtitle}>Manage your prospective clients and their requests.</p>
        </div>
      </header>

      <div className={styles.propertyList}>
        <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1.5fr 2fr 1fr 120px' }}>
          <span>Property</span>
          <span>Contact</span>
          <span>Message</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            No inquiries yet. Keep your listings up to date!
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className={styles.propertyRow} style={{ gridTemplateColumns: '1.5fr 1.5fr 2fr 1fr 120px', alignItems: 'flex-start', padding: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{inquiry.property.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inquiry.property.address}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div style={{ fontWeight: 600 }}>{inquiry.name}</div>
                <div style={{ fontSize: '0.85rem' }}>{inquiry.email}</div>
                <div style={{ fontSize: '0.85rem' }}>{inquiry.phone || 'No phone'}</div>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#4b5563', fontStyle: 'italic' }}>
                "{inquiry.message}"
              </div>

              <div>
                <span className={`${styles.statusBadge} ${styles[`status${inquiry.status.charAt(0) + inquiry.status.slice(1).toLowerCase()}`]}`}>
                  {inquiry.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <select 
                  style={{ padding: '0.25rem', fontSize: '0.75rem', borderRadius: '4px' }}
                  value={inquiry.status}
                  onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="CLOSED">Closed</option>
                  <option value="ARCHIVED">Archive</option>
                </select>
                <button className="btn-outline" style={{ padding: '0.25rem', fontSize: '0.75rem' }}>
                  Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
