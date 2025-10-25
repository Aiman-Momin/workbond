'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-primary-600',
  trend,
  description 
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 text-center"
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 ${color} mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {value}
      </h3>
      
      <p className="text-sm text-gray-600 mb-2">
        {title}
      </p>
      
      {description && (
        <p className="text-xs text-gray-500">
          {description}
        </p>
      )}
      
      {trend && (
        <div className={`flex items-center justify-center space-x-1 text-sm ${
          trend.isPositive ? 'text-success-600' : 'text-error-600'
        }`}>
          <span className="font-medium">
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span>vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
