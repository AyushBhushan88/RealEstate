'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import InquiryForm from '../../../components/InquiryForm';
import BookingForm from '../../../components/BookingForm';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import styles from '../details.module.css';
import { ChevronLeft, Heart, MapPin, BedDouble, Bath, Square, Home, Mail, Phone } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  type: string;
  listingType: string;
  media: { url: string }[];
  isFavorited?: boolean;
  agent: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      avatarUrl: string;
    };
  };
}

export default function PropertyDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await apiFetch(`/properties/${id}`);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!property) return;

    try {
      const result = await apiFetch('/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ propertyId: property.id }),
      });

      setProperty(prev => prev ? { ...prev, isFavorited: result.isFavorited } : null);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <div className={styles.container} style={{ textAlign: 'center', padding: '10rem' }}>
        <h2 style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Loading Asset Details...</h2>
      </div>
    </div>
  );

  if (!property) return (
    <div className="page-wrapper">
      <Navbar />
      <div className={styles.container} style={{ textAlign: 'center', padding: '10rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Property not found.</h2>
        <Link href="/properties" className="btn-outline">Back to Listings</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className={`${styles.container} fade-in-up`}>
        <Link href="/properties" className={styles.backBtn}>
          <ChevronLeft size={16} /> Back to listings
        </Link>

        {/* Hero Gallery */}
        <div className={styles.gallery}>
          <img 
            src={property.media[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600'} 
            className={styles.mainImage} 
            alt={property.title} 
          />
          <img 
            src={property.media[1]?.url || property.media[0]?.url || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800'} 
            className={styles.subImage} 
            alt={property.title} 
          />
          <img 
            src={property.media[2]?.url || property.media[0]?.url || 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800'} 
            className={styles.subImage} 
            alt={property.title} 
          />
        </div>

        <div className={styles.grid}>
          {/* Main Info */}
          <div className={styles.mainInfo}>
            <div className={styles.header}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <h1 className={styles.title}>{property.title}</h1>
                  <button 
                    className={`${styles.favoriteButton} ${property.isFavorited ? styles.isFavorited : ''}`}
                    onClick={toggleFavorite}
                    title={property.isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart size={20} fill={property.isFavorited ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className={styles.location}>
                  <MapPin size={16} /> {property.address}, {property.city}, {property.state}
                </p>
              </div>
            </div>

            <div className={styles.price}>
              ${Number(property.price).toLocaleString()}
            </div>

            <div className={styles.quickFeatures}>
              <div className={styles.feature}>
                <span className={styles.featureLabel}>Beds</span>
                <span className={styles.featureValue}><BedDouble size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> {property.bedrooms}</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureLabel}>Baths</span>
                <span className={styles.featureValue}><Bath size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> {property.bathrooms}</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureLabel}>Area</span>
                <span className={styles.featureValue}><Square size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> {property.squareFeet} <span style={{ fontSize: '0.8em', fontWeight: 500 }}>sqft</span></span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureLabel}>Type</span>
                <span className={styles.featureValue}><Home size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> {property.type}</span>
              </div>
            </div>

            <div>
              <h2 className={styles.descriptionTitle}>Overview</h2>
              <p className={styles.description}>{property.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <img 
                  src={property.agent.profile?.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'} 
                  className={styles.agentAvatar} 
                  alt={property.agent.profile?.firstName} 
                />
                <div>
                  <div className={styles.agentName}>
                    {property.agent.profile?.firstName} {property.agent.profile?.lastName}
                  </div>
                  <div className={styles.agentRole}>Exclusive Agent</div>
                </div>
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} /> {property.agent.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} /> {property.agent.profile?.phoneNumber || 'Private Line'}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Quick Inquiry
                </h3>
                <InquiryForm propertyId={property.id} />
              </div>

              <div>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Schedule Private Viewing
                </h3>
                <BookingForm propertyId={property.id} />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <style jsx global>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--background);
        }
      `}</style>
    </div>
  );
}
