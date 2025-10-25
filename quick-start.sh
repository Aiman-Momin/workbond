#!/bin/bash

echo "🚀 Quick Start - Adaptive Escrow Pro"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install

# Create .env file for backend
cat > .env << EOF
# Database Configuration (using SQLite for simplicity)
DATABASE_URL=sqlite://./adaptive_escrow.db

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OpenAI Configuration (optional - will use fallback if not provided)
OPENAI_API_KEY=

# Stellar/Soroban Configuration (optional - will use mock if not provided)
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Configuration
AI_CONFIDENCE_THRESHOLD=0.7
AI_SUGGESTION_EXPIRY_HOURS=24
EOF

echo "✅ Backend .env created"

# Create logs directory
mkdir -p logs

# Seed database
echo "🌱 Seeding database..."
npm run seed

echo "✅ Backend setup complete"

# Setup frontend
echo "🎨 Setting up frontend..."
cd ../frontend
npm install

echo "✅ Frontend setup complete"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or use the root script: npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:3001"
echo "   Health: http://localhost:3001/health"
echo ""
echo "🎯 Demo Features:"
echo "   ✅ Works without contract ID"
echo "   ✅ Uses SQLite database (no PostgreSQL needed)"
echo "   ✅ Mock blockchain interactions"
echo "   ✅ AI suggestions with fallback"
echo "   ✅ Complete demo data"
echo ""
echo "Happy coding! 🚀"
