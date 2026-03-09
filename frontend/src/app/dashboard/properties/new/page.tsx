'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import styles from '../../../dashboard.module.css';

export default function NewProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'HOUSE',
    listingType: 'SALE',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    lotSize: '',
    yearBuilt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Property
      const property = await apiFetch('/properties', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // 2. Upload Images if any
      if (files.length > 0) {
        const uploadData = new FormData();
        uploadData.append('propertyId', property.id);
        files.forEach(file => {
          uploadData.append('files', file);
        });

        const token = typeof window !== 'undefined' ? document.cookie.split('token=')[1]?.split(';')[0] : null;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload images, but property was created.');
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Add New Property Listing</h1>
          <p className={styles.subtitle}>Fill in all the details about the property below.</p>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.sectionTitle}>Basic Information</div>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className="input-label">Property Title</label>
            <input 
              type="text" name="title" className="input-field" 
              placeholder="e.g., Luxury Villa in Beverly Hills" required 
              value={formData.title} onChange={handleChange}
            />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className="input-label">Description</label>
            <textarea 
              name="description" className="input-field" rows={4} 
              placeholder="Describe the property highlights, features, and neighborhood..." required
              value={formData.description} onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className="input-label">Price ($)</label>
            <input 
              type="number" name="price" className="input-field" 
              placeholder="e.g., 2500000" required
              value={formData.price} onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className="input-label">Property Type</label>
            <select name="type" className="input-field" value={formData.type} onChange={handleChange}>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="CONDO">Condo</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
        </div>

        <div className={styles.sectionTitle}>Location</div>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className="input-label">Street Address</label>
            <input 
              type="text" name="address" className="input-field" 
              placeholder="123 Ocean Blvd" required
              value={formData.address} onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className="input-label">City</label>
            <input 
              type="text" name="city" className="input-field" 
              placeholder="Los Angeles" required
              value={formData.city} onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className="input-label">State / Province</label>
            <input 
              type="text" name="state" className="input-field" 
              placeholder="California" required
              value={formData.state} onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.sectionTitle}>Features & Size</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className="input-label">Bedrooms</label>
            <input 
              type="number" name="bedrooms" className="input-field" 
              placeholder="e.g., 4"
              value={formData.bedrooms} onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className="input-label">Bathrooms</label>
            <input 
              type="number" step="0.5" name="bathrooms" className="input-field" 
              placeholder="e.g., 3.5"
              value={formData.bathrooms} onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className="input-label">Square Feet</label>
            <input 
              type="number" name="squareFeet" className="input-field" 
              placeholder="e.g., 2800"
              value={formData.squareFeet} onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className="input-label">Year Built</label>
            <input 
              type="number" name="yearBuilt" className="input-field" 
              placeholder="e.g., 2022"
              value={formData.yearBuilt} onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.sectionTitle}>Media Upload</div>
        <div style={{ marginBottom: '2rem' }}>
          <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-block' }}>
            <span>ðŸ“·</span> Upload Property Images
            <input 
              type="file" multiple accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </label>
          <p className={styles.subtitle} style={{ marginTop: '0.5rem' }}>Select up to 10 high-quality images. The first image will be the cover.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {previews.map((preview, index) => (
              <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => removeFile(index)}
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                >
                  Ã—
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ padding: '1rem 3rem' }}
          >
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="btn-outline"
            style={{ padding: '1rem 2rem' }}
          >
            Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
          border: 1px solid #fecaca;
        }
      `}</style>
    </div>
  );
}
