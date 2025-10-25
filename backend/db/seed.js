const { faker } = require('@faker-js/faker');
const { User, Escrow, UserStats, AISuggestion } = require('./models');
const { sequelize } = require('./models');

// Sample data for realistic demo
const SAMPLE_FREELANCERS = [
  { name: 'Sarah Chen', skills: ['React', 'Node.js', 'TypeScript'], rating: 4.8 },
  { name: 'Marcus Johnson', skills: ['Python', 'Django', 'PostgreSQL'], rating: 4.6 },
  { name: 'Elena Rodriguez', skills: ['Vue.js', 'PHP', 'MySQL'], rating: 4.9 },
  { name: 'David Kim', skills: ['Angular', 'Java', 'Spring Boot'], rating: 4.7 },
  { name: 'Lisa Wang', skills: ['React Native', 'Flutter', 'Firebase'], rating: 4.5 },
  { name: 'Alex Thompson', skills: ['Solidity', 'Web3', 'Ethereum'], rating: 4.8 },
  { name: 'Maria Garcia', skills: ['Python', 'Machine Learning', 'TensorFlow'], rating: 4.9 },
  { name: 'James Wilson', skills: ['Go', 'Docker', 'Kubernetes'], rating: 4.6 },
  { name: 'Anna Petrov', skills: ['Rust', 'Blockchain', 'Substrate'], rating: 4.7 },
  { name: 'Tom Anderson', skills: ['Swift', 'iOS', 'Xcode'], rating: 4.8 }
];

const SAMPLE_CLIENTS = [
  { name: 'TechCorp Inc.', rating: 4.9 },
  { name: 'StartupXYZ', rating: 4.7 },
  { name: 'Digital Agency Pro', rating: 4.8 },
  { name: 'Blockchain Ventures', rating: 4.9 },
  { name: 'Web Solutions Ltd', rating: 4.6 }
];

const JOB_TYPES = [
  'Website Development',
  'Mobile App Development',
  'Smart Contract Development',
  'UI/UX Design',
  'Backend API Development',
  'Database Design',
  'DevOps Setup',
  'Security Audit',
  'Code Review',
  'Technical Consulting'
];

