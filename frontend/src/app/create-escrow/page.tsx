'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../providers';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

export default function CreateEscrowPage() {
  const router = useRouter();
  const { user, walletConnected } = useUser();
  const [freelancers, setFreelancers] = useState([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    deadline: '',
    gracePeriod: 24,
    penaltyRate: 300,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletConnected) {
      router.push('/');
      return;
    }
    loadFreelancers();
  }, [walletConnected, router]);

  const loadFreelancers = async () => {
    try {
      const response = await api.get('/users/top/freelancers?limit=20');
      setFreelancers(response.data.freelancers);
    } catch (error) {
      console.error('Error loading freelancers:', error);
      toast.error('Failed to load freelancers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFreelancer) {
      toast.error('Please select a freelancer');
      return;
    }

    try {
      setLoading(true);
        const response = await api.post('/escrow/create', {
        clientWallet: user.wallet,
        freelancerWallet: selectedFreelancer.wallet,
        amount: parseInt(formData.amount),
        deadline: new Date(formData.deadline).toISOString(),
          gracePeriod: Number(formData.gracePeriod),
          penaltyRate: Number(formData.penaltyRate)
      });

      toast.success('Escrow created successfully!');
      router.push(`/escrow/${response.data.escrow.id}`);
    } catch (error) {
      console.error('Error creating escrow:', error);
      toast.error('Failed to create escrow');
    } finally {
      setLoading(false);
    }
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to create an escrow</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create New Escrow
          </h1>
          <p className="text-xl text-gray-600">
            Set up a secure, AI-optimized escrow for your project
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Freelancer Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <UserGroupIcon className="w-6 h-6 mr-2 text-primary-600" />
              Select Freelancer
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {freelancers.map((freelancer) => (
                <div
                  key={freelancer.wallet}
                  onClick={() => setSelectedFreelancer(freelancer)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedFreelancer?.wallet === freelancer.wallet
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={freelancer.profileImage || `https://i.pravatar.cc/150?img=${Math.random()}`}
                      alt={freelancer.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{freelancer.name}</h3>
                      <p className="text-sm text-gray-600">Rating: {freelancer.rating}/5</p>
                      <p className="text-sm text-gray-600">
                        {freelancer.totalJobs} jobs • {freelancer.totalEarnings.toLocaleString()} XLM earned
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {freelancer.stats?.reliabilityScore?.toFixed(1) || '5.0'}/5.0
                      </div>
                      <div className="text-xs text-gray-500">Reliability</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Escrow Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CurrencyDollarIcon className="w-6 h-6 mr-2 text-primary-600" />
              Escrow Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Amount (XLM)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input"
                  placeholder="1000"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="label">Deadline</label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Grace Period (hours)</label>
                <select
                  value={formData.gracePeriod}
                  onChange={(e) => setFormData({ ...formData, gracePeriod: parseInt(e.target.value) })}
                  className="input"
                >
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours</option>
                </select>
              </div>

              <div>
                <label className="label">Penalty Rate (%)</label>
                <select
                  value={formData.penaltyRate}
                  onChange={(e) => setFormData({ ...formData, penaltyRate: parseInt(e.target.value) })}
                  className="input"
                >
                  <option value={100}>1%</option>
                  <option value={200}>2%</option>
                  <option value={300}>3%</option>
                  <option value={500}>5%</option>
                  <option value={1000}>10%</option>
                </select>
              </div>

              <div>
                <label className="label">Project Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Describe the project requirements..."
                />
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-900">AI Optimization</span>
                </div>
                <p className="text-sm text-primary-700">
                  This escrow will be monitored by our AI system, which may suggest optimizations 
                  based on the freelancer's performance history.
                </p>
              </div>

              <button
                type="submit"
                disabled={!selectedFreelancer || loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Escrow...</span>
                  </>
                ) : (
                  <>
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>Create Escrow</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
