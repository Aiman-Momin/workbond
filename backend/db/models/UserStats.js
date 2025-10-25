const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserStats = sequelize.define('UserStats', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: true
    },
    total_jobs_completed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_jobs_late: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_disputes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_disputes_won: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    average_delivery_time: {
      type: DataTypes.INTEGER, // in hours
      allowNull: true
    },
    on_time_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100.00
    },
    total_earnings: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    total_penalties_paid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    reliability_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5.00,
      validate: {
        min: 0,
        max: 5
      }
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_stats',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['reliability_score']
      },
      {
        fields: ['on_time_percentage']
      }
    ]
  });

  UserStats.associate = (models) => {
    // UserStats belongs to User
    UserStats.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  // Instance methods
  UserStats.prototype.updateStats = async function() {
    const { Escrow } = require('./index');
    
    // Get all completed escrows for this user
    const completedEscrows = await Escrow.findAll({
      where: {
        freelancer_id: this.user_id,
        status: ['delivered', 'released']
      }
    });

    const totalCompleted = completedEscrows.length;
    const lateDeliveries = completedEscrows.filter(escrow => {
      const deliveredAt = new Date(escrow.delivered_at);
      const deadline = new Date(escrow.deadline);
      return deliveredAt > deadline;
    }).length;

    const onTimePercentage = totalCompleted > 0 ? 
      ((totalCompleted - lateDeliveries) / totalCompleted) * 100 : 100;

    // Calculate reliability score (0-5 scale)
    const reliabilityScore = Math.max(0, Math.min(5, 
      (onTimePercentage / 100) * 5
    ));

    // Update stats
    this.total_jobs_completed = totalCompleted;
    this.total_jobs_late = lateDeliveries;
    this.on_time_percentage = onTimePercentage;
    this.reliability_score = reliabilityScore;
    this.last_updated = new Date();

    await this.save();
  };

  UserStats.prototype.getPerformanceMetrics = function() {
    return {
      totalJobs: this.total_jobs_completed,
      lateJobs: this.total_jobs_late,
      onTimePercentage: this.on_time_percentage,
      reliabilityScore: this.reliability_score,
      totalEarnings: this.total_earnings,
      totalPenalties: this.total_penalties_paid,
      averageDeliveryTime: this.average_delivery_time
    };
  };

  return UserStats;
};
