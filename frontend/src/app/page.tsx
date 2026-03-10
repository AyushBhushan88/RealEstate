"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import styles from "./page.module.css";
import { Search, Sparkles, Building2, Users2, ShieldCheck } from 'lucide-react';

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
      <Navbar />

      <main>
        {/* Minimalist Hero Section */}
        <section className={styles.hero}>
          <div className={`${styles.heroContent} fade-in-up`}>
            <div className={styles.badge}>
              <Sparkles size={14} style={{ marginRight: '0.5rem' }} /> Industry Standard Platform
            </div>
            
            <h1 className={styles.title}>
              Real Estate, <span>Refined.</span>
            </h1>
            
            <p className={styles.subtitle}>
              Experience the pinnacle of property management. Discover, acquire, and manage premium real estate with uncompromising precision and elegance.
            </p>

            <form className={`${styles.searchContainer} delay-100`} onSubmit={handleSearch}>
              <Search size={20} style={{ marginLeft: '1rem', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search properties by city or zip code..." 
                className={styles.searchInput}
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              <button type="submit" className={`btn-primary ${styles.searchBtn}`}>
                Explore
              </button>
            </form>
          </div>

          <div className={`${styles.heroShowcase} fade-in-up delay-200`}>
            {/* Using architectural photos from Unsplash */}
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600" 
              alt="Premium modern architecture" 
              className={styles.showcaseMain} 
            />
            <div className={styles.showcaseSubWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800" 
                alt="Interior design detail" 
                className={styles.showcaseSub} 
              />
              <img 
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800" 
                alt="Minimalist living room" 
                className={styles.showcaseSub} 
              />
            </div>
          </div>
        </section>

        {/* Minimalist Features Section */}
        <section className={styles.features}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Building2 size={20} />
              </div>
              <h3 className={styles.featureTitle}>Curated Listings</h3>
              <p className={styles.featureDesc}>
                Access a highly vetted portfolio of properties. Our advanced filtering engine guarantees you find precisely what you seek.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Users2 size={20} />
              </div>
              <h3 className={styles.featureTitle}>Unified Management</h3>
              <p className={styles.featureDesc}>
                Control your real estate lifecycle from a single, intuitive dashboard. Oversee leads, agents, and portfolios effortlessly.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <ShieldCheck size={20} />
              </div>
              <h3 className={styles.featureTitle}>Digital First</h3>
              <p className={styles.featureDesc}>
                Frictionless transactions powered by native e-signatures and secure real-time payments. Compliant and instantaneous.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
