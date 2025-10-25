const { Sequelize } = require('sequelize');
const User = require('./User');
const Escrow = require('./Escrow');
const UserStats = require('./UserStats');
const AISuggestion = require('./AISuggestion');

// Database configuration
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'sqlite://./adaptive_escrow.db',
  {
    dialect: 'sqlite',
    storage: './adaptive_escrow.db',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Initialize models
const models = {
  User: User(sequelize),
  Escrow: Escrow(sequelize),
  UserStats: UserStats(sequelize),
  AISuggestion: AISuggestion(sequelize)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
