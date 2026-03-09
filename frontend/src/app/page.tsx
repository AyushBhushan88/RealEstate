"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import styles from "./page.module.css";

export default function Home() {
  const [searchCity, setSearchCity] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      router.push(`/properties?city=${encodeURIComponent(searchCity.trim())}`);
    } else {
      router.push("/properties");
    }
  };

  return (
    <div className={styles.page}>
      <Navbar transparent />

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <Image
              src="/hero.png"
              alt="Modern Luxury Home"
              fill
              className={styles.heroImage}
              priority
            />
            <div className={styles.heroOverlay} />
          </div>

          <div className={`${styles.heroContent} animate-fade-in`}>
            <div className={styles.badge}>✨ The ultimate platform for real estate</div>
            <h1 className={styles.title}>
              Manage Your Properties With Absolute Elegance.
            </h1>
            <p className={styles.subtitle}>
              From seamless property listings to secure digital agreements, REMS empowers agents, owners, and buyers to connect and close deals faster.
            </p>

            <form className={styles.searchContainer} onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search properties by city..." 
                className={styles.searchInput}
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              <button type="submit" className={`btn-primary ${styles.searchBtn}`}>
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Property Listings</h3>
              <p className={styles.featureDesc}>
                Advanced search and filtering system for thousands of high-quality property listings updated in real-time.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Client Management</h3>
              <p className={styles.featureDesc}>
                Track leads, organize your prospective clients, and manage transactions all within a single unified dashboard.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Digital Contracts</h3>
              <p className={styles.featureDesc}>
                Integrated e-signatures and template generation ensuring compliance and frictionless closings from anywhere.
              </p>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .${styles.welcomeText} {
          margin-right: 1.5rem;
          font-weight: 500;
          color: ${scrolled ? 'var(--foreground)' : '#fff'};
        }
      `}</style>
    </div>
  );
}
