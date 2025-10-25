export const APP_CONFIG = {
  name: 'Adaptive Escrow Pro',
  description: 'AI-driven smart escrow platform on Stellar blockchain',
  version: '1.0.0',
  author: 'Adaptive Escrow Pro Team',
  url: 'https://adaptive-escrow-pro.com'
};

export const API_ENDPOINTS = {
  base: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  health: '/health',
  users: '/users',
  escrow: '/escrow',
  ai: '/ai',
  analytics: '/analytics'
};

export const ESCROW_STATUS = {
  ACTIVE: 'active',
  DELIVERED: 'delivered',
  RELEASED: 'released',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled'
} as const;

export const USER_ROLES = {
  CLIENT: 'client',
  FREELANCER: 'freelancer',
  BOTH: 'both'
} as const;

export const AI_SUGGESTION_TYPES = {
  PENALTY_ADJUSTMENT: 'penalty_adjustment',
  DEADLINE_EXTENSION: 'deadline_extension',
  GRACE_PERIOD_CHANGE: 'grace_period_change',
  CONTRACT_OPTIMIZATION: 'contract_optimization'
} as const;

export const SUGGESTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
} as const;

export const NETWORK_CONFIG = {
  stellar: {
    testnet: 'https://soroban-testnet.stellar.org',
    mainnet: 'https://horizon.stellar.org'
  }
};

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
  PAGINATION_LIMIT: 20
};

export const VALIDATION_RULES = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  MIN_PENALTY_RATE: 0,
  MAX_PENALTY_RATE: 10000,
  MIN_GRACE_PERIOD: 0,
  MAX_GRACE_PERIOD: 168,
  MIN_RATING: 0,
  MAX_RATING: 5
};
