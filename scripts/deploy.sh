#!/bin/bash

# Adaptive Escrow Pro - Deployment Script
# This script deploys the application to production

set -e

echo "🚀 Deploying Adaptive Escrow Pro..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Build and deploy with Docker
deploy_docker() {
    print_status "Building and deploying with Docker..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
    
    print_success "Docker deployment completed"
}

# Deploy smart contract
deploy_contract() {
    print_status "Deploying smart contract..."
    
    cd contracts
    
    # Check if Soroban CLI is installed
    if ! command -v soroban &> /dev/null; then
        print_warning "Soroban CLI not found. Installing..."
        cargo install --locked soroban-cli
    fi
    
    # Build contract
    print_status "Building smart contract..."
    soroban contract build
    
    # Deploy to testnet
    print_status "Deploying to Stellar testnet..."
    CONTRACT_ID=$(soroban contract deploy --wasm target/wasm32-unknown-unknown/release/adaptive_escrow.wasm --source-account default --network testnet)
    
    print_success "Smart contract deployed with ID: $CONTRACT_ID"
    print_warning "Please update your .env file with the contract ID: $CONTRACT_ID"
    
    cd ..
}

# Setup production environment
setup_production() {
    print_status "Setting up production environment..."
    
    # Create production .env file
    if [ ! -f .env.production ]; then
        print_status "Creating production .env file..."
        cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production
DATABASE_URL=postgresql://adaptive_escrow:adaptive_escrow_password@postgres:5432/adaptive_escrow
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=your_contract_id_here
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
EOF
        print_warning "Please configure your production .env file"
    fi
    
    print_success "Production environment setup completed"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    docker-compose exec backend npm run seed
    
    print_success "Database migrations completed"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    echo "🌐 Services:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3001"
    echo "   - Health Check: http://localhost:3001/health"
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
    echo ""
    echo "📝 Logs:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Backend logs: docker-compose logs backend"
    echo "   - Frontend logs: docker-compose logs frontend"
    echo ""
    echo "🔧 Management:"
    echo "   - Stop services: docker-compose down"
    echo "   - Restart services: docker-compose restart"
    echo "   - Update services: docker-compose pull && docker-compose up -d"
}

# Main deployment function
main() {
    echo "🌟 Adaptive Escrow Pro Deployment"
    echo "================================="
    
    check_docker
    setup_production
    deploy_docker
    run_migrations
    show_status
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure your production .env file"
    echo "2. Update contract ID in environment variables"
    echo "3. Set up SSL certificates for production"
    echo "4. Configure domain and DNS settings"
    echo ""
    echo "🔒 Security reminders:"
    echo "- Change default passwords"
    echo "- Set up proper SSL certificates"
    echo "- Configure firewall rules"
    echo "- Set up monitoring and logging"
    echo ""
    print_success "Happy deploying! 🚀"
}

# Run main function
main "$@"
