'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import styles from './properties.module.css';

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
  media: { url: string }[];
  isFavorited?: boolean;
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    minSqft: '',
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const data = await apiFetch(`/properties?${queryParams.toString()}`);
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleFavorite = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const result = await apiFetch('/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ propertyId }),
      });

      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, isFavorited: result.isFavorited } : p
      ));
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="container">
        <div className={styles.galleryContainer}>
          {/* Sidebar Filters */}
          <aside className={styles.sidebar}>
            <h2 className={styles.filterTitle}>
              <span>ðŸ”</span> Filter Properties
            </h2>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Search City</label>
              <input 
                type="text" name="city" className="input-field" 
                placeholder="e.g. Los Angeles" 
                value={filters.city} onChange={handleFilterChange}
              />
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Property Type</label>
              <select name="type" className="input-field" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="CONDO">Condo</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Listing Type</label>
              <select name="listingType" className="input-field" value={filters.listingType} onChange={handleFilterChange}>
                <option value="">All Listings</option>
                <option value="SALE">For Sale</option>
                <option value="RENTAL">For Rent</option>
              </select>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Min Price ($)</label>
              <input 
                type="number" name="minPrice" className="input-field" 
                placeholder="Min Price" 
                value={filters.minPrice} onChange={handleFilterChange}
              />
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Max Price ($)</label>
              <input 
                type="number" name="maxPrice" className="input-field" 
                placeholder="Max Price" 
                value={filters.maxPrice} onChange={handleFilterChange}
              />
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Min Bedrooms</label>
              <select name="bedrooms" className="input-field" value={filters.bedrooms} onChange={handleFilterChange}>
                <option value="">Any</option>
                <option value="1">1+ Bed</option>
                <option value="2">2+ Beds</option>
                <option value="3">3+ Beds</option>
                <option value="4">4+ Beds</option>
                <option value="5">5+ Beds</option>
              </select>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Min Bathrooms</label>
              <select name="bathrooms" className="input-field" value={filters.bathrooms} onChange={handleFilterChange}>
                <option value="">Any</option>
                <option value="1">1+ Bath</option>
                <option value="2">2+ Baths</option>
                <option value="3">3+ Baths</option>
                <option value="4">4+ Baths</option>
              </select>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Min Sqft</label>
              <input 
                type="number" name="minSqft" className="input-field" 
                placeholder="Min Sqft" 
                value={filters.minSqft} onChange={handleFilterChange}
              />
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={fetchProperties}>
              Apply Filters
            </button>
            
            {user && (
              <button 
                className="btn-outline" 
                style={{ width: '100%', marginTop: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)' }} 
                onClick={async () => {
                  const name = prompt('Enter a name for this search:');
                  if (name) {
                    try {
                      await apiFetch('/saved-searches', {
                        method: 'POST',
                        body: JSON.stringify({ name, filters }),
                      });
                      alert('Search saved successfully!');
                    } catch (error) {
                      console.error('Failed to save search', error);
                      alert('Failed to save search.');
                    }
                  }
                }}
              >
                ðŸ’¾ Save Search
              </button>
            )}

            <button 
              className="btn-outline" 
              style={{ width: '100%', marginTop: '0.5rem' }} 
              onClick={() => {
                setFilters({ type: '', listingType: '', minPrice: '', maxPrice: '', city: '', bedrooms: '', bathrooms: '', minSqft: '' });
                fetchProperties();
              }}
            >
              Reset Filters
            </button>
          </aside>

          {/* Results Area */}
          <section>
            <div className={styles.resultsHeader}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Available Properties</h1>
              <div className={styles.resultsCount}>
                {loading ? 'Searching...' : `${properties.length} properties found`}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <p>Finding the best properties for you...</p>
              </div>
            ) : properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                <h3>No properties found</h3>
                <p>Try adjusting your filters to find more results.</p>
                <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => setFilters({ type: '', listingType: '', minPrice: '', maxPrice: '', city: '' })}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={styles.propertiesGrid}>
                {properties.map((property) => (
                  <Link href={`/properties/${property.id}`} key={property.id} className={styles.propertyCard}>
                    <div className={styles.imageContainer}>
                      <img 
                        src={property.media[0]?.url || 'https://via.placeholder.com/400x300'} 
                        alt={property.title} 
                        className={styles.propertyImage}
                      />
                      
                      <button 
                        className={`${styles.favoriteButton} ${property.isFavorited ? styles.isFavorited : ''}`}
                        onClick={(e) => toggleFavorite(e, property.id)}
                        title={property.isFavorited ? "Remove from favorites" : "Add to favorites"}
                      >
                        {property.isFavorited ? 'â¤ï¸' : 'â™¡'}
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
          </section>
        </div>
      </main>

      <style jsx global>{`
        .page-wrapper {
          min-height: 100vh;
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
}
