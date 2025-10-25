const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AISuggestion = sequelize.define('AISuggestion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    escrow_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'escrows',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    suggestion_type: {
      type: DataTypes.ENUM(
        'penalty_adjustment',
        'deadline_extension',
        'grace_period_change',
        'contract_optimization'
      ),
      allowNull: false
    },
    ai_reasoning: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    suggested_penalty_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 10000
      }
    },
    suggested_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    suggested_grace_period: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 168
      }
    },
    confidence_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 1
      }
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'approved',
        'rejected',
        'expired'
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    applied_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    impact_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    }
  }, {
    tableName: 'ai_suggestions',
    timestamps: true,
    indexes: [
      {
        fields: ['escrow_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['suggestion_type']
      },
      {
        fields: ['confidence_score']
      }
    ]
  });

  AISuggestion.associate = (models) => {
    // AISuggestion belongs to Escrow
    AISuggestion.belongsTo(models.Escrow, {
      foreignKey: 'escrow_id',
      as: 'escrow'
    });

    // AISuggestion belongs to User (who it was suggested to)
    AISuggestion.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // AISuggestion approved by User
    AISuggestion.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver'
    });
  };

  // Instance methods
  AISuggestion.prototype.approve = async function(approvedBy) {
    this.status = 'approved';
    this.approved_by = approvedBy;
    this.approved_at = new Date();
    await this.save();
  };

  AISuggestion.prototype.reject = async function(rejectionReason) {
    this.status = 'rejected';
    this.rejection_reason = rejectionReason;
    await this.save();
  };

  AISuggestion.prototype.apply = async function() {
    this.status = 'applied';
    this.applied_at = new Date();
    await this.save();
  };

  AISuggestion.prototype.isExpired = function() {
    const now = new Date();
    const createdAt = new Date(this.createdAt);
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
    return hoursSinceCreation > 24; // Expires after 24 hours
  };

  AISuggestion.prototype.getSuggestionSummary = function() {
    const changes = [];
    
    if (this.suggested_penalty_rate) {
      changes.push(`Penalty rate: ${this.suggested_penalty_rate / 100}%`);
    }
    
    if (this.suggested_deadline) {
      changes.push(`New deadline: ${this.suggested_deadline.toLocaleDateString()}`);
    }
    
    if (this.suggested_grace_period) {
      changes.push(`Grace period: ${this.suggested_grace_period} hours`);
    }

    return {
      type: this.suggestion_type,
      changes: changes,
      reasoning: this.ai_reasoning,
      confidence: this.confidence_score,
      status: this.status
    };
  };

  return AISuggestion;
};
