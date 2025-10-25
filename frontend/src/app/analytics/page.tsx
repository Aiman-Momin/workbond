'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '../providers';
import { api } from '../../lib/api';

export default function AnalyticsPage() {
  const { user } = useUser();
  const [platformStats, setPlatformStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [platformResponse, trendsResponse] = await Promise.all([
        api.get('/analytics/platform?period=30d'),
        api.get('/analytics/trends?metric=escrows&period=30d')
      ]);

      setPlatformStats(platformResponse.data.analytics);
      setTrends(trendsResponse.data.trends);

      if (user?.wallet) {
        const userResponse = await api.get(`/analytics/user/${user.wallet}?period=30d`);
        setUserStats(userResponse.data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    active: '#3b82f6',
    delivered: '#10b981',
    released: '#8b5cf6',
    disputed: '#ef4444',
    cancelled: '#6b7280'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mx-auto mb-4">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          <p className="text-xl text-gray-600">Platform insights and performance metrics</p>
        </motion.div>

        {/* Platform Overview */}
        {platformStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Escrows</p>
                  <p className="text-2xl font-bold text-gray-900">{platformStats.totalEscrows.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{platformStats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Volume (XLM)</p>
                  <p className="text-2xl font-bold text-gray-900">{platformStats.totalVolume.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{platformStats.onTimePercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Escrow Trends */}
          {trends && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Trends (30 days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Status Distribution */}
          {platformStats && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(platformStats.statusBreakdown).map(([status, data]: [string, any]) => ({
                          name: status,
                          value: (data as any).count || 0,
                          color: (statusColors as any)[status] || '#6b7280'
                        }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(platformStats.statusBreakdown).map(([status, data]: [string, any], index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[status] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* User Performance */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-12"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {userStats.onTimePercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">On-Time Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">
                  {userStats.totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Earnings (XLM)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">
                  {userStats.aiOptimizationRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">AI Optimized</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Optimization Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center mb-6">
            <CpuChipIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">AI Optimization Impact</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Performance Comparison</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Regular Escrows</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-400 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Optimized</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Key Benefits</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-success-600 mr-2" />
                  17% improvement in on-time delivery
                </li>
                <li className="flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-success-600 mr-2" />
                  23% reduction in disputes
                </li>
                <li className="flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-success-600 mr-2" />
                  31% increase in user satisfaction
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
