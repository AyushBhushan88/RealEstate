'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/navigation';
import { apiFetch } from '../../../lib/api';

interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  hasAlerts: boolean;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSearches = async () => {
    try {
      const data = await apiFetch('/saved-searches');
      setSearches(data);
    } catch (error) {
      console.error('Failed to fetch saved searches', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const deleteSearch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;

    try {
      await apiFetch(`/saved-searches/${id}`, {
        method: 'DELETE',
      });
      setSearches(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete search', error);
    }
  };

  const toggleAlerts = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/saved-searches/${id}/alerts`, {
        method: 'PATCH',
        body: JSON.stringify({ hasAlerts: !currentStatus }),
      });
      setSearches(prev => prev.map(s => 
        s.id === id ? { ...s, hasAlerts: !currentStatus } : s
      ));
    } catch (error) {
      console.error('Failed to toggle alerts', error);
    }
  };

  const formatFilters = (filters: any) => {
    const labels: string[] = [];
    if (filters.city) labels.push(`City: ${filters.city}`);
    if (filters.type) labels.push(`Type: ${filters.type}`);
    if (filters.listingType) labels.push(`Listing: ${filters.listingType}`);
    if (filters.minPrice) labels.push(`Min: $${Number(filters.minPrice).toLocaleString()}`);
    if (filters.maxPrice) labels.push(`Max: $${Number(filters.maxPrice).toLocaleString()}`);
    if (filters.bedrooms) labels.push(`${filters.bedrooms}+ Beds`);
    if (filters.bathrooms) labels.push(`${filters.bathrooms}+ Baths`);
    
    return labels.length > 0 ? labels.join(', ') : 'No filters applied';
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '2rem' }}>Saved Searches</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading your saved searches...</p>
        </div>
      ) : searches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>ðŸ”</div>
          <h2 style={{ marginBottom: '0.5rem' }}>No saved searches</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Save your search criteria to get alerts for new matching properties.</p>
          <a href="/properties" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Search Properties
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {searches.map((search) => (
            <div key={search.id} style={{ 
              background: 'var(--surface)', 
              padding: '1.5rem', 
              borderRadius: '1rem', 
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{search.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {formatFilters(search.filters)}
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <a 
                    href={`/properties?${new URLSearchParams(search.filters).toString()}`}
                    style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}
                  >
                    View Results â†’
                  </a>
                  <span style={{ color: '#cbd5e1' }}>|</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input 
                      type="checkbox" 
                      checked={search.hasAlerts} 
                      onChange={() => toggleAlerts(search.id, search.hasAlerts)}
                    />
                    Email Alerts
                  </label>
                </div>
              </div>
              
              <button 
                onClick={() => deleteSearch(search.id)}
                style={{ 
                  background: 'none', 
                  border: '1px solid #fee2e2', 
                  color: '#ef4444', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
