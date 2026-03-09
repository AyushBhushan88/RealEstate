'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import styles from '../../../dashboard.module.css';

export default function NewContract() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const propertyId = searchParams.get('propertyId');
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('name');

  const [formData, setFormData] = useState({
    propertyId: propertyId || '',
    clientId: clientId || '',
    type: 'RENTAL',
    startDate: '',
    endDate: '',
    amount: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('A registered user is required to create a digital contract.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiFetch('/contracts', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      router.push('/dashboard/contracts');
    } catch (err: any) {
      setError(err.message || 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Create Digital Contract</h1>
          <p className={styles.subtitle}>Drafting agreement for <strong>{clientName || 'Lead'}</strong></p>
        </div>
      </header>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className="input-label">Contract Type</label>
            <select name="type" className="input-field" value={formData.type} onChange={handleChange}>
              <option value="RENTAL">Lease Agreement</option>
              <option value="SALE">Sales Contract</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className="input-label">{formData.type === 'RENTAL' ? 'Monthly Rent ($)' : 'Sale Price ($)'}</label>
            <input 
              type="number" name="amount" className="input-field" 
              placeholder="e.g. 2500" required
              value={formData.amount} onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className="input-label">Start Date</label>
            <input 
              type="date" name="startDate" className="input-field" 
              required
              value={formData.startDate} onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className="input-label">End Date (Optional)</label>
            <input 
              type="date" name="endDate" className="input-field" 
              value={formData.endDate} onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--background)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>Note:</strong> This will generate a legal draft based on the REMS standard template. You will be able to download the PDF and send it for digital signature in the next step.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || !clientId}
            style={{ padding: '1rem 3rem' }}
          >
            {loading ? 'Creating...' : 'Generate Contract'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
