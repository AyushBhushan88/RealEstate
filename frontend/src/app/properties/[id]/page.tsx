'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import InquiryForm from '../../../components/InquiryForm';
import { apiFetch } from '../../../lib/api';
import styles from '../details.module.css';

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

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <div className={styles.container} style={{ textAlign: 'center', padding: '10rem' }}>
        <h2>Loading property details...</h2>
      </div>
    </div>
  );

  if (!property) return (
    <div className="page-wrapper">
      <Navbar />
      <div className={styles.container} style={{ textAlign: 'center', padding: '10rem' }}>
        <h2>Property not found.</h2>
        <Link href="/properties" className="btn-outline">Back to Listings</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className={styles.container}>
        <Link href="/properties" className={styles.backBtn}>
          â† Back to listings
        </Link>

        {/* Hero Gallery */}
        <div className={styles.gallery}>
          <img src={property.media[0]?.url || 'https://via.placeholder.com/800x600'} className={styles.mainImage} alt={property.title} />
          <img src={property.media[1]?.url || property.media[0]?.url || 'https://via.placeholder.com/400x300'} className={styles.subImage} alt={property.title} />
          <img src={property.media[2]?.url || property.media[0]?.url || 'https://via.placeholder.com/400x300'} className={styles.subImage} alt={property.title} />
        </div>

        <div className={styles.grid}>
          {/* Main Info */}
          <div className={styles.mainInfo}>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>{property.title}</h1>
                <p className={styles.location}>
                  <span>ðŸ“</span> {property.address}, {property.city}, {property.state}
                </p>
              </div>
              <div className={styles.price}>
                ${Number(property.price).toLocaleString()}
              </div>
            </div>

            <div className={styles.quickFeatures}>
              <div className={styles.feature}>
                <span className={styles.featureLabel}>Bedrooms</span>
                <span className={styles.featureValue}>{property.bedrooms}</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureLabel}>Bathrooms</span>
                <span className={styles.featureValue}>{property.bathrooms}</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureLabel}>Square Feet</span>
                <span className={styles.featureValue}>{property.squareFeet} sqft</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureLabel}>Property Type</span>
                <span className={styles.featureValue}>{property.type}</span>
              </div>
            </div>

            <div>
              <h2 className={styles.descriptionTitle}>About this property</h2>
              <p className={styles.description}>{property.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <img 
                  src={property.agent.profile?.avatarUrl || 'https://via.placeholder.com/100'} 
                  className={styles.agentAvatar} 
                  alt={property.agent.profile?.firstName} 
                />
                <div>
                  <div className={styles.agentName}>
                    {property.agent.profile?.firstName} {property.agent.profile?.lastName}
                  </div>
                  <div className={styles.agentRole}>Listing Agent</div>
                </div>
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>ðŸ“§ {property.agent.email}</div>
                <div>ðŸ“ž {property.agent.profile?.phoneNumber || 'No phone number'}</div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Contact Agent</h3>
                <InquiryForm propertyId={property.id} />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <style jsx global>{`
        .page-wrapper {
          min-height: 100vh;
          background: #fff;
        }
        .contactBtn {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
