'use client';

import { motion } from 'framer-motion';
import { 
  StarIcon, 
  CheckBadgeIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';

interface FreelancerCardProps {
  freelancer: {
    wallet: string;
    name: string;
    rating: number;
    totalEarnings: number;
    totalJobs: number;
    profileImage?: string;
    bio?: string;
    skills?: string[];
    isVerified: boolean;
    stats?: {
      reliabilityScore: number;
      onTimePercentage: number;
      totalJobsCompleted: number;
      totalJobsLate: number;
    };
  };
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const {
    name,
    rating,
    totalEarnings,
    totalJobs,
    profileImage,
    bio,
    skills = [],
    isVerified,
    stats
  } = freelancer;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-hover p-6"
    >
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <img
            src={profileImage || `https://i.pravatar.cc/150?img=${Math.random()}`}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {isVerified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
              <CheckBadgeIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {name}
            </h3>
            {isVerified && (
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">
                Verified
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {bio}
        </p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span>Earnings</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {totalEarnings.toLocaleString()} XLM
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-1">
            <BriefcaseIcon className="w-4 h-4" />
            <span>Jobs</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {totalJobs}
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Reliability Score</span>
            <span className="font-medium text-gray-900">
              {stats.reliabilityScore.toFixed(1)}/5.0
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">On-Time Delivery</span>
            <span className="font-medium text-gray-900">
              {stats.onTimePercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.onTimePercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Link
          href={`/freelancer/${freelancer.wallet}`}
          className="btn-primary flex-1 text-center text-sm"
        >
          View Profile
        </Link>
        <Link
          href={`/create-escrow?freelancer=${freelancer.wallet}`}
          className="btn-secondary flex-1 text-center text-sm"
        >
          Hire Now
        </Link>
      </div>
    </motion.div>
  );
}
