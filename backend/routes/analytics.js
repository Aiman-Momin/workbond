const express = require('express');
const { User, Escrow, UserStats } = require('../db/models');
const { Op, fn, col, literal } = require('sequelize');
const router = express.Router();

// Get platform analytics
router.get('/platform', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get escrow statistics
    const escrowStats = await Escrow.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount')), 'total_amount']
      ],
      group: ['status']
    });

    // Get total platform metrics
    const totalEscrows = await Escrow.count();
    const totalUsers = await User.count();
    const totalVolume = await Escrow.sum('amount', {
      where: { status: { [Op.in]: ['delivered', 'released'] } }
    });

    // Get on-time delivery statistics
    const onTimeStats = await Escrow.findAll({
      where: {
        status: { [Op.in]: ['delivered', 'released'] },
        delivered_at: { [Op.ne]: null }
      },
      attributes: [
        [literal('COUNT(CASE WHEN "delivered_at" <= "deadline" THEN 1 END)'), 'on_time'],
        [literal('COUNT(*)'), 'total_delivered']
      ]
    });

    const onTimeCount = onTimeStats[0]?.dataValues?.on_time || 0;
    const totalDelivered = onTimeStats[0]?.dataValues?.total_delivered || 0;
    const onTimePercentage = totalDelivered > 0 ? (onTimeCount / totalDelivered) * 100 : 100;

    // Get AI optimization statistics
    const aiOptimizedCount = await Escrow.count({
      where: { ai_optimized: true }
    });

    const aiOptimizationRate = totalEscrows > 0 ? (aiOptimizedCount / totalEscrows) * 100 : 0;

    res.json({
      success: true,
      analytics: {
        period,
        totalEscrows,
        totalUsers,
        totalVolume: totalVolume || 0,
        onTimePercentage: Math.round(onTimePercentage * 100) / 100,
        aiOptimizationRate: Math.round(aiOptimizationRate * 100) / 100,
        statusBreakdown: escrowStats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: parseInt(stat.dataValues.count),
            totalAmount: parseInt(stat.dataValues.total_amount) || 0
          };
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get user performance analytics
router.get('/user/:wallet', async (req, res) => {
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

    // Get user's escrow statistics
    const escrowStats = await Escrow.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'freelancer' }
      ]
    });

    // Calculate performance metrics
    const totalEscrows = escrowStats.length;
    const completedEscrows = escrowStats.filter(e => 
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

    // Calculate earnings
    const totalEarnings = escrowStats
      .filter(e => e.status === 'released' && e.freelancer_id === user.id)
      .reduce((sum, e) => sum + parseInt(e.amount), 0);

    // Calculate penalties paid
    const totalPenalties = escrowStats
      .filter(e => e.freelancer_id === user.id && e.isOverdue())
      .reduce((sum, e) => sum + e.calculatePenalty(), 0);

    // Get AI optimization stats
    const aiOptimizedEscrows = escrowStats.filter(e => e.ai_optimized).length;
    const aiOptimizationRate = totalEscrows > 0 ? (aiOptimizedEscrows / totalEscrows) * 100 : 0;

    // Get user stats
    const userStats = await UserStats.findOne({ where: { user_id: user.id } });
    const reliabilityScore = userStats ? userStats.reliability_score : 5.0;

    res.json({
      success: true,
      user: {
        wallet: user.wallet_address,
        name: user.name,
        role: user.role,
        rating: user.rating
      },
      analytics: {
        period,
        totalEscrows,
        completedEscrows: completedEscrows.length,
        lateDeliveries,
        onTimePercentage: Math.round(onTimePercentage * 100) / 100,
        totalEarnings,
        totalPenalties,
        reliabilityScore,
        aiOptimizationRate: Math.round(aiOptimizationRate * 100) / 100,
        statusBreakdown: escrowStats.reduce((acc, escrow) => {
          acc[escrow.status] = (acc[escrow.status] || 0) + 1;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Get top performers
router.get('/top-performers', async (req, res) => {
  try {
    const { limit = 10, metric = 'reliability' } = req.query;

    let orderClause;
    switch (metric) {
      case 'earnings':
        orderClause = [['total_earnings', 'DESC']];
        break;
      case 'jobs':
        orderClause = [['total_jobs', 'DESC']];
        break;
      case 'rating':
        orderClause = [['rating', 'DESC']];
        break;
      default:
        orderClause = [['reliability_score', 'DESC']];
    }

    const topPerformers = await User.findAll({
      where: {
        role: { [Op.in]: ['freelancer', 'both'] }
      },
      include: [
        {
          model: UserStats,
          as: 'stats',
          required: true
        }
      ],
      order: orderClause,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      performers: topPerformers.map(user => ({
        wallet: user.wallet_address,
        name: user.name,
        rating: user.rating,
        totalEarnings: user.total_earnings,
        totalJobs: user.total_jobs,
        reliabilityScore: user.stats?.reliability_score || 5.0,
        onTimePercentage: user.stats?.on_time_percentage || 100
      }))
    });

  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
});

// Get AI optimization analytics
router.get('/ai-optimization', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get AI optimization statistics
    const totalEscrows = await Escrow.count({
      where: {
        createdAt: { [Op.gte]: startDate }
      }
    });

    const aiOptimizedEscrows = await Escrow.count({
      where: {
        createdAt: { [Op.gte]: startDate },
        ai_optimized: true
      }
    });

    const optimizationRate = totalEscrows > 0 ? (aiOptimizedEscrows / totalEscrows) * 100 : 0;

    // Get performance comparison
    const regularEscrows = await Escrow.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
        ai_optimized: false,
        status: { [Op.in]: ['delivered', 'released'] }
      }
    });

    const optimizedEscrows = await Escrow.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
        ai_optimized: true,
        status: { [Op.in]: ['delivered', 'released'] }
      }
    });

    // Calculate on-time rates
    const regularOnTime = regularEscrows.filter(escrow => {
      if (!escrow.delivered_at) return false;
      const deliveredAt = new Date(escrow.delivered_at);
      const deadline = new Date(escrow.deadline);
      return deliveredAt <= deadline;
    }).length;

    const optimizedOnTime = optimizedEscrows.filter(escrow => {
      if (!escrow.delivered_at) return false;
      const deliveredAt = new Date(escrow.delivered_at);
      const deadline = new Date(escrow.deadline);
      return deliveredAt <= deadline;
    }).length;

    const regularOnTimeRate = regularEscrows.length > 0 ? 
      (regularOnTime / regularEscrows.length) * 100 : 0;
    
    const optimizedOnTimeRate = optimizedEscrows.length > 0 ? 
      (optimizedOnTime / optimizedEscrows.length) * 100 : 0;

    res.json({
      success: true,
      analytics: {
        period,
        totalEscrows,
        aiOptimizedEscrows,
        optimizationRate: Math.round(optimizationRate * 100) / 100,
        performanceComparison: {
          regular: {
            count: regularEscrows.length,
            onTimeRate: Math.round(regularOnTimeRate * 100) / 100
          },
          optimized: {
            count: optimizedEscrows.length,
            onTimeRate: Math.round(optimizedOnTimeRate * 100) / 100
          }
        },
        improvement: optimizedEscrows.length > 0 && regularEscrows.length > 0 ? 
          Math.round((optimizedOnTimeRate - regularOnTimeRate) * 100) / 100 : 0
      }
    });

  } catch (error) {
    console.error('Error fetching AI optimization analytics:', error);
    res.status(500).json({ error: 'Failed to fetch AI optimization analytics' });
  }
});

