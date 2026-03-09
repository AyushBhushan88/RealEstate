'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from '../dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const allNavItems = [
    { name: 'Overview', path: '/dashboard', icon: 'ðŸ“Š', roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
    { name: 'Favorites', path: '/dashboard/favorites', icon: 'â¤ï¸', roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
    { name: 'Saved Searches', path: '/dashboard/saved-searches', icon: 'ðŸ”', roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
    { name: 'My Properties', path: '/dashboard/properties', icon: 'ðŸ', roles: ['ADMIN', 'AGENT'] },
    { name: 'Bookings', path: '/dashboard/bookings', icon: 'ðŸ“…', roles: ['ADMIN', 'AGENT', 'BUYER', 'TENANT'] },
    { name: 'Contracts', path: '/dashboard/contracts', icon: 'ðŸ“ƒ', roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
    { name: 'Messages', path: '/dashboard/messages', icon: 'ðŸ’¬', roles: ['ADMIN', 'AGENT'] },
    { name: 'Transactions', path: '/dashboard/transactions', icon: 'ðŸ’³', roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
    { name: 'Settings', path: '/dashboard/settings', icon: 'âš™ï¸', roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
  ];

  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  if (!user) return null;

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>REMS</span> Platform
        </div>

        <nav className={styles.navSection}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`${styles.navLink} ${pathname === item.path ? styles.navLinkActive : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <button onClick={logout} className={styles.navLink} style={{ marginTop: 'auto', border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}>
          <span>ðŸšª</span>
          <span>Logout</span>
        </button>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
