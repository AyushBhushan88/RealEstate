'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import styles from '../../dashboard.module.css';

interface Booking {
  id: string;
  status: string;
  dateTime: string;
  notes: string;
  property: {
    title: string;
    address: string;
  };
  user?: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  agent?: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await apiFetch('/bookings');
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await apiFetch(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update booking status.');
    }
  };

  if (!user) return null;

  const isAgent = user.role === 'AGENT' || user.role === 'ADMIN';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Property Viewings</h1>
          <p className={styles.subtitle}>
            {isAgent 
              ? 'Manage viewing requests for your listings.' 
              : 'Track your requested property viewings.'}
          </p>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>ðŸ“…</div>
          <h3>No bookings found</h3>
          <p>You haven't {isAgent ? 'received' : 'made'} any viewing requests yet.</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Property</span>
            <span>Date & Time</span>
            <span>{isAgent ? 'Requested By' : 'Assigned Agent'}</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {bookings.map((booking) => (
            <div key={booking.id} className={styles.tableRow}>
              <div>
                <div style={{ fontWeight: 600 }}>{booking.property.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{booking.property.address}</div>
              </div>
              <div>
                {new Date(booking.dateTime).toLocaleString([], { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </div>
              <div>
                {isAgent ? (
                  <>
                    <div>{booking.user?.profile?.firstName} {booking.user?.profile?.lastName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{booking.user?.email}</div>
                  </>
                ) : (
                  <>
                    <div>{booking.agent?.profile?.firstName} {booking.agent?.profile?.lastName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{booking.agent?.email}</div>
                  </>
                )}
              </div>
              <div>
                <span className={`${styles.statusBadge} ${styles[`status${booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}`]}`}>
                  {booking.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isAgent && booking.status === 'PENDING' && (
                  <button 
                    onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                    className="btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Confirm
                  </button>
                )}
                {booking.status === 'PENDING' && (
                  <button 
                    onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                    className="btn-outline" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Cancel
                  </button>
                )}
                {isAgent && booking.status === 'CONFIRMED' && (
                  <button 
                    onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                    className="btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .table {
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .tableHeader {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1.5fr;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .tableRow {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1.5fr;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          align-items: center;
          font-size: 0.9375rem;
        }
        .tableRow:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
