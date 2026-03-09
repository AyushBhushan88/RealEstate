'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from '../app/page.module.css';

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = transparent && !scrolled;

  return (
    <header className={`${styles.header} ${!isTransparent ? styles.scrolled : ''}`} style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoSpan}>REMS</span>
        Platform
      </Link>
      <nav className={styles.nav}>
        <Link href="/properties" className={styles.navLink} style={{ color: isTransparent ? '#fff' : 'var(--foreground)' }}>Listings</Link>
        <Link href="/#agents" className={styles.navLink} style={{ color: isTransparent ? '#fff' : 'var(--foreground)' }}>Agents</Link>
        <Link href="/#about" className={styles.navLink} style={{ color: isTransparent ? '#fff' : 'var(--foreground)' }}>About us</Link>
      </nav>
      <div className={styles.authGroup}>
        {user ? (
          <>
            <Link href="/dashboard" className={styles.navLink} style={{ color: isTransparent ? '#fff' : 'var(--foreground)', marginRight: '1rem' }}>
              Dashboard
            </Link>
            <button onClick={logout} className="btn-outline" style={{ ...(isTransparent ? { color: '#fff', borderColor: 'rgba(255,255,255,0.4)' } : {}) }}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-outline" style={{ ...(isTransparent ? { color: '#fff', borderColor: 'rgba(255,255,255,0.4)' } : {}) }}>
              Log in
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
