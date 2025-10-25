export interface User {
  id: string;
  wallet: string;
  name: string;
  email?: string;
  role: 'client' | 'freelancer' | 'both';
  rating: number;
  totalEarnings: number;
  totalJobs: number;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  isVerified: boolean;
  lastActive?: string;
  stats?: UserStats;
}

export interface UserStats {
  totalJobsCompleted: number;
  totalJobsLate: number;
  totalDisputes: number;
  totalDisputesWon: number;
  onTimePercentage: number;
  reliabilityScore: number;
  totalEarnings: number;
  totalPenaltiesPaid: number;
  averageDeliveryTime?: number;
}

export interface Escrow {
  id: string;
  contractId: string;
  client: {
    wallet: string;
    name: string;
    rating: number;
  };
  freelancer: {
    wallet: string;
    name: string;
    rating: number;
  };
  amount: number;
  deadline: string;
  gracePeriod: number;
  penaltyRate: number;
  status: 'active' | 'delivered' | 'released' | 'disputed' | 'cancelled';
  deliveredAt?: string;
  releasedAt?: string;
  isOverdue: boolean;
  daysUntilDeadline: number;
  penaltyAmount: number;
  aiOptimized: boolean;
  aiSuggestions?: AISuggestion[];
  createdAt: string;
}

export interface AISuggestion {
  id: string;
  escrowId: string;
  userId: string;
  suggestionType: 'penalty_adjustment' | 'deadline_extension' | 'grace_period_change' | 'contract_optimization';
  aiReasoning: string;
  suggestedPenaltyRate?: number;
  suggestedDeadline?: string;
  suggestedGracePeriod?: number;
  confidenceScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  appliedAt?: string;
  impactScore?: number;
  createdAt: string;
}

export interface PlatformStats {
  totalEscrows: number;
  totalUsers: number;
  totalVolume: number;
  onTimePercentage: number;
  aiOptimizationRate: number;
  statusBreakdown: Record<string, {
    count: number;
    totalAmount: number;
  }>;
}

export interface UserAnalytics {
  totalEscrows: number;
  completedEscrows: number;
  lateDeliveries: number;
  onTimePercentage: number;
  totalEarnings: number;
  totalPenalties: number;
  reliabilityScore: number;
  aiOptimizationRate: number;
  statusBreakdown: Record<string, number>;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SearchFilters {
  query?: string;
  skills?: string[];
  minRating?: number;
  sortBy?: 'rating' | 'earnings' | 'jobs' | 'reliability';
  limit?: number;
  offset?: number;
}

export interface ContractTerms {
  amount: number;
  deadline: string;
  gracePeriod: number;
  penaltyRate: number;
}

export interface PerformanceMetrics {
  onTimePercentage: number;
  reliabilityScore: number;
  totalEarnings: number;
  totalJobs: number;
  averageDeliveryTime?: number;
  disputeRate: number;
}
