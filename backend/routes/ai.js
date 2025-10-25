const express = require('express');
const OpenAI = require('openai');
const { User, Escrow, UserStats, AISuggestion } = require('../db/models');
const { Op } = require('sequelize');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get AI suggestions for a user
router.get('/suggest/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { escrowId } = req.query;

    const user = await User.findOne({ where: { wallet_address: wallet } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let escrow = null;
    if (escrowId) {
      escrow = await Escrow.findOne({
        where: { id: escrowId },
        include: [
          { model: User, as: 'client' },
          { model: User, as: 'freelancer' }
        ]
      });
    }

    // Get user performance metrics
    const stats = await UserStats.findOne({ where: { user_id: user.id } });
    const userMetrics = stats ? stats.getPerformanceMetrics() : {
      totalJobs: 0,
      lateJobs: 0,
      onTimePercentage: 100,
      reliabilityScore: 5.0,
      totalEarnings: 0,
      totalPenalties: 0
    };

    // Get recent escrows for context
    const recentEscrows = await Escrow.findAll({
      where: {
        [Op.or]: [
          { client_id: user.id },
          { freelancer_id: user.id }
        ],
        status: { [Op.in]: ['delivered', 'released'] }
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Generate AI suggestions
    const suggestions = await generateAISuggestions(user, userMetrics, recentEscrows, escrow);

    res.json({
      success: true,
      user: {
        wallet: user.wallet_address,
        name: user.name,
        role: user.role,
        rating: user.rating
      },
      metrics: userMetrics,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// Create AI suggestion for specific escrow
router.post('/suggest/:escrowId', async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { userWallet } = req.body;

    const escrow = await Escrow.findOne({
      where: { id: escrowId },
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'freelancer' }
      ]
    });

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const user = await User.findOne({ where: { wallet_address: userWallet } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const stats = await UserStats.findOne({ where: { user_id: user.id } });
    const userMetrics = stats ? stats.getPerformanceMetrics() : {
      totalJobs: 0,
      lateJobs: 0,
      onTimePercentage: 100,
      reliabilityScore: 5.0
    };

    // Generate specific suggestion for this escrow
    const suggestion = await generateEscrowSuggestion(escrow, user, userMetrics);

    if (suggestion) {
      const aiSuggestion = await AISuggestion.create({
        escrow_id: escrow.id,
        user_id: user.id,
        suggestion_type: suggestion.type,
        ai_reasoning: suggestion.reasoning,
        suggested_penalty_rate: suggestion.penaltyRate,
        suggested_deadline: suggestion.deadline,
        suggested_grace_period: suggestion.gracePeriod,
        confidence_score: suggestion.confidence,
        status: 'pending'
      });

      res.status(201).json({
        success: true,
        suggestion: {
          id: aiSuggestion.id,
          type: aiSuggestion.suggestion_type,
          reasoning: aiSuggestion.ai_reasoning,
          changes: aiSuggestion.getSuggestionSummary().changes,
          confidence: aiSuggestion.confidence_score,
          status: aiSuggestion.status,
          createdAt: aiSuggestion.createdAt
        }
      });
    } else {
      res.json({
        success: true,
        message: 'No suggestions available for this escrow',
        suggestion: null
      });
    }

  } catch (error) {
    console.error('Error creating AI suggestion:', error);
    res.status(500).json({ error: 'Failed to create suggestion' });
  }
});

// Approve AI suggestion
router.post('/suggest/:suggestionId/approve', async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { userWallet } = req.body;

    const suggestion = await AISuggestion.findOne({
      where: { id: suggestionId },
      include: [
        { model: Escrow, as: 'escrow' },
        { model: User, as: 'user' }
      ]
    });

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    if (suggestion.user.wallet_address !== userWallet) {
      return res.status(403).json({ error: 'Only the suggestion recipient can approve' });
    }

    if (suggestion.status !== 'pending') {
      return res.status(400).json({ error: 'Suggestion is not pending' });
    }

    // Approve the suggestion
    await suggestion.approve(suggestion.user_id);

    // Apply the changes to the escrow
    const escrow = suggestion.escrow;
    if (suggestion.suggested_penalty_rate) {
      escrow.penalty_rate = suggestion.suggested_penalty_rate;
    }
    if (suggestion.suggested_deadline) {
      escrow.deadline = suggestion.suggested_deadline;
    }
    if (suggestion.suggested_grace_period) {
      escrow.grace_period = suggestion.suggested_grace_period;
    }
    escrow.ai_optimized = true;
    await escrow.save();

    // Mark suggestion as applied
    await suggestion.apply();

    res.json({
      success: true,
      message: 'Suggestion approved and applied',
      suggestion: {
        id: suggestion.id,
        status: suggestion.status,
        appliedAt: suggestion.applied_at
      }
    });

  } catch (error) {
    console.error('Error approving suggestion:', error);
    res.status(500).json({ error: 'Failed to approve suggestion' });
  }
});

// Reject AI suggestion
router.post('/suggest/:suggestionId/reject', async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { userWallet, reason } = req.body;

    const suggestion = await AISuggestion.findOne({
      where: { id: suggestionId },
      include: [{ model: User, as: 'user' }]
    });

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    if (suggestion.user.wallet_address !== userWallet) {
      return res.status(403).json({ error: 'Only the suggestion recipient can reject' });
    }

    if (suggestion.status !== 'pending') {
      return res.status(400).json({ error: 'Suggestion is not pending' });
    }

    await suggestion.reject(reason || 'No reason provided');

    res.json({
      success: true,
      message: 'Suggestion rejected',
      suggestion: {
        id: suggestion.id,
        status: suggestion.status,
        rejectionReason: suggestion.rejection_reason
      }
    });

  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    res.status(500).json({ error: 'Failed to reject suggestion' });
  }
});

// Get user's AI suggestions
router.get('/suggestions/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { status = 'pending' } = req.query;

    const user = await User.findOne({ where: { wallet_address: wallet } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const whereClause = { user_id: user.id };
    if (status !== 'all') {
      whereClause.status = status;
    }

    const suggestions = await AISuggestion.findAll({
      where: whereClause,
      include: [
        { model: Escrow, as: 'escrow' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      suggestions: suggestions.map(suggestion => ({
        id: suggestion.id,
        escrowId: suggestion.escrow_id,
        type: suggestion.suggestion_type,
        reasoning: suggestion.ai_reasoning,
        changes: suggestion.getSuggestionSummary().changes,
        confidence: suggestion.confidence_score,
        status: suggestion.status,
        createdAt: suggestion.createdAt,
        approvedAt: suggestion.approved_at,
        appliedAt: suggestion.applied_at
      }))
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Helper function to generate AI suggestions
async function generateAISuggestions(user, metrics, recentEscrows, specificEscrow) {
  try {
    const prompt = buildAnalysisPrompt(user, metrics, recentEscrows, specificEscrow);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for Adaptive Escrow Pro, a blockchain-based escrow platform. Analyze user performance data and suggest contract optimizations. Be specific and actionable."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    return parseAIResponse(response);

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to rule-based suggestions
    return generateFallbackSuggestions(user, metrics, recentEscrows);
  }
}

// Helper function to generate escrow-specific suggestions
async function generateEscrowSuggestion(escrow, user, metrics) {
  try {
    const prompt = buildEscrowAnalysisPrompt(escrow, user, metrics);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for Adaptive Escrow Pro. Analyze this specific escrow and suggest optimizations based on the freelancer's performance history."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const response = completion.choices[0].message.content;
    return parseEscrowSuggestion(response, escrow);

  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

// Build analysis prompt for general suggestions
function buildAnalysisPrompt(user, metrics, recentEscrows, specificEscrow) {
  return `
Analyze this freelancer's performance and suggest contract optimizations:

User Profile:
- Name: ${user.name}
- Role: ${user.role}
- Rating: ${user.rating}/5
- Total Jobs: ${metrics.totalJobs}
- Late Jobs: ${metrics.lateJobs}
- On-time Percentage: ${metrics.onTimePercentage}%
- Reliability Score: ${metrics.reliabilityScore}/5

Recent Performance:
${recentEscrows.map(escrow => 
  `- Job: ${escrow.amount} XLM, Status: ${escrow.status}, Deadline: ${escrow.deadline}`
).join('\n')}

${specificEscrow ? `
Current Escrow:
- Amount: ${specificEscrow.amount} XLM
- Deadline: ${specificEscrow.deadline}
- Current Penalty Rate: ${specificEscrow.penalty_rate/100}%
- Grace Period: ${specificEscrow.grace_period} hours
` : ''}

Based on this data, suggest specific optimizations for:
1. Penalty rates (current: 3%, suggest 0-10%)
2. Grace periods (current: 24h, suggest 0-168h)
3. Deadlines (if applicable)

Provide reasoning for each suggestion and confidence level (0-1).
Format as JSON with type, reasoning, suggested_penalty_rate, suggested_grace_period, confidence.
  `;
}

// Build analysis prompt for specific escrow
function buildEscrowAnalysisPrompt(escrow, user, metrics) {
  return `
Analyze this specific escrow and suggest optimizations:

Escrow Details:
- Amount: ${escrow.amount} XLM
- Deadline: ${escrow.deadline}
- Current Penalty Rate: ${escrow.penalty_rate/100}%
- Grace Period: ${escrow.grace_period} hours
- Status: ${escrow.status}

Freelancer Performance:
- Total Jobs: ${metrics.totalJobs}
- Late Jobs: ${metrics.lateJobs}
- On-time Percentage: ${metrics.onTimePercentage}%
- Reliability Score: ${metrics.reliabilityScore}/5

Based on the freelancer's history, suggest specific changes to this escrow.
Consider the job size, deadline urgency, and freelancer's track record.
Provide reasoning and confidence level.
Format as JSON with type, reasoning, suggested_penalty_rate, suggested_deadline, suggested_grace_period, confidence.
  `;
}

// Parse AI response into structured suggestions
function parseAIResponse(response) {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
  }
  
  // Fallback to basic suggestions
  return [{
    type: 'penalty_adjustment',
    reasoning: 'Based on performance analysis',
    suggested_penalty_rate: 500,
    confidence: 0.7
  }];
}

// Parse escrow-specific suggestion
function parseEscrowSuggestion(response, escrow) {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestion = JSON.parse(jsonMatch[0]);
      return {
        type: suggestion.type || 'contract_optimization',
        reasoning: suggestion.reasoning || 'AI analysis of performance data',
        penaltyRate: suggestion.suggested_penalty_rate,
        deadline: suggestion.suggested_deadline ? new Date(suggestion.suggested_deadline) : null,
        gracePeriod: suggestion.suggested_grace_period,
        confidence: suggestion.confidence || 0.7
      };
    }
  } catch (error) {
    console.error('Error parsing escrow suggestion:', error);
  }
  
  return null;
}

// Fallback suggestions when AI is unavailable
function generateFallbackSuggestions(user, metrics, recentEscrows) {
  const suggestions = [];
  
  if (metrics.lateJobs > 0 && metrics.onTimePercentage < 80) {
    suggestions.push({
      type: 'penalty_adjustment',
      reasoning: `Freelancer has ${metrics.lateJobs} late deliveries out of ${metrics.totalJobs} jobs (${metrics.onTimePercentage}% on-time). Consider increasing penalty rate to encourage timely delivery.`,
      suggested_penalty_rate: Math.min(500 + (metrics.lateJobs * 100), 1000),
      confidence: 0.8
    });
  }
  
  if (metrics.reliabilityScore < 3.0) {
    suggestions.push({
      type: 'grace_period_change',
      reasoning: `Low reliability score (${metrics.reliabilityScore}/5). Consider reducing grace period to maintain quality standards.`,
      suggested_grace_period: Math.max(12, 24 - (5 - metrics.reliabilityScore) * 3),
      confidence: 0.7
    });
  }
  
  return suggestions;
}

module.exports = router;
