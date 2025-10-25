import { z } from 'zod';

export const createEscrowSchema = z.object({
  clientWallet: z.string().min(1, 'Client wallet is required'),
  freelancerWallet: z.string().min(1, 'Freelancer wallet is required'),
  amount: z.number().min(1, 'Amount must be at least 1 XLM'),
  deadline: z.string().min(1, 'Deadline is required'),
  gracePeriod: z.number().min(0).max(168, 'Grace period must be between 0 and 168 hours'),
  penaltyRate: z.number().min(0).max(10000, 'Penalty rate must be between 0 and 10000 basis points'),
  description: z.string().optional()
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  skills: z.array(z.string()).optional()
});

export const updateEscrowRulesSchema = z.object({
  newDeadline: z.string().optional(),
  newGracePeriod: z.number().min(0).max(168).optional(),
  newPenaltyRate: z.number().min(0).max(10000).optional(),
  userWallet: z.string().min(1, 'User wallet is required')
});

export const approveSuggestionSchema = z.object({
  userWallet: z.string().min(1, 'User wallet is required')
});

export const rejectSuggestionSchema = z.object({
  userWallet: z.string().min(1, 'User wallet is required'),
  reason: z.string().optional()
});

export const searchFreelancersSchema = z.object({
  query: z.string().optional(),
  skills: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

export type CreateEscrowInput = z.infer<typeof createEscrowSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateEscrowRulesInput = z.infer<typeof updateEscrowRulesSchema>;
export type ApproveSuggestionInput = z.infer<typeof approveSuggestionSchema>;
export type RejectSuggestionInput = z.infer<typeof rejectSuggestionSchema>;
export type SearchFreelancersInput = z.infer<typeof searchFreelancersSchema>;
