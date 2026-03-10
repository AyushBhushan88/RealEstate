'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import styles from '../../dashboard.module.css';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface FinancialStats {
  summary: {
    totalVolume: number;
    totalCommissions: number;
    totalFees: number;
  };
  chartData: { name: string; revenue: number }[];
  performance: { name: string; commissions: number; deals: number }[];
  recentTransactions: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        const data = await apiFetch('/admin/financials');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch financial stats', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'ADMIN' || user.role === 'ACCOUNT_MANAGER')) {
      fetchFinancials();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="fade-in-up">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Financial Intelligence</h1>
          <p className={styles.subtitle}>Real-time platform performance and revenue distribution.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing financial data...</div>
      ) : stats ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Market Volume</div>
              <div className={styles.statValue}>
                ${Number(stats.summary.totalVolume).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingUp size={12} /> +12.5% from last month
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Agent Payouts</div>
              <div className={styles.statValue}>
                ${Number(stats.summary.totalCommissions).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Net commission across all agents
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Agency Revenue</div>
              <div className={styles.statValue} style={{ color: '#000' }}>
                ${Number(stats.summary.totalFees).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Total platform service fees
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            {/* Revenue Chart */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Trend</h3>
                <BarChart3 size={18} color="var(--text-muted)" />
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      contentStyle={{ background: '#000', border: 'none', borderRadius: '4px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agent Leaderboard */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem' }}>Top Performers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {stats.performance.map((agent, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{agent.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agent.deals} deals completed</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>${agent.commissions.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>COMMISSION</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-outline" style={{ width: '100%', marginTop: '2.5rem', fontSize: '0.75rem', padding: '0.5rem' }}>
                View Full Rankings
              </button>
            </div>
          </div>

          <div className={styles.sectionTitle}>Global Transaction Feed</div>
          <div className={styles.propertyList}>
            <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 100px' }}>
              <span>Originator</span>
              <span>Beneficiary</span>
              <span>Amount</span>
              <span>Distribution</span>
              <span>Status</span>
            </div>
            {stats.recentTransactions.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No financial activity recorded.</div>
            ) : (
              stats.recentTransactions.map((tx) => (
                <div key={tx.id} className={styles.propertyRow} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 100px' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600 }}>{tx.user?.profile?.firstName} {tx.user?.profile?.lastName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tx.user?.email}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    {tx.recipient ? (
                      <>
                        <div style={{ fontWeight: 600 }}>{tx.recipient?.profile?.firstName} {tx.recipient?.profile?.lastName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tx.recipient?.email}</div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Agency Treasury</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>${Number(tx.amount).toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '2px', 
                      background: tx.type === 'FEE' ? '#000' : tx.type === 'COMMISSION' ? 'var(--primary-light)' : '#f1f5f9',
                      color: tx.type === 'FEE' ? '#fff' : tx.type === 'COMMISSION' ? '#000' : '#475569',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {tx.type}
                    </span>
                  </div>
                  <div>
                    <span className={styles.statusBadge} style={{ 
                      fontSize: '0.65rem',
                      background: tx.status === 'COMPLETED' ? '#f0fdf4' : '#f1f5f9',
                      color: tx.status === 'COMPLETED' ? '#166534' : '#475569',
                      border: 'none'
                    }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '6rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>Analysis Unavailable</h3>
          <p style={{ color: 'var(--text-muted)' }}>Could not synchronize with the financial engine.</p>
        </div>
      )}
    </div>
  );
}
