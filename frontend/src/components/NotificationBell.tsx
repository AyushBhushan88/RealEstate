'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '../lib/api';
import styles from '../app/dashboard.module.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
    
    // Polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
          padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>ðŸ”´</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px', background: '#ef4444',
            color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '50%',
            width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, width: '320px',
          background: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          borderRadius: '8px', border: '1px solid #e5e7eb', zIndex: 1000, marginTop: '0.5rem'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => markRead(notification.id)}
                  style={{
                    padding: '1rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                    background: notification.isRead ? 'transparent' : '#f9fafb',
                    transition: 'background 0.2s'
                  }}
                >
                  <Link href={notification.link || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontWeight: notification.isRead ? 500 : 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      {notification.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.4 }}>
                      {notification.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
            <Link href="/dashboard/notifications" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
