'use client';

import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import styles from '../app/properties/details.module.css';

interface BookingFormProps {
  propertyId: string;
}

export default function BookingForm({ propertyId }: BookingFormProps) {
  const { user } = useAuth();
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to book a viewing.');
      return;
    }

    if (!dateTime) {
      setError('Please select a date and time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({ propertyId, dateTime, notes }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request viewing.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successMsg}>
        <h3>Viewing Requested!</h3>
        <p>The agent will review your request and confirm shortly.</p>
        <button className="btn-outline" onClick={() => setSuccess(false)}>Request another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="dateTime">Preferred Date & Time</label>
        <input
          type="datetime-local"
          id="dateTime"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className={styles.input}
          required
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">Additional Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else you'd like to share?"
          className={styles.textarea}
        />
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
        {loading ? 'Requesting...' : 'Request Viewing'}
      </button>
    </form>
  );
}
