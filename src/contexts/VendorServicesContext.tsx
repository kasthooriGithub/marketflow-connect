import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service, services as initialServices, categories } from '@/data/services';
import { useAuth } from '@/contexts/AuthContext';

export interface NewService {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  price: number;
  priceType: 'one-time' | 'monthly' | 'hourly';
  deliveryTime: string;
  features: string[];
  tags: string[];
  available: boolean;
}

interface VendorServicesContextType {
  vendorServices: Service[];
  allServices: Service[];
  addService: (service: NewService) => Service;
  updateService: (id: string, updates: Partial<NewService>) => void;
  deleteService: (id: string) => void;
  getServicesByVendor: (vendorId: string) => Service[];
  categories: typeof categories;
}

const VendorServicesContext = createContext<VendorServicesContextType | undefined>(undefined);

const STORAGE_KEY = 'marketflow_vendor_services';

export function VendorServicesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allServices, setAllServices] = useState<Service[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return [...initialServices, ...JSON.parse(stored)];
      } catch {
        return initialServices;
      }
    }
    return initialServices;
  });

  // Get custom services only (not initial ones)
  const customServices = allServices.filter(s => !initialServices.some(is => is.id === s.id));
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customServices));
  }, [customServices]);

  const vendorServices = user?.role === 'vendor' 
    ? allServices.filter(s => s.vendorId === user.id || s.vendorName === user.name)
    : [];

  const addService = (newService: NewService): Service => {
    const service: Service = {
      id: `custom_${Date.now()}`,
      title: newService.title,
      description: newService.description,
      longDescription: newService.longDescription || newService.description,
      category: newService.category,
      price: newService.price,
      priceType: newService.priceType,
      vendorId: user?.id || 'unknown',
      vendorName: user?.name || 'Unknown Vendor',
      rating: 5.0,
      reviewCount: 0,
      deliveryTime: newService.deliveryTime,
      features: newService.features,
      tags: newService.tags,
      image: '/placeholder.svg',
      popular: false,
    };

    setAllServices(prev => [...prev, service]);
    return service;
  };

  const updateService = (id: string, updates: Partial<NewService>) => {
    setAllServices(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const deleteService = (id: string) => {
    setAllServices(prev => prev.filter(s => s.id !== id));
  };

  const getServicesByVendor = (vendorId: string) => {
    return allServices.filter(s => s.vendorId === vendorId);
  };

  return (
    <VendorServicesContext.Provider value={{
      vendorServices,
      allServices,
      addService,
      updateService,
      deleteService,
      getServicesByVendor,
      categories,
    }}>
      {children}
    </VendorServicesContext.Provider>
  );
}

export function useVendorServices() {
  const context = useContext(VendorServicesContext);
  if (!context) {
    throw new Error('useVendorServices must be used within a VendorServicesProvider');
  }
  return context;
}
