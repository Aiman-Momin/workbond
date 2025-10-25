'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useUser } from '../app/providers';
import toast from 'react-hot-toast';

export function WalletConnect() {
  const { setUser, setWalletConnected } = useUser();
  const [connecting, setConnecting] = useState(false);

  // Mock wallet addresses for demo
  const demoWallets = [
    {
      address: 'GDEMO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      name: 'Demo Client',
      role: 'client' as const,
      rating: 4.8,
      totalEarnings: 0,
      totalJobs: 0,
      isVerified: true,
    },
    {
      address: 'GFREELANCER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      name: 'Demo Freelancer',
      role: 'freelancer' as const,
      rating: 4.9,
      totalEarnings: 15000,
      totalJobs: 12,
      isVerified: true,
    },
  ];

  const connectWallet = async (wallet: typeof demoWallets[0]) => {
    try {
      setConnecting(true);
      
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set user data
      setUser(wallet);
      setWalletConnected(true);
      
      toast.success(`Connected as ${wallet.name}`);
      
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setUser(null);
    setWalletConnected(false);
    toast.success('Wallet disconnected');
  };

  return (
    <div className="flex items-center space-x-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          // For demo, show wallet selection
          const selectedWallet = demoWallets[0]; // Default to client
          connectWallet(selectedWallet);
        }}
        disabled={connecting}
        className="btn-primary flex items-center space-x-2"
      >
        <WalletIcon className="w-4 h-4" />
        <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </motion.button>
    </div>
  );
}

export function WalletDisconnect() {
  const { setUser, setWalletConnected } = useUser();

  const disconnectWallet = () => {
    setUser(null);
    setWalletConnected(false);
    toast.success('Wallet disconnected');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={disconnectWallet}
      className="btn-ghost text-sm"
    >
      Disconnect
    </motion.button>
  );
}
