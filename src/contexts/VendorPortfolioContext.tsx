import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PortfolioItem } from '@/data/vendors';
import { useAuth } from '@/contexts/AuthContext';

interface VendorPortfolioContextType {
  portfolioItems: PortfolioItem[];
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => PortfolioItem;
  updatePortfolioItem: (id: string, updates: Partial<Omit<PortfolioItem, 'id'>>) => void;
  deletePortfolioItem: (id: string) => void;
  getPortfolioByVendor: (vendorId: string) => PortfolioItem[];
}

const VendorPortfolioContext = createContext<VendorPortfolioContextType | undefined>(undefined);

const STORAGE_KEY = 'marketflow_vendor_portfolio';

interface StoredPortfolioItem extends PortfolioItem {
  vendorId: string;
}

export function VendorPortfolioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allPortfolioItems, setAllPortfolioItems] = useState<StoredPortfolioItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPortfolioItems));
  }, [allPortfolioItems]);

  const portfolioItems = user?.role === 'vendor' 
    ? allPortfolioItems.filter(item => item.vendorId === user.id)
    : [];

  const addPortfolioItem = (newItem: Omit<PortfolioItem, 'id'>): PortfolioItem => {
    const item: StoredPortfolioItem = {
      ...newItem,
      id: `portfolio_${Date.now()}`,
      vendorId: user?.id || 'unknown',
    };

    setAllPortfolioItems(prev => [...prev, item]);
    return item;
  };

  const updatePortfolioItem = (id: string, updates: Partial<Omit<PortfolioItem, 'id'>>) => {
    setAllPortfolioItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deletePortfolioItem = (id: string) => {
    setAllPortfolioItems(prev => prev.filter(item => item.id !== id));
  };

  const getPortfolioByVendor = (vendorId: string) => {
    return allPortfolioItems.filter(item => item.vendorId === vendorId);
  };

  return (
    <VendorPortfolioContext.Provider value={{
      portfolioItems,
      addPortfolioItem,
      updatePortfolioItem,
      deletePortfolioItem,
      getPortfolioByVendor,
    }}>
      {children}
    </VendorPortfolioContext.Provider>
  );
}

export function useVendorPortfolio() {
  const context = useContext(VendorPortfolioContext);
  if (!context) {
    throw new Error('useVendorPortfolio must be used within a VendorPortfolioProvider');
  }
  return context;
}