'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { FreelancerCard } from '../../components/FreelancerCard';
import { api } from '../../lib/api';

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const skills = [
    'React', 'Node.js', 'TypeScript', 'Python', 'Django', 'PostgreSQL',
    'Vue.js', 'PHP', 'MySQL', 'Angular', 'Java', 'Spring Boot',
    'React Native', 'Flutter', 'Firebase', 'Solidity', 'Web3', 'Ethereum',
    'Machine Learning', 'TensorFlow', 'Go', 'Docker', 'Kubernetes',
    'Rust', 'Blockchain', 'Substrate', 'Swift', 'iOS', 'Xcode'
  ];

  useEffect(() => {
    loadFreelancers();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [freelancers, searchQuery, sortBy, minRating, selectedSkills]);

  const loadFreelancers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/top/freelancers?limit=50');
      setFreelancers(response.data.freelancers);
    } catch (error) {
      console.error('Error loading freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFreelancers = () => {
    let filtered = [...freelancers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(freelancer =>
        freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freelancer.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freelancer.skills?.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Rating filter
    filtered = filtered.filter(freelancer => freelancer.rating >= minRating);

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(freelancer =>
        selectedSkills.every(skill => freelancer.skills?.includes(skill))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'earnings':
          return b.totalEarnings - a.totalEarnings;
        case 'jobs':
          return b.totalJobs - a.totalJobs;
        case 'reliability':
          return (b.stats?.reliabilityScore || 0) - (a.stats?.reliabilityScore || 0);
        default:
          return 0;
      }
    });

    setFilteredFreelancers(filtered);
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Top Freelancers</h1>
          <p className="text-xl text-gray-600">Discover skilled professionals with proven track records</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search freelancers by name, skills, or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input w-full"
              >
                <option value="rating">Sort by Rating</option>
                <option value="earnings">Sort by Earnings</option>
                <option value="jobs">Sort by Jobs</option>
                <option value="reliability">Sort by Reliability</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 space-y-4">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating: {minRating.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.0</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredFreelancers.length} of {freelancers.length} freelancers
          </p>
          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Freelancer Grid */}
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
        ) : filteredFreelancers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFreelancers.map((freelancer, index) => (
              <motion.div
                key={freelancer.wallet}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FreelancerCard freelancer={freelancer} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FunnelIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setMinRating(0);
                setSelectedSkills([]);
              }}
              className="btn-primary"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