// Get trend data for charts
router.get('/trends', async (req, res) => {
  try {
    const { metric = 'escrows', period = '30d' } = req.query;

    // Calculate date range
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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let trendData;
    switch (metric) {
      case 'escrows':
        trendData = await getEscrowTrends(startDate);
        break;
      case 'volume':
        trendData = await getVolumeTrends(startDate);
        break;
      case 'users':
        trendData = await getUserTrends(startDate);
        break;
      default:
        trendData = await getEscrowTrends(startDate);
    }

    res.json({
      success: true,
      trends: {
        metric,
        period,
        data: trendData
      }
    });

  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

// Helper functions for trend data
async function getEscrowTrends(startDate) {
  const trends = await Escrow.findAll({
    where: {
      createdAt: { [Op.gte]: startDate }
    },
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('COUNT', col('id')), 'count']
    ],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']]
  });

  return trends.map(trend => ({
    date: trend.dataValues.date,
    value: parseInt(trend.dataValues.count)
  }));
}

async function getVolumeTrends(startDate) {
  const trends = await Escrow.findAll({
    where: {
      createdAt: { [Op.gte]: startDate },
      status: { [Op.in]: ['delivered', 'released'] }
    },
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('SUM', col('amount')), 'volume']
    ],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']]
  });

  return trends.map(trend => ({
    date: trend.dataValues.date,
    value: parseInt(trend.dataValues.volume) || 0
  }));
}

async function getUserTrends(startDate) {
  const trends = await User.findAll({
    where: {
      createdAt: { [Op.gte]: startDate }
    },
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('COUNT', col('id')), 'count']
    ],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']]
  });

  return trends.map(trend => ({
    date: trend.dataValues.date,
    value: parseInt(trend.dataValues.count)
  }));
}

module.exports = router;
