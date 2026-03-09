'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export default function InquiryForm({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : '',
    email: user?.email || '',
    phone: user?.profile?.phoneNumber || '',
    message: 'I am interested in this property and would like to learn more details.'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          propertyId
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#dcfce7', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
        <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>Message Sent!</h3>
        <p style={{ color: '#166534', fontSize: '0.9rem' }}>The agent will contact you soon via email or phone.</p>
        <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => setSuccess(false)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group" style={{ marginBottom: '0' }}>
        <label className="input-label">Your Name</label>
        <input 
          type="text" name="name" className="input-field" 
          placeholder="Full Name" required
          value={formData.name} onChange={handleChange}
        />
      </div>
      
      <div className="form-group" style={{ marginBottom: '0' }}>
        <label className="input-label">Email Address</label>
        <input 
          type="email" name="email" className="input-field" 
          placeholder="email@example.com" required
          value={formData.email} onChange={handleChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '0' }}>
        <label className="input-label">Phone (Optional)</label>
        <input 
          type="tel" name="phone" className="input-field" 
          placeholder="+1 (555) 000-0000"
          value={formData.phone} onChange={handleChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '0' }}>
        <label className="input-label">Message</label>
        <textarea 
          name="message" className="input-field" rows={4}
          required
          value={formData.message} onChange={handleChange}
        />
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
        {loading ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  );
}
