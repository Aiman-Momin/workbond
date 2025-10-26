# Adaptive Escrow Pro 🚀

> AI-driven smart escrow platform on Stellar blockchain with Soroban smart contracts

Adaptive Escrow Pro revolutionizes freelance payments by combining artificial intelligence with blockchain technology. Our platform analyzes freelancer performance data and automatically suggests contract optimizations, making escrows smarter, fairer, and more efficient.

## 🌟 Features

### 🤖 AI-Powered Optimization
- **Smart Contract Adaptation**: AI analyzes freelancer performance and suggests penalty rate, deadline, and grace period adjustments
- **Performance Analytics**: Real-time insights into delivery patterns, reliability scores, and optimization opportunities
- **Predictive Contract Terms**: Machine learning models predict optimal contract parameters based on historical data

### 🔒 Blockchain Security
- **Stellar Network**: Built on Stellar blockchain for fast, low-cost transactions
- **Soroban Smart Contracts**: Rust-based smart contracts for maximum security and efficiency
- **Transparent Transactions**: All escrow activities are recorded on-chain for complete transparency

### 📊 Advanced Analytics
- **Performance Dashboards**: Comprehensive analytics for freelancers, clients, and platform metrics
- **Trend Analysis**: Historical data visualization with interactive charts
- **AI Optimization Tracking**: Monitor the impact of AI-driven contract improvements

### 🎯 User Experience
- **Modern UI**: Beautiful, responsive interface built with React and TailwindCSS
- **Wallet Integration**: Seamless connection with Stellar-compatible wallets
- **Real-time Updates**: Live notifications and status updates

## 🏗️ Architecture

### Smart Contract (Rust + Soroban)
```
contracts/adaptive_escrow.rs
```
contract address : 71ebeabbd2835cec00dcc6c2617b55bb63badbc8d4613e6f014be11cf21773ec

- **AdaptiveEscrow Contract**: Core escrow functionality with AI-driven rule updates
- **Security Features**: Role-based access control and input validation
- **Event System**: Comprehensive event logging for analytics

### Backend (Node.js + Express)
```
backend/
├── server.js              # Main server file
├── routes/                # API routes
│   ├── escrow.js         # Escrow management
│   ├── ai.js             # AI suggestions
│   ├── analytics.js      # Analytics endpoints
│   └── users.js          # User management
├── db/                   # Database models
│   ├── models/          # Sequelize models
│   └── seed.js          # Sample data
└── package.json
```

### Frontend (React + Next.js)
```
frontend/
├── src/
│   ├── app/             # Next.js app directory
│   ├── components/      # Reusable components
│   └── lib/            # Utilities and API client
├── tailwind.config.js   # TailwindCSS configuration
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Rust 1.70+ (for smart contracts)
- Stellar CLI tools

### 1. Clone Repository
```bash
git clone https://github.com/adaptive-escrow/adaptive-escrow-pro.git
cd adaptive-escrow-pro
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure your .env file with database and API keys
npm run seed  # Populate database with sample data
npm run dev   # Start development server
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Start development server
```

### 4. Smart Contract Deployment
```bash
cd contracts
# Deploy to Stellar Futurenet
soroban contract deploy --wasm adaptive_escrow.wasm --source-account your-account
```

## 📊 Database Schema

### Users Table
- **wallet_address**: Stellar wallet address (primary key)
- **name**: User display name
- **role**: client, freelancer, or both
- **rating**: Overall rating (0-5)
- **total_earnings**: Lifetime earnings in XLM
- **is_verified**: Verification status

### Escrows Table
- **contract_id**: Soroban contract identifier
- **client_id/freelancer_id**: User references
- **amount**: Escrow amount in XLM
- **deadline**: Project deadline
- **penalty_rate**: Penalty rate in basis points
- **status**: active, delivered, released, disputed
- **ai_optimized**: Whether contract was AI-optimized

### AI Suggestions Table
- **suggestion_type**: penalty_adjustment, deadline_extension, etc.
- **ai_reasoning**: AI-generated explanation
- **confidence_score**: AI confidence (0-1)
- **status**: pending, approved, rejected

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/adaptive_escrow

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Stellar Network
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=your_deployed_contract_id

# Security
JWT_SECRET=your_jwt_secret
```

## 🎯 Demo Flow

### 1. Connect Wallet
- Use demo wallet addresses provided in the interface
- Choose between client or freelancer roles

### 2. Create Escrow
- Select a freelancer from the marketplace
- Set amount, deadline, and contract terms
- Deploy smart contract on Stellar testnet

### 3. AI Optimization
- AI analyzes freelancer performance history
- Generates suggestions for contract improvements
- User can approve or reject AI recommendations

### 4. Monitor Performance
- Real-time analytics dashboard
- Track delivery performance and penalties
- View AI optimization impact

## 📈 Analytics & Metrics

### Platform Metrics
- **Total Escrows**: Number of active escrows
- **Volume**: Total transaction volume in XLM
- **On-Time Rate**: Percentage of on-time deliveries
- **AI Optimization Rate**: Percentage of AI-optimized contracts

### User Performance
- **Reliability Score**: AI-calculated performance metric
- **On-Time Percentage**: Historical delivery performance
- **Earnings**: Total lifetime earnings
- **Penalty History**: Track penalties and disputes

## 🤖 AI Features

### Smart Contract Optimization
- **Penalty Rate Adjustment**: AI suggests optimal penalty rates based on freelancer reliability
- **Deadline Extension**: Predictive deadline adjustments for complex projects
- **Grace Period Optimization**: Dynamic grace periods based on performance patterns

### Performance Analysis
- **Delivery Pattern Recognition**: Identify freelancer work patterns
- **Risk Assessment**: Predict potential delays or disputes
- **Contract Success Prediction**: Estimate project success probability

## 🔒 Security

### Smart Contract Security
- **Input Validation**: Comprehensive validation of all inputs
- **Access Control**: Role-based permissions for all functions
- **Event Logging**: Complete audit trail of all transactions
- **Upgrade Safety**: Immutable core functions with controlled updates

### Backend Security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Sanitization**: All inputs validated and sanitized
- **Authentication**: Secure wallet-based authentication
- **CORS Protection**: Configured CORS for frontend security

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start

# Deploy smart contract
soroban contract deploy --wasm adaptive_escrow.wasm --network futurenet
```

### Docker Deployment
```bash
docker-compose up -d
```

## 📚 API Documentation

### Escrow Endpoints
- `POST /api/escrow/create` - Create new escrow
- `GET /api/escrow/:id` - Get escrow details
- `POST /api/escrow/:id/deliver` - Mark work as delivered
- `POST /api/escrow/:id/release` - Release funds

### AI Endpoints
- `GET /api/ai/suggest/:wallet` - Get AI suggestions
- `POST /api/ai/suggest/:id/approve` - Approve suggestion
- `POST /api/ai/suggest/:id/reject` - Reject suggestion

### Analytics Endpoints
- `GET /api/analytics/platform` - Platform metrics
- `GET /api/analytics/user/:wallet` - User performance
- `GET /api/analytics/trends` - Trend data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stellar Development Foundation** for the blockchain infrastructure
- **OpenAI** for AI capabilities
- **React/Next.js** community for the frontend framework
- **TailwindCSS** for the design system

##Demo video : https://drive.google.com/file/d/1MXC9lvdmG8YLuiPlMKTjOHoWfN1mcTOz/view?usp=sharing
