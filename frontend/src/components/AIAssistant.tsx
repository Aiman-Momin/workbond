'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CpuChipIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useUser, useAI } from '../app/providers';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface AISuggestion {
  id: string;
  type: string;
  reasoning: string;
  changes: string[];
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export function AIAssistant() {
  const { user } = useUser();
  const { suggestions, setSuggestions, addSuggestion } = useAI();
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState<AISuggestion | null>(null);

  useEffect(() => {
    if (user && user.wallet) {
      loadSuggestions();
    }
  }, [user]);

  const loadSuggestions = async () => {
    if (!user?.wallet) return;
    
    try {
      const response = await api.get(`/ai/suggestions/${user.wallet}`);
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const generateSuggestion = async () => {
    if (!user?.wallet) return;
    
    try {
      setIsThinking(true);
      const response = await api.get(`/ai/suggest/${user.wallet}`);
      
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        const suggestion = response.data.suggestions[0];
        setNewSuggestion(suggestion);
        addSuggestion(suggestion);
        toast.success('New AI suggestion generated!');
      } else {
        toast('No suggestions available at this time');
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
      toast.error('Failed to generate suggestion');
    } finally {
      setIsThinking(false);
    }
  };

  const approveSuggestion = async (suggestionId: string) => {
    try {
      await api.post(`/ai/suggest/${suggestionId}/approve`, {
        userWallet: user?.wallet
      });
      
      // Update local state
      setSuggestions(suggestions?.map(s => 
        s.id === suggestionId ? { ...s, status: 'approved' } : s
      ) || []);
      
      toast.success('Suggestion approved and applied!');
    } catch (error) {
      console.error('Error approving suggestion:', error);
      toast.error('Failed to approve suggestion');
    }
  };

  const rejectSuggestion = async (suggestionId: string) => {
    try {
      await api.post(`/ai/suggest/${suggestionId}/reject`, {
        userWallet: user?.wallet,
        reason: 'User rejected'
      });
      
      // Update local state
      setSuggestions(suggestions?.map(s => 
        s.id === suggestionId ? { ...s, status: 'rejected' } : s
      ) || []);
      
      toast.success('Suggestion rejected');
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      toast.error('Failed to reject suggestion');
    }
  };

  const pendingSuggestions = suggestions?.filter(s => s.status === 'pending') || [];

  return (
    <>
      {/* Floating AI Assistant Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-200"
      >
        <CpuChipIcon className="w-6 h-6" />
        {pendingSuggestions.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center text-xs font-bold">
            {pendingSuggestions.length}
          </div>
        )}
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CpuChipIcon className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">AI Assistant</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-primary-100 text-sm mt-1">
                  Smart contract optimization suggestions
                </p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Generate New Suggestion */}
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateSuggestion}
                    disabled={isThinking}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    {isThinking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        <span>Generate AI Suggestion</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* New Suggestion */}
                {newSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ai-message"
                  >
                    <div className="flex items-start space-x-2 mb-3">
                      <LightBulbIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">New Suggestion</h4>
                        <p className="text-sm text-gray-600">
                          Confidence: {Math.round(newSuggestion.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {newSuggestion.reasoning}
                    </p>
                    
                    <div className="space-y-2">
                      {newSuggestion.changes.map((change, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {change}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => approveSuggestion(newSuggestion.id)}
                        className="btn-success flex-1 text-sm"
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectSuggestion(newSuggestion.id)}
                        className="btn-error flex-1 text-sm"
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Existing Suggestions */}
                {suggestions && suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Suggestions</h4>
                    <div className="space-y-3">
                      {suggestions.slice(0, 3).map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {suggestion.type.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              suggestion.status === 'approved' 
                                ? 'bg-success-100 text-success-800'
                                : suggestion.status === 'rejected'
                                ? 'bg-error-100 text-error-800'
                                : 'bg-warning-100 text-warning-800'
                            }`}>
                              {suggestion.status}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {suggestion.reasoning}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                            <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Suggestions */}
                {(!suggestions || suggestions.length === 0) && !newSuggestion && (
                  <div className="text-center py-8">
                    <CpuChipIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      No AI suggestions available yet. Generate one to get started!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
