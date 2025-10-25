'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  CpuChipIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useUser } from './providers';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FreelancerCard } from '../components/FreelancerCard';
import { StatsCard } from '../components/StatsCard';
import { CTAButton } from '../components/CTAButton';
import { api } from '../lib/api';

export default function HomePage() {
  const { walletConnected } = useUser();
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load top freelancers
      const freelancersResponse = await api.get('/users/top/freelancers?limit=6');
      setTopFreelancers(freelancersResponse.data.freelancers);
      
      // Load platform stats
      const statsResponse = await api.get('/analytics/platform');
      setPlatformStats(statsResponse.data.analytics);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: CpuChipIcon,
      title: 'AI-Powered Optimization',
      description: 'Smart contracts that adapt based on freelancer performance history and AI analysis.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Transparent',
      description: 'Built on Stellar blockchain with Soroban smart contracts for maximum security.',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      icon: ChartBarIcon,
      title: 'Performance Analytics',
      description: 'Real-time insights into delivery patterns, reliability scores, and optimization opportunities.',
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      icon: UserGroupIcon,
      title: 'Trusted Community',
      description: 'Verified freelancers and clients with transparent rating systems and dispute resolution.',
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium">
                <SparklesIcon className="w-4 h-4 mr-2" />
                AI-Driven Smart Escrow Platform
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Adaptive{' '}
              <span className="gradient-text">Escrow Pro</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Revolutionize freelance payments with AI-powered smart contracts that adapt to freelancer performance. 
              Built on Stellar blockchain for secure, transparent, and intelligent escrow management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton 
                href="/create-escrow" 
                variant="primary"
                size="lg"
                className="text-lg px-8 py-4"
              >
                Create Escrow
              </CTAButton>
              <CTAButton 
                href="/freelancers" 
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-4"
              >
                Browse Freelancers
              </CTAButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Stats */}
      {platformStats && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <StatsCard
                title="Total Escrows"
                value={platformStats.totalEscrows.toLocaleString()}
                icon={GlobeAltIcon}
                color="text-primary-600"
              />
              <StatsCard
                title="Active Users"
                value={platformStats.totalUsers.toLocaleString()}
                icon={UserGroupIcon}
                color="text-success-600"
              />
              <StatsCard
                title="Volume (XLM)"
                value={platformStats.totalVolume.toLocaleString()}
                icon={ChartBarIcon}
                color="text-accent-600"
              />
              <StatsCard
                title="On-Time Rate"
                value={`${platformStats.onTimePercentage.toFixed(1)}%`}
                icon={ShieldCheckIcon}
                color="text-warning-600"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Adaptive Escrow Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of freelance payments with AI-driven contract optimization, 
              blockchain security, and intelligent performance analytics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover p-6 text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Freelancers Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Top Performing Freelancers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our highest-rated freelancers with proven track records and AI-optimized performance.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topFreelancers.map((freelancer, index) => (
                <motion.div
                  key={freelancer.wallet}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <FreelancerCard freelancer={freelancer} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <CTAButton 
              href="/freelancers" 
              variant="primary"
              size="lg"
            >
              View All Freelancers
            </CTAButton>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Experience Smart Escrow?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join thousands of freelancers and clients who trust Adaptive Escrow Pro 
              for secure, intelligent, and fair payment management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton 
                href="/create-escrow" 
                variant="secondary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-50"
              >
                Get Started Now
              </CTAButton>
              <CTAButton 
                href="/learn-more" 
                variant="ghost"
                size="lg"
                className="text-white border-white hover:bg-white/10"
              >
                Learn More
              </CTAButton>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
