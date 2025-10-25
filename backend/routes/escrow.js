const express = require('express');
const { User, Escrow, UserStats } = require('../db/models');
const { Op } = require('sequelize');
const router = express.Router();

// Create new escrow
router.post('/create', async (req, res) => {
  try {
    const {
      clientWallet,
      freelancerWallet,
      amount,
      deadline,
      gracePeriod = 24,
      penaltyRate = 300
    } = req.body;

    // Validate required fields
    if (!clientWallet || !freelancerWallet || !amount || !deadline) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clientWallet', 'freelancerWallet', 'amount', 'deadline']
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' });
    }

    // Validate penalty rate (in basis points)
    if (penaltyRate < 0 || penaltyRate > 10000) {
      return res.status(400).json({ error: 'Penalty rate must be between 0 and 10000 basis points' });
    }

    // Find or create users
    let [client, freelancer] = await Promise.all([
      User.findOne({ where: { wallet_address: clientWallet } }),
      User.findOne({ where: { wallet_address: freelancerWallet } })
    ]);

    if (!client) {
      client = await User.create({
        wallet_address: clientWallet,
        name: `Client ${clientWallet.slice(0, 8)}`,
        role: 'client'
      });
    }

    if (!freelancer) {
      freelancer = await User.create({
        wallet_address: freelancerWallet,
        name: `Freelancer ${freelancerWallet.slice(0, 8)}`,
        role: 'freelancer'
      });
    }

    // Create escrow
    const escrow = await Escrow.create({
      client_id: client.id,
      freelancer_id: freelancer.id,
      amount: parseInt(amount),
      deadline: deadlineDate,
      grace_period: parseInt(gracePeriod),
      penalty_rate: parseInt(penaltyRate),
      status: 'active'
    });

    // TODO: Deploy smart contract here
    // For now, we'll simulate contract deployment
    const contractId = `CONTRACT_${escrow.id.replace(/-/g, '')}`;
    escrow.contract_id = contractId;
    await escrow.save();

    res.status(201).json({
      success: true,
      escrow: {
        id: escrow.id,
        contractId: escrow.contract_id,
        client: {
          wallet: client.wallet_address,
          name: client.name
        },
        freelancer: {
          wallet: freelancer.wallet_address,
          name: freelancer.name
        },
        amount: escrow.amount,
        deadline: escrow.deadline,
        gracePeriod: escrow.grace_period,
        penaltyRate: escrow.penalty_rate,
        status: escrow.status,
        createdAt: escrow.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating escrow:', error);
    res.status(500).json({ error: 'Failed to create escrow' });
  }
});

// Mark work as delivered
router.post('/:id/deliver', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerWallet } = req.body;

    const escrow = await Escrow.findOne({
      where: { id },
      include: [
        { model: User, as: 'freelancer' }
      ]
    });

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (escrow.freelancer.wallet_address !== freelancerWallet) {
      return res.status(403).json({ error: 'Only the freelancer can mark as delivered' });
    }

    if (escrow.status !== 'active') {
      return res.status(400).json({ error: 'Escrow is not active' });
    }

    escrow.status = 'delivered';
    escrow.delivered_at = new Date();
    await escrow.save();

    // Update freelancer stats
    const stats = await UserStats.findOne({ where: { user_id: escrow.freelancer_id } });
    if (stats) {
      await stats.updateStats();
    }

    res.json({
      success: true,
      message: 'Work marked as delivered',
      escrow: {
        id: escrow.id,
        status: escrow.status,
        deliveredAt: escrow.delivered_at
      }
    });

  } catch (error) {
    console.error('Error marking as delivered:', error);
    res.status(500).json({ error: 'Failed to mark as delivered' });
  }
});

// Release funds
router.post('/:id/release', async (req, res) => {
  try {
    const { id } = req.params;
    const { clientWallet } = req.body;

    const escrow = await Escrow.findOne({
      where: { id },
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'freelancer' }
      ]
    });

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (escrow.client.wallet_address !== clientWallet) {
      return res.status(403).json({ error: 'Only the client can release funds' });
    }

    if (escrow.status !== 'delivered') {
      return res.status(400).json({ error: 'Work must be delivered first' });
    }

    escrow.status = 'released';
    escrow.released_at = new Date();
    await escrow.save();

    // Update user earnings
    const freelancer = await User.findByPk(escrow.freelancer_id);
    freelancer.total_earnings += escrow.amount;
    freelancer.total_jobs += 1;
    await freelancer.save();

    res.json({
      success: true,
      message: 'Funds released successfully',
      escrow: {
        id: escrow.id,
        status: escrow.status,
        releasedAt: escrow.released_at
      }
    });

  } catch (error) {
    console.error('Error releasing funds:', error);
    res.status(500).json({ error: 'Failed to release funds' });
  }
});

