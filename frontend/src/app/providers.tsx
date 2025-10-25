'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { create } from 'zustand';

// Basic app store (typed as any to keep examples simple)
const useAppStoreBase = create((set, get) => ({
  user: null,
  walletConnected: false,
  escrows: [],
  aiSuggestions: [],
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setWalletConnected: (connected) => set({ walletConnected: connected }),
  setEscrows: (escrows) => set({ escrows }),
  addEscrow: (escrow) => set((state) => ({ escrows: [...state.escrows, escrow] })),
  updateEscrow: (id, updates) => set((state) => ({
    escrows: state.escrows.map(escrow =>
      escrow.id === id ? { ...escrow, ...updates } : escrow
    )
  })),
  setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
  addAISuggestion: (suggestion) => set((state) => ({
    aiSuggestions: [...state.aiSuggestions, suggestion]
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Context
const AppContext = createContext<any>(null);

// Provider
export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  return (
    <AppContext.Provider value={{ store: useAppStoreBase }}>
      {children}
    </AppContext.Provider>
  );
}

// Hooks
export function useAppStore() {
  const { store } = useContext(AppContext)!;
  return store;
}

// keep the rest (useUser, useEscrows, useAI, useApp) the same

export function useUser() {
  const { store } = useContext(AppContext)!;
  return {
    user: store.user,
    setUser: store.setUser,
    walletConnected: store.walletConnected,
    setWalletConnected: store.setWalletConnected,
  };
}

export function useEscrows() {
  const { store } = useContext(AppContext)!;
  return {
    escrows: store.escrows,
    setEscrows: store.setEscrows,
    addEscrow: store.addEscrow,
    updateEscrow: store.updateEscrow,
  };
}

export function useAI() {
  const { store } = useContext(AppContext)!;
  return {
    suggestions: store.aiSuggestions,
    setSuggestions: store.setAISuggestions,
    addSuggestion: store.addAISuggestion,
  };
}

export function useApp() {
  const { store } = useContext(AppContext)!;
  return {
    loading: store.loading,
    error: store.error,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
  };
}
