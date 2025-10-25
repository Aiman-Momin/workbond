const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateAISuggestion = async (userMetrics, escrowData, suggestionType) => {
  try {
    const prompt = buildAIPrompt(userMetrics, escrowData, suggestionType);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for Adaptive Escrow Pro. Analyze performance data and suggest contract optimizations. Be specific and actionable."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return parseAIResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateFallbackSuggestion(userMetrics, suggestionType);
  }
};

const buildAIPrompt = (userMetrics, escrowData, suggestionType) => {
  return `
Analyze this freelancer's performance and suggest contract optimizations:

User Metrics:
- Total Jobs: ${userMetrics.totalJobs}
- Late Jobs: ${userMetrics.lateJobs}
- On-time Percentage: ${userMetrics.onTimePercentage}%
- Reliability Score: ${userMetrics.reliabilityScore}/5
- Total Earnings: ${userMetrics.totalEarnings} XLM

Current Escrow:
- Amount: ${escrowData.amount} XLM
- Deadline: ${escrowData.deadline}
- Current Penalty Rate: ${escrowData.penaltyRate/100}%
- Grace Period: ${escrowData.gracePeriod} hours

Suggestion Type: ${suggestionType}

Based on this data, suggest specific optimizations for:
1. Penalty rates (current: ${escrowData.penaltyRate/100}%, suggest 0-10%)
2. Grace periods (current: ${escrowData.gracePeriod}h, suggest 0-168h)
3. Deadlines (if applicable)

Provide reasoning for each suggestion and confidence level (0-1).
Format as JSON with type, reasoning, suggested_penalty_rate, suggested_grace_period, confidence.
  `;
};

const parseAIResponse = (response) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
  }
  
  return generateFallbackSuggestion({}, 'penalty_adjustment');
};

const generateFallbackSuggestion = (userMetrics, suggestionType) => {
  const suggestions = {
    penalty_adjustment: {
      type: 'penalty_adjustment',
      reasoning: `Based on ${userMetrics.onTimePercentage || 100}% on-time delivery rate, adjusting penalty rate to better align with performance.`,
      suggested_penalty_rate: userMetrics.onTimePercentage < 80 ? 500 : 300,
      confidence: 0.7
    },
    deadline_extension: {
      type: 'deadline_extension',
      reasoning: 'Project complexity analysis suggests extending deadline to ensure quality delivery.',
      suggested_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 0.6
    },
    grace_period_change: {
      type: 'grace_period_change',
      reasoning: 'Performance metrics indicate grace period modification would better suit this freelancer\'s work style.',
      suggested_grace_period: userMetrics.reliabilityScore < 3 ? 12 : 24,
      confidence: 0.8
    }
  };

  return suggestions[suggestionType] || suggestions.penalty_adjustment;
};

module.exports = {
  generateAISuggestion,
  buildAIPrompt,
  parseAIResponse,
  generateFallbackSuggestion
};
