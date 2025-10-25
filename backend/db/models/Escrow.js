const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Escrow = sequelize.define('Escrow', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    contract_id: {
      type: DataTypes.STRING,
      allowNull: true, // Will be set after contract deployment
      unique: true
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    freelancer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    grace_period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 24, // hours
      validate: {
        min: 0,
        max: 168 // 1 week max
      }
    },
    penalty_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 300, // 3% in basis points
      validate: {
        min: 0,
        max: 10000 // 100% max
      }
    },
    status: {
      type: DataTypes.ENUM(
        'active',
        'delivered',
        'released',
        'disputed',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'active'
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    released_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dispute_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ai_optimized: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    original_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    original_penalty_rate: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'escrows',
    timestamps: true,
    indexes: [
      {
        fields: ['client_id']
      },
      {
        fields: ['freelancer_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['deadline']
      },
      {
        fields: ['contract_id']
      }
    ]
  });

  Escrow.associate = (models) => {
    // Escrow belongs to client
    Escrow.belongsTo(models.User, {
      foreignKey: 'client_id',
      as: 'client'
    });

    // Escrow belongs to freelancer
    Escrow.belongsTo(models.User, {
      foreignKey: 'freelancer_id',
      as: 'freelancer'
    });

    // Escrow has many AI suggestions
    Escrow.hasMany(models.AISuggestion, {
      foreignKey: 'escrow_id',
      as: 'aiSuggestions'
    });
  };

  // Instance methods
  Escrow.prototype.isOverdue = function() {
    const now = new Date();
    const graceDeadline = new Date(this.deadline.getTime() + (this.grace_period * 60 * 60 * 1000));
    return now > graceDeadline && this.status === 'active';
  };

  Escrow.prototype.calculatePenalty = function() {
    if (!this.isOverdue()) return 0;
    return Math.floor((this.amount * this.penalty_rate) / 10000);
  };

  Escrow.prototype.getDaysUntilDeadline = function() {
    const now = new Date();
    const diffTime = this.deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return Escrow;
};
