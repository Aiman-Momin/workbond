'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../providers';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function EscrowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, walletConnected } = useUser();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!walletConnected) {
      router.push('/');
      return;
    }
    loadEscrow();
  }, [params.id, walletConnected, router]);

  const loadEscrow = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/escrow/${params.id}`);
      setEscrow(response.data.escrow);
    } catch (error) {
      console.error('Error loading escrow:', error);
      toast.error('Failed to load escrow details');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async () => {
    try {
      setActionLoading(true);
      await api.post(`/escrow/${params.id}/deliver`, {
        freelancerWallet: user.wallet
      });
      toast.success('Work marked as delivered!');
      loadEscrow(); // Reload to update status
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast.error('Failed to mark as delivered');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    try {
      setActionLoading(true);
      await api.post(`/escrow/${params.id}/release`, {
        clientWallet: user.wallet
      });
      toast.success('Funds released successfully!');
      loadEscrow(); // Reload to update status
    } catch (error) {
      console.error('Error releasing funds:', error);
      toast.error('Failed to release funds');
    } finally {
      setActionLoading(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return ClockIcon;
      case 'delivered': return CheckCircleIcon;
      case 'released': return CheckCircleIcon;
      case 'disputed': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const canDeliver = () => {
    return user?.role === 'freelancer' && escrow?.status === 'active';
  };

  const canRelease = () => {
    return user?.role === 'client' && escrow?.status === 'delivered';
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to view escrow details</p>
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
          <p className="text-gray-600">Loading escrow details...</p>
        </div>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Escrow Not Found</h2>
          <p className="text-gray-600 mb-6">The escrow you're looking for doesn't exist</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(escrow.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Escrow Details</h1>
              <p className="text-gray-600">Contract ID: {escrow.contractId}</p>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon className="w-5 h-5" />
              <span className={`badge ${getStatusColor(escrow.status)}`}>
                {escrow.status}
              </span>
              {escrow.aiOptimized && (
                <span className="badge bg-accent-100 text-accent-800 flex items-center">
                  <CpuChipIcon className="w-3 h-3 mr-1" />
                  AI Optimized
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Parties */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Parties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Client</h3>
                  <p className="text-gray-600">{escrow.client.name}</p>
                  <p className="text-sm text-gray-500">{escrow.client.wallet}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600">Rating: </span>
                    <span className="text-sm font-medium ml-1">{escrow.client.rating}/5</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Freelancer</h3>
                  <p className="text-gray-600">{escrow.freelancer.name}</p>
                  <p className="text-sm text-gray-500">{escrow.freelancer.wallet}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600">Rating: </span>
                    <span className="text-sm font-medium ml-1">{escrow.freelancer.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Terms */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contract Terms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{escrow.amount.toLocaleString()} XLM</p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">Deadline</span>
                  </div>
                  <p className="text-lg text-gray-900">{new Date(escrow.deadline).toLocaleDateString()}</p>
                  {escrow.isOverdue && (
                    <p className="text-sm text-error-600 font-medium">Overdue</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">Grace Period</span>
                  </div>
                  <p className="text-lg text-gray-900">{escrow.gracePeriod} hours</p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">Penalty Rate</span>
                  </div>
                  <p className="text-lg text-gray-900">{(escrow.penaltyRate / 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {escrow.aiSuggestions && escrow.aiSuggestions.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">AI Suggestions</h2>
                <div className="space-y-4">
                  {escrow.aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary-900">{suggestion.type}</span>
                        <span className={`badge ${
                          suggestion.status === 'approved' ? 'bg-success-100 text-success-800' :
                          suggestion.status === 'rejected' ? 'bg-error-100 text-error-800' :
                          'bg-warning-100 text-warning-800'
                        }`}>
                          {suggestion.status}
                        </span>
                      </div>
                      <p className="text-sm text-primary-700 mb-2">{suggestion.reasoning}</p>
                      <div className="text-xs text-primary-600">
                        Confidence: {Math.round(suggestion.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {canDeliver() && (
                  <button
                    onClick={handleDeliver}
                    disabled={actionLoading}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Mark as Delivered</span>
                      </>
                    )}
                  </button>
                )}

                {canRelease() && (
                  <button
                    onClick={handleRelease}
                    disabled={actionLoading}
                    className="btn-success w-full flex items-center justify-center space-x-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>Release Funds</span>
                      </>
                    )}
                  </button>
                )}

                {escrow.status === 'active' && !canDeliver() && !canRelease() && (
                  <p className="text-sm text-gray-600 text-center">
                    Waiting for {user?.role === 'client' ? 'freelancer' : 'client'} action
                  </p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Escrow Created</p>
                    <p className="text-xs text-gray-500">{new Date(escrow.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {escrow.deliveredAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success-600 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Work Delivered</p>
                      <p className="text-xs text-gray-500">{new Date(escrow.deliveredAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                
                {escrow.releasedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success-600 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Funds Released</p>
                      <p className="text-xs text-gray-500">{new Date(escrow.releasedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
