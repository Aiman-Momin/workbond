#!/bin/bash

# Adaptive Escrow Pro - Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Adaptive Escrow Pro..."

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. Please install PostgreSQL 14+ or use Docker."
    fi
    
    # Check Rust (for smart contracts)
    if ! command -v rustc &> /dev/null; then
        print_warning "Rust is not installed. Please install Rust for smart contract development."
    fi
    
    print_success "Requirements check completed"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cp env.example .env
        print_warning "Please configure your .env file with your database and API keys"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    print_success "Backend setup completed"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    print_success "Frontend setup completed"
    cd ..
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v psql &> /dev/null; then
        print_status "Creating database..."
        
        # Create database (adjust connection details as needed)
        createdb adaptive_escrow 2>/dev/null || print_warning "Database might already exist"
        
        print_status "Running database migrations..."
        cd backend
        npm run seed
        cd ..
        
        print_success "Database setup completed"
    else
        print_warning "PostgreSQL not found. Please install PostgreSQL or use Docker."
        print_status "To use Docker: docker-compose up -d postgres"
    fi
}

# Setup smart contracts
setup_contracts() {
    print_status "Setting up smart contracts..."
    
    cd contracts
    
    # Check if Rust is installed
    if command -v rustc &> /dev/null; then
        print_status "Building smart contract..."
        
        # Install Soroban CLI if not present
        if ! command -v soroban &> /dev/null; then
            print_status "Installing Soroban CLI..."
            cargo install --locked soroban-cli
        fi
        
        # Build contract
        soroban contract build
        
        print_success "Smart contract built successfully"
    else
        print_warning "Rust not found. Please install Rust to build smart contracts."
    fi
    
    cd ..
}

# Create development scripts
create_scripts() {
    print_status "Creating development scripts..."
    
    # Backend dev script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Adaptive Escrow Pro Backend..."
cd backend
npm run dev
EOF
    chmod +x start-backend.sh
    
    # Frontend dev script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Adaptive Escrow Pro Frontend..."
cd frontend
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # Full dev script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Adaptive Escrow Pro Development Environment..."

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF
    chmod +x start-dev.sh
    
    print_success "Development scripts created"
}

# Main setup function
main() {
    echo "🌟 Welcome to Adaptive Escrow Pro Setup!"
    echo "========================================"
    
    check_requirements
    setup_backend
    setup_frontend
    setup_database
    setup_contracts
    create_scripts
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure your .env file in the backend directory"
    echo "2. Start the development environment: ./start-dev.sh"
    echo "3. Or start services individually:"
    echo "   - Backend: ./start-backend.sh"
    echo "   - Frontend: ./start-frontend.sh"
    echo ""
    echo "🌐 URLs:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3001"
    echo "   - Health Check: http://localhost:3001/health"
    echo ""
    echo "📚 Documentation: README.md"
    echo "🐳 Docker: docker-compose up -d"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"
