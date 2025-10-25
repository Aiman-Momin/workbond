#!/bin/bash

echo "🚀 Starting Adaptive Escrow Pro Demo"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
DATABASE_URL=sqlite://./adaptive_escrow.db
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=
CONTRACT_ID=
JWT_SECRET=demo_jwt_secret
ENCRYPTION_KEY=demo_encryption_key
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AI_CONFIDENCE_THRESHOLD=0.7
AI_SUGGESTION_EXPIRY_HOURS=24
EOF
    echo "✅ Backend .env created"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Create logs directory
mkdir -p backend/logs

# Seed database if needed
if [ ! -f "backend/adaptive_escrow.db" ]; then
    echo "🌱 Seeding database..."
    cd backend
    npm run seed
    cd ..
    echo "✅ Database seeded with demo data"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Starting servers..."
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:3001"
echo "   Health: http://localhost:3001/health"
echo ""
echo "🎯 Demo Features:"
echo "   ✅ No contract ID needed"
echo "   ✅ SQLite database (no PostgreSQL)"
echo "   ✅ Mock blockchain interactions"
echo "   ✅ AI suggestions with fallback"
echo "   ✅ Complete demo data"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers
echo "🚀 Starting backend and frontend..."
npm run dev
