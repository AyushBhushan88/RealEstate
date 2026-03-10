'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import styles from '../app/page.module.css';
import { User, LogIn } from 'lucide-react';

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrolled || !transparent;

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoSpan}>REMS</span>
      </Link>
      
      <nav className={styles.nav}>
        <Link href="/properties" className={styles.navLink}>Properties</Link>
        <Link href="/#agents" className={styles.navLink}>Agents</Link>
        <Link href="/#about" className={styles.navLink}>About</Link>
      </nav>
      
      <div className={styles.authGroup}>
        {user ? (
          <>
            <NotificationBell />
            <Link href="/dashboard" className={styles.navLink} style={{ margin: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} /> <span>Dashboard</span>
            </Link>
            <button 
              onClick={logout} 
              className="btn-outline" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.navLink} style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogIn size={16} /> <span>Log in</span>
            </Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
