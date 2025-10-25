// Mock blockchain utilities for demo purposes
// In production, this would integrate with actual Stellar/Soroban SDK

const generateContractId = () => {
  return `CONTRACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const simulateContractDeployment = async (escrowData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    contractId: generateContractId(),
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    status: 'deployed',
    network: 'testnet'
  };
};

const simulateContractCall = async (contractId, method, params) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    gasUsed: Math.floor(Math.random() * 100000) + 50000,
    status: 'success'
  };
};

const validateStellarAddress = (address) => {
  // Basic Stellar address validation
  return /^[A-Z0-9]{56}$/.test(address);
};

const formatXLMAmount = (amount) => {
  return `${amount} XLM`;
};

const calculatePenalty = (amount, penaltyRate, isOverdue) => {
  if (!isOverdue) return 0;
  return Math.floor((amount * penaltyRate) / 10000);
};

module.exports = {
  generateContractId,
  simulateContractDeployment,
  simulateContractCall,
  validateStellarAddress,
  formatXLMAmount,
  calculatePenalty
};
