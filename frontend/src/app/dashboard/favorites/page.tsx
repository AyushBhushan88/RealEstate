'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import styles from '../../properties/properties.module.css';

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  type: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  media: { url: string, isMain: boolean }[];
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const data = await apiFetch('/favorites');
      setFavorites(data);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await apiFetch('/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ propertyId }),
      });
      setFavorites(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Failed to remove favorite', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>My Favorite Properties</h1>
        <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading your favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>â™¡</div>
          <h2 style={{ marginBottom: '0.5rem' }}>No favorites yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't saved any properties to your favorites yet.</p>
          <Link href="/properties" className="btn-primary">
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className={styles.propertiesGrid}>
          {favorites.map((property) => (
            <Link href={`/properties/${property.id}`} key={property.id} className={styles.propertyCard}>
              <div className={styles.imageContainer}>
                <img 
                  src={property.media[0]?.url || 'https://via.placeholder.com/400x300'} 
                  alt={property.title} 
                  className={styles.propertyImage}
                />
                
                <button 
                  className={`${styles.favoriteButton} ${styles.isFavorited}`}
                  onClick={(e) => removeFavorite(e, property.id)}
                  title="Remove from favorites"
                >
                  â¤ï¸
                </button>

                <div className={styles.priceTag}>
                  ${Number(property.price).toLocaleString()}
                </div>
                <div className={styles.listingTypeBadge}>
                  {property.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
                </div>
              </div>
              
              <div className={styles.cardContent}>
                <h3 className={styles.propertyTitle}>{property.title}</h3>
                <div className={styles.propertyLocation}>
                  <span>ðŸ“</span> {property.address}, {property.city}
                </div>
                
                <div className={styles.features}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>ðŸ›</span> {property.bedrooms} Beds
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>ðŸ›€</span> {property.bathrooms} Baths
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>â–¨</span> {property.squareFeet} sqft
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