// Get escrow details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const escrow = await Escrow.findOne({
      where: { id },
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'freelancer' },
        { model: require('../db/models').AISuggestion, as: 'aiSuggestions' }
      ]
    });

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    res.json({
      success: true,
      escrow: {
        id: escrow.id,
        contractId: escrow.contract_id,
        client: {
          wallet: escrow.client.wallet_address,
          name: escrow.client.name,
          rating: escrow.client.rating
        },
        freelancer: {
          wallet: escrow.freelancer.wallet_address,
          name: escrow.freelancer.name,
          rating: escrow.freelancer.rating
        },
        amount: escrow.amount,
        deadline: escrow.deadline,
        gracePeriod: escrow.grace_period,
        penaltyRate: escrow.penalty_rate,
        status: escrow.status,
        deliveredAt: escrow.delivered_at,
        releasedAt: escrow.released_at,
        isOverdue: escrow.isOverdue(),
        daysUntilDeadline: escrow.getDaysUntilDeadline(),
        penaltyAmount: escrow.calculatePenalty(),
        aiOptimized: escrow.ai_optimized,
        aiSuggestions: escrow.aiSuggestions || []
      }
    });

  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({ error: 'Failed to fetch escrow' });
  }
});

// Get user's escrows
router.get('/user/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    const user = await User.findOne({ where: { wallet_address: wallet } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const whereClause = {
      [Op.or]: [
        { client_id: user.id },
        { freelancer_id: user.id }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const escrows = await Escrow.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'freelancer' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      escrows: escrows.map(escrow => ({
        id: escrow.id,
        contractId: escrow.contract_id,
        client: {
          wallet: escrow.client.wallet_address,
          name: escrow.client.name
        },
        freelancer: {
          wallet: escrow.freelancer.wallet_address,
          name: escrow.freelancer.name
        },
        amount: escrow.amount,
        deadline: escrow.deadline,
        status: escrow.status,
        isOverdue: escrow.isOverdue(),
        daysUntilDeadline: escrow.getDaysUntilDeadline()
      }))
    });

  } catch (error) {
    console.error('Error fetching user escrows:', error);
    res.status(500).json({ error: 'Failed to fetch escrows' });
  }
});

// Update escrow rules (AI-driven)
router.put('/:id/rules', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      newDeadline, 
      newGracePeriod, 
      newPenaltyRate, 
      userWallet 
    } = req.body;

    const escrow = await Escrow.findOne({
      where: { id },
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'freelancer' }
      ]
    });

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    // Verify user is authorized
    const isAuthorized = 
      userWallet === escrow.client.wallet_address || 
      userWallet === escrow.freelancer.wallet_address;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to update rules' });
    }

    if (escrow.status !== 'active') {
      return res.status(400).json({ error: 'Can only update active escrows' });
    }

    // Update fields if provided
    if (newDeadline) {
      const deadlineDate = new Date(newDeadline);
      if (deadlineDate <= new Date()) {
        return res.status(400).json({ error: 'New deadline must be in the future' });
      }
      escrow.deadline = deadlineDate;
    }

    if (newGracePeriod !== undefined) {
      if (newGracePeriod < 0 || newGracePeriod > 168) {
        return res.status(400).json({ error: 'Grace period must be between 0 and 168 hours' });
      }
      escrow.grace_period = newGracePeriod;
    }

    if (newPenaltyRate !== undefined) {
      if (newPenaltyRate < 0 || newPenaltyRate > 10000) {
        return res.status(400).json({ error: 'Penalty rate must be between 0 and 10000 basis points' });
      }
      escrow.penalty_rate = newPenaltyRate;
    }

    escrow.ai_optimized = true;
    await escrow.save();

    res.json({
      success: true,
      message: 'Escrow rules updated successfully',
      escrow: {
        id: escrow.id,
        deadline: escrow.deadline,
        gracePeriod: escrow.grace_period,
        penaltyRate: escrow.penalty_rate,
        aiOptimized: escrow.ai_optimized
      }
    });

  } catch (error) {
    console.error('Error updating rules:', error);
    res.status(500).json({ error: 'Failed to update rules' });
  }
});

module.exports = router;
