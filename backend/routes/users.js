const express = require('express');
const { User, UserStats, Escrow } = require('../db/models');
const { Op } = require('sequelize');
const router = express.Router();

// Get user profile
router.get('/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;

    const user = await User.findOne({
      where: { wallet_address: wallet },
      include: [
        { model: UserStats, as: 'stats' }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        wallet: user.wallet_address,
        name: user.name,
        email: user.email,
        role: user.role,
        rating: user.rating,
        totalEarnings: user.total_earnings,
        totalJobs: user.total_jobs,
        profileImage: user.profile_image,
        bio: user.bio,
        skills: user.skills,
        isVerified: user.is_verified,
        lastActive: user.last_active,
        stats: user.stats ? user.stats.getPerformanceMetrics() : null
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { name, email, bio, skills } = req.body;

    const user = await User.findOne({ where: { wallet_address: wallet } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        wallet: user.wallet_address,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user's performance metrics
router.get('/:wallet/performance', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { period = 'all' } = req.query;

    const user = await User.findOne({ where: { wallet_address: wallet } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate date range
    let whereClause = {
      [Op.or]: [
        { client_id: user.id },
        { freelancer_id: user.id }
      ]
    };

    if (period !== 'all') {
      const now = new Date();
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }
      if (startDate) {
        whereClause.createdAt = { [Op.gte]: startDate };
      }
    }

    // Get user's escrows
    const escrows = await Escrow.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'freelancer' }
      ]
    });

    // Calculate performance metrics
    const totalEscrows = escrows.length;
    const completedEscrows = escrows.filter(e => 
      ['delivered', 'released'].includes(e.status)
    );
    
    const lateDeliveries = completedEscrows.filter(escrow => {
      if (!escrow.delivered_at) return false;
      const deliveredAt = new Date(escrow.delivered_at);
      const deadline = new Date(escrow.deadline);
      return deliveredAt > deadline;
    }).length;

    const onTimePercentage = completedEscrows.length > 0 ? 
      ((completedEscrows.length - lateDeliveries) / completedEscrows.length) * 100 : 100;

    // Calculate earnings and penalties
    const totalEarnings = escrows
      .filter(e => e.status === 'released' && e.freelancer_id === user.id)
      .reduce((sum, e) => sum + parseInt(e.amount), 0);

    const totalPenalties = escrows
      .filter(e => e.freelancer_id === user.id && e.isOverdue())
      .reduce((sum, e) => sum + e.calculatePenalty(), 0);

    // Get AI optimization stats
    const aiOptimizedEscrows = escrows.filter(e => e.ai_optimized).length;
    const aiOptimizationRate = totalEscrows > 0 ? (aiOptimizedEscrows / totalEscrows) * 100 : 0;

    res.json({
      success: true,
      performance: {
        period,
        totalEscrows,
        completedEscrows: completedEscrows.length,
        lateDeliveries,
        onTimePercentage: Math.round(onTimePercentage * 100) / 100,
        totalEarnings,
        totalPenalties,
        aiOptimizationRate: Math.round(aiOptimizationRate * 100) / 100,
        reliabilityScore: user.rating
      }
    });

  } catch (error) {
    console.error('Error fetching user performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get top freelancers
router.get('/top/freelancers', async (req, res) => {
  try {
    const { limit = 10, sortBy = 'rating' } = req.query;

    let orderClause;
    switch (sortBy) {
      case 'earnings':
        orderClause = [['total_earnings', 'DESC']];
        break;
      case 'jobs':
        orderClause = [['total_jobs', 'DESC']];
        break;
      case 'reliability':
        orderClause = [['rating', 'DESC']];
        break;
      default:
        orderClause = [['rating', 'DESC']];
    }

    const freelancers = await User.findAll({
      where: {
        role: { [Op.in]: ['freelancer', 'both'] }
      },
      include: [
        { model: UserStats, as: 'stats' }
      ],
      order: orderClause,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      freelancers: freelancers.map(user => ({
        wallet: user.wallet_address,
        name: user.name,
        rating: user.rating,
        totalEarnings: user.total_earnings,
        totalJobs: user.total_jobs,
        profileImage: user.profile_image,
        bio: user.bio,
        skills: user.skills,
        isVerified: user.is_verified,
        stats: user.stats ? {
          reliabilityScore: user.stats.reliability_score,
          onTimePercentage: user.stats.on_time_percentage,
          totalJobsCompleted: user.stats.total_jobs_completed,
          totalJobsLate: user.stats.total_jobs_late
        } : null
      }))
    });

  } catch (error) {
    console.error('Error fetching top freelancers:', error);
    res.status(500).json({ error: 'Failed to fetch freelancers' });
  }
});

// Search freelancers
router.get('/search/freelancers', async (req, res) => {
  try {
    const { 
      query = '', 
      skills = '', 
      minRating = 0, 
      limit = 20, 
      offset = 0 
    } = req.query;

    const whereClause = {
      role: { [Op.in]: ['freelancer', 'both'] },
      rating: { [Op.gte]: minRating }
    };

    // Add search conditions
    if (query) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { bio: { [Op.iLike]: `%${query}%` } }
      ];
    }

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      whereClause.skills = { [Op.overlap]: skillArray };
    }

    const freelancers = await User.findAndCountAll({
      where: whereClause,
      include: [
        { model: UserStats, as: 'stats' }
      ],
      order: [['rating', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      freelancers: freelancers.rows.map(user => ({
        wallet: user.wallet_address,
        name: user.name,
        rating: user.rating,
        totalEarnings: user.total_earnings,
        totalJobs: user.total_jobs,
        profileImage: user.profile_image,
        bio: user.bio,
        skills: user.skills,
        isVerified: user.is_verified,
        stats: user.stats ? {
          reliabilityScore: user.stats.reliability_score,
          onTimePercentage: user.stats.on_time_percentage
        } : null
      })),
      pagination: {
        total: freelancers.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < freelancers.count
      }
    });

  } catch (error) {
    console.error('Error searching freelancers:', error);
    res.status(500).json({ error: 'Failed to search freelancers' });
  }
});

// Update user stats (called internally)
router.post('/:wallet/update-stats', async (req, res) => {
  try {
    const { wallet } = req.params;

    const user = await User.findOne({ where: { wallet_address: wallet } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get or create user stats
    let userStats = await UserStats.findOne({ where: { user_id: user.id } });
    if (!userStats) {
      userStats = await UserStats.create({ user_id: user.id });
    }

    // Update stats
    await userStats.updateStats();

    res.json({
      success: true,
      message: 'User stats updated successfully',
      stats: userStats.getPerformanceMetrics()
    });

  } catch (error) {
    console.error('Error updating user stats:', error);
    res.status(500).json({ error: 'Failed to update user stats' });
  }
});

module.exports = router;
