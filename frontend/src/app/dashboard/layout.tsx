'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from '../dashboard.module.css';
import { 
  LayoutDashboard, 
  Heart, 
  Search, 
  Home, 
  Calendar, 
  FileText, 
  MessageSquare, 
  CreditCard, 
  BarChart3, 
  CheckCircle,
  LogOut
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const allNavItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT', 'ACCOUNT_MANAGER'] },
    { name: 'Favorites', path: '/dashboard/favorites', icon: Heart, roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
    { name: 'Saved Searches', path: '/dashboard/saved-searches', icon: Search, roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
    { name: 'Listings', path: '/dashboard/properties', icon: Home, roles: ['ADMIN', 'AGENT'] },
    { name: 'Bookings', path: '/dashboard/bookings', icon: Calendar, roles: ['ADMIN', 'AGENT', 'BUYER', 'TENANT'] },
    { name: 'Contracts', path: '/dashboard/contracts', icon: FileText, roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT'] },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare, roles: ['ADMIN', 'AGENT'] },
    { name: 'Transactions', path: '/dashboard/transactions', icon: CreditCard, roles: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'TENANT', 'ACCOUNT_MANAGER'] },
    { name: 'Financials', path: '/dashboard/admin', icon: BarChart3, roles: ['ADMIN', 'ACCOUNT_MANAGER'] },
    { name: 'Verification', path: '/dashboard/owner', icon: CheckCircle, roles: ['OWNER'] },
  ];

  const navItems = navItemsFilter(allNavItems, user);

  if (!user) return null;

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link href="/">
            <span>REMS</span>
          </Link>
        </div>

        <nav className={styles.navSection}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={logout} 
          className={styles.navLink} 
          style={{ marginTop: 'auto', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Sign out</span>
        </button>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

function navItemsFilter(items: any[], user: any) {
  return items.filter(item => user && item.roles.includes(user.role));
}
