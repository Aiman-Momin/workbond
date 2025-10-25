const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    wallet_address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[A-Z0-9]{56}$/ // Stellar address format
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.ENUM('client', 'freelancer', 'both'),
      allowNull: false,
      defaultValue: 'freelancer'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5.00,
      validate: {
        min: 0,
        max: 5
      }
    },
    total_earnings: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    total_jobs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    skills: {
  type: DataTypes.TEXT,
  allowNull: true,
  defaultValue: '[]',
  get() {
    const raw = this.getDataValue('skills');
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  set(value) {
    this.setDataValue('skills', JSON.stringify(value || []));
  }
},
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_active: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        fields: ['wallet_address']
      },
      {
        fields: ['role']
      },
      {
        fields: ['rating']
      }
    ]
  });

  User.associate = (models) => {
    // User has many escrows as client
    User.hasMany(models.Escrow, {
      foreignKey: 'client_id',
      as: 'clientEscrows'
    });

    // User has many escrows as freelancer
    User.hasMany(models.Escrow, {
      foreignKey: 'freelancer_id',
      as: 'freelancerEscrows'
    });

    // User has one stats record
    User.hasOne(models.UserStats, {
      foreignKey: 'user_id',
      as: 'stats'
    });
  };

  return User;
};