// Generate realistic wallet addresses
function generateStellarAddress() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'G';
  for (let i = 0; i < 55; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate realistic performance data
function generatePerformanceData(totalJobs) {
  const lateJobs = Math.floor(totalJobs * (0.1 + Math.random() * 0.3)); // 10-40% late
  const disputes = Math.floor(totalJobs * (0.02 + Math.random() * 0.08)); // 2-10% disputes
  const onTimePercentage = ((totalJobs - lateJobs) / totalJobs) * 100;
  const reliabilityScore = Math.max(1.0, Math.min(5.0, (onTimePercentage / 100) * 5));
  
  return {
    totalJobsCompleted: totalJobs,
    totalJobsLate: lateJobs,
    totalDisputes: disputes,
    totalDisputesWon: Math.floor(disputes * (0.6 + Math.random() * 0.3)), // 60-90% won
    onTimePercentage: Math.round(onTimePercentage * 100) / 100,
    reliabilityScore: Math.round(reliabilityScore * 100) / 100,
    averageDeliveryTime: Math.floor(24 + Math.random() * 168) // 1-8 days
  };
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await AISuggestion.destroy({ where: {} });
    await Escrow.destroy({ where: {} });
    await UserStats.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('✅ Cleared existing data');

    // Create freelancers
    const freelancers = [];
    for (let i = 0; i < SAMPLE_FREELANCERS.length; i++) {
      const freelancerData = SAMPLE_FREELANCERS[i];
      const totalJobs = Math.floor(Math.random() * 50) + 5; // 5-55 jobs
      const performance = generatePerformanceData(totalJobs);
      
      const freelancer = await User.create({
        wallet_address: generateStellarAddress(),
        name: freelancerData.name,
        email: faker.internet.email(),
        role: 'freelancer',
        rating: freelancerData.rating,
        total_earnings: Math.floor(Math.random() * 100000) + 10000, // 10k-110k
        total_jobs: totalJobs,
        profile_image: `https://i.pravatar.cc/150?img=${i + 1}`,
        bio: faker.lorem.paragraph(),
        skills: freelancerData.skills,
        is_verified: Math.random() > 0.3, // 70% verified
        last_active: faker.date.recent(30)
      });

      // Create user stats
      await UserStats.create({
        user_id: freelancer.id,
        total_jobs_completed: performance.totalJobsCompleted,
        total_jobs_late: performance.totalJobsLate,
        total_disputes: performance.totalDisputes,
        total_disputes_won: performance.totalDisputesWon,
        on_time_percentage: performance.onTimePercentage,
        reliability_score: performance.reliabilityScore,
        average_delivery_time: performance.averageDeliveryTime,
        total_earnings: freelancer.total_earnings,
        total_penalties_paid: Math.floor(freelancer.total_earnings * 0.02) // 2% penalties
      });

      freelancers.push(freelancer);
    }

    console.log(`✅ Created ${freelancers.length} freelancers`);

    // Create clients
    const clients = [];
    for (let i = 0; i < SAMPLE_CLIENTS.length; i++) {
      const clientData = SAMPLE_CLIENTS[i];
      
      const client = await User.create({
        wallet_address: generateStellarAddress(),
        name: clientData.name,
        email: faker.internet.email(),
        role: 'client',
        rating: clientData.rating,
        total_earnings: 0,
        total_jobs: 0,
        profile_image: `https://i.pravatar.cc/150?img=${i + 20}`,
        bio: faker.company.catchPhrase(),
        skills: [],
        is_verified: true,
        last_active: faker.date.recent(7)
      });

      clients.push(client);
    }

    console.log(`✅ Created ${clients.length} clients`);

    // Create escrows
    const escrows = [];
    for (let i = 0; i < 25; i++) {
      const freelancer = freelancers[Math.floor(Math.random() * freelancers.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      const amount = Math.floor(Math.random() * 5000) + 500; // 500-5500 XLM
      const deadline = faker.date.future(0.5); // Within 6 months
      const gracePeriod = [12, 24, 48, 72][Math.floor(Math.random() * 4)]; // 12-72 hours
      const penaltyRate = [200, 300, 400, 500][Math.floor(Math.random() * 4)]; // 2-5%
      
      const statuses = ['active', 'delivered', 'released', 'disputed'];
      const weights = [0.3, 0.4, 0.25, 0.05]; // More delivered/released than active
      const status = weightedRandom(statuses, weights);
      
      let deliveredAt = null;
      let releasedAt = null;
      
      if (['delivered', 'released'].includes(status)) {
        deliveredAt = faker.date.between(deadline, new Date());
      }
      if (status === 'released') {
        releasedAt = faker.date.between(deliveredAt || new Date(), new Date());
      }

      const escrow = await Escrow.create({
        client_id: client.id,
        freelancer_id: freelancer.id,
        amount: amount,
        deadline: deadline,
        grace_period: gracePeriod,
        penalty_rate: penaltyRate,
        status: status,
        delivered_at: deliveredAt,
        released_at: releasedAt,
        ai_optimized: Math.random() > 0.6, // 40% AI optimized
        original_deadline: deadline,
        original_penalty_rate: penaltyRate
      });

      escrows.push(escrow);
    }

    console.log(`✅ Created ${escrows.length} escrows`);

    // Create AI suggestions for some escrows
    const aiSuggestions = [];
    for (let i = 0; i < 10; i++) {
      const escrow = escrows[Math.floor(Math.random() * escrows.length)];
      const user = Math.random() > 0.5 ? escrow.client : escrow.freelancer;
      
      const suggestionTypes = ['penalty_adjustment', 'deadline_extension', 'grace_period_change'];
      const suggestionType = suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)];
      
      let suggestedPenaltyRate = null;
      let suggestedDeadline = null;
      let suggestedGracePeriod = null;
      
      switch (suggestionType) {
        case 'penalty_adjustment':
          suggestedPenaltyRate = escrow.penalty_rate + (Math.random() > 0.5 ? 100 : -100);
          break;
        case 'deadline_extension':
          suggestedDeadline = new Date(escrow.deadline.getTime() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000);
          break;
        case 'grace_period_change':
          suggestedGracePeriod = escrow.grace_period + (Math.random() > 0.5 ? 12 : -12);
          break;
      }

      const suggestion = await AISuggestion.create({
        escrow_id: escrow.id,
        user_id: user.id,
        suggestion_type: suggestionType,
        ai_reasoning: generateAIReasoning(suggestionType, escrow, user),
        suggested_penalty_rate: suggestedPenaltyRate,
        suggested_deadline: suggestedDeadline,
        suggested_grace_period: suggestedGracePeriod,
        confidence_score: 0.6 + Math.random() * 0.4, // 0.6-1.0
        status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
        impact_score: Math.random() * 100
      });

      aiSuggestions.push(suggestion);
    }

    console.log(`✅ Created ${aiSuggestions.length} AI suggestions`);

    // Update user stats based on escrow data
    for (const freelancer of freelancers) {
      const freelancerEscrows = escrows.filter(e => e.freelancer_id === freelancer.id);
      const completedEscrows = freelancerEscrows.filter(e => ['delivered', 'released'].includes(e.status));
      
      if (completedEscrows.length > 0) {
        const stats = await UserStats.findOne({ where: { user_id: freelancer.id } });
        if (stats) {
          await stats.updateStats();
        }
      }
    }

    console.log('✅ Updated user statistics');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${freelancers.length} freelancers`);
    console.log(`   - ${clients.length} clients`);
    console.log(`   - ${escrows.length} escrows`);
    console.log(`   - ${aiSuggestions.length} AI suggestions`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Helper function for weighted random selection
function weightedRandom(items, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

// Generate realistic AI reasoning
function generateAIReasoning(type, escrow, user) {
  const reasons = {
    penalty_adjustment: [
      `Based on ${user.name}'s performance history, adjusting penalty rate to better align with their reliability score.`,
      `Freelancer has shown consistent delivery patterns. Penalty rate adjustment recommended to optimize contract terms.`,
      `Performance analysis indicates penalty rate should be modified to match freelancer's track record.`
    ],
    deadline_extension: [
      `Project complexity analysis suggests extending deadline to ensure quality delivery.`,
      `Based on freelancer's average delivery time, deadline extension would improve success probability.`,
      `Historical data shows this type of project benefits from additional time allocation.`
    ],
    grace_period_change: [
      `Freelancer's reliability score suggests adjusting grace period for optimal contract performance.`,
      `Performance metrics indicate grace period modification would better suit this freelancer's work style.`,
      `Based on delivery patterns, grace period adjustment recommended for contract optimization.`
    ]
  };

  const typeReasons = reasons[type] || reasons.penalty_adjustment;
  return typeReasons[Math.floor(Math.random() * typeReasons.length)];
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
