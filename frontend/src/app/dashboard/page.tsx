'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { useUser, useEscrows, useAI } from '../providers';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, walletConnected } = useUser();
  const { escrows, setEscrows } = useEscrows();
  const { suggestions } = useAI();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!walletConnected) {
      router.push('/');
      return;
    }
    loadDashboardData();
  }, [walletConnected, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [escrowsResponse, statsResponse] = await Promise.all([
        api.get(`/escrow/user/${user.wallet}?limit=10`),
        api.get(`/analytics/user/${user.wallet}?period=30d`)
      ]);

      setEscrows(escrowsResponse.data.escrows);
      setStats(statsResponse.data.analytics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-warning-100 text-warning-800';
      case 'delivered': return 'bg-primary-100 text-primary-800';
      case 'released': return 'bg-success-100 text-success-800';
      case 'disputed': return 'bg-error-100 text-error-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `${amount.toLocaleString()} XLM`;
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the dashboard</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your escrow activity and performance
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Escrows</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEscrows}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalEarnings)}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.onTimePercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <CpuChipIcon className="w-6 h-6 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">AI Optimized</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.aiOptimizationRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Escrows */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Escrows</h2>
                <Link
                  href="/create-escrow"
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create New</span>
                </Link>
              </div>

              {escrows.length > 0 ? (
                <div className="space-y-4">
                  {escrows.map((escrow, index) => (
                    <motion.div
                      key={escrow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {user.role === 'client' ? escrow.freelancer.name : escrow.client.name}
                            </h3>
                            <span className={`badge ${getStatusColor(escrow.status)}`}>
                              {escrow.status}
                            </span>
                            {escrow.aiOptimized && (
                              <span className="badge bg-accent-100 text-accent-800">
                                AI Optimized
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{formatAmount(escrow.amount)}</span>
                            <span>•</span>
                            <span>Due: {formatDate(escrow.deadline)}</span>
                            {escrow.isOverdue && (
                              <span className="text-error-600 font-medium">Overdue</span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/escrow/${escrow.id}`}
                          className="btn-ghost flex items-center space-x-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No escrows yet</h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating your first escrow
                  </p>
                  <Link href="/create-escrow" className="btn-primary">
                    Create Escrow
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Suggestions & Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* AI Suggestions */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <CpuChipIcon className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
              </div>
              
              {suggestions.filter(s => s.status === 'pending').length > 0 ? (
                <div className="space-y-3">
                  {suggestions.filter(s => s.status === 'pending').slice(0, 3).map((suggestion) => (
                    <div key={suggestion.id} className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                      <p className="text-sm text-primary-800 mb-2">{suggestion.reasoning}</p>
                      <div className="flex space-x-2">
                        <button className="btn-success text-xs px-2 py-1">Approve</button>
                        <button className="btn-error text-xs px-2 py-1">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No pending suggestions</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/create-escrow"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create Escrow</span>
                </Link>
                <Link
                  href="/freelancers"
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>Browse Freelancers</span>
                </Link>
                <Link
                  href="/analytics"
                  className="w-full btn-ghost flex items-center justify-center space-x-2"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>

            {/* Performance Summary */}
            {stats && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed Jobs</span>
                    <span className="text-sm font-medium">{stats.completedEscrows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Late Deliveries</span>
                    <span className="text-sm font-medium">{stats.lateDeliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Penalties</span>
                    <span className="text-sm font-medium">{formatAmount(stats.totalPenalties)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reliability Score</span>
                    <span className="text-sm font-medium">{stats.reliabilityScore.toFixed(1)}/5.0</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
