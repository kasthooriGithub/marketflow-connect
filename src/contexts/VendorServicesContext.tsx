import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service, services as initialServices, categories } from '@/data/services'; // Keep static data as fallback?
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import { serviceService } from '@/services/serviceService';
import { vendorService } from '@/services/vendorService';
import { collection, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Vendor } from '@/data/vendors';
import { Service as FirestoreService } from '@/types/firebase'; // New type

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
  currentVendor: Vendor | null;
  loadingVendor: boolean;
  addService: (service: NewService) => Promise<Service>;
  updateService: (id: string, updates: Partial<NewService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  getServicesByVendor: (vendorId: string) => Service[];
  updateVendorProfile: (updates: Partial<Vendor>) => Promise<void>;
  uploadVendorImage: (file: File, path: string) => Promise<string>;
  categories: typeof categories;
}

const VendorServicesContext = createContext<VendorServicesContextType | undefined>(undefined);

export function VendorServicesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allServices, setAllServices] = useState<Service[]>(initialServices);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(false);

  // Fetch Vendor Profile from Firestore
  useEffect(() => {
    async function fetchVendor() {
      if (!user || user.role !== 'vendor') {
        setCurrentVendor(null);
        return;
      }

      setLoadingVendor(true);
      try {
        const profile = await vendorService.getVendorProfile(user.id);
        if (profile) {
          // Map Firestore Profile to UI Vendor Type
          // UI Vendor has many fields. 
          const uiVendor: Vendor = {
            id: profile.uid,
            name: user.name, // from AuthContext
            email: user.email,
            tagline: '', // Add to schema later if needed
            description: profile.bio || '',
            location: profile.location || '',
            memberSince: profile.created_at.toDate().getFullYear().toString(),
            responseTime: '24 hours',
            completionRate: 100,
            totalProjects: 0,
            rating: profile.rating,
            reviewCount: profile.review_count,
            skills: [], // Add to schema later
            categories: profile.categories,
            startingPrice: 0,
            portfolio: [], // Add to schema later
            reviews: [],
            avatar: profile.profile_image,
            coverImage: profile.cover_image
          };
          setCurrentVendor(uiVendor);
        } else {
          // If profile missing (shouldn't happen with new auth flow), maybe init?
          // Skipping for now.
        }
      } catch (error) {
        console.error("Error fetching vendor profile:", error);
      } finally {
        setLoadingVendor(false);
      }
    }

    fetchVendor();
  }, [user]);

  // Fetch services function
  useEffect(() => {
    async function loadAllServices() {
      // Ideally fetch ALL services from Firestore
      // For now, I'll Mock + Fetch User's services to ensure "add" works visibly.
      if (user && user.role === 'vendor') {
        const myServices = await serviceService.getServicesByVendor(user.id);
        // Mapper
        const mappedServices: Service[] = myServices.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          longDescription: s.description,
          category: s.category,
          price: s.base_price,
          priceType: s.pricing_type === 'subscription' ? 'monthly' : 'one-time',
          vendorId: s.vendorId,
          vendorName: user.name,
          rating: 0,
          reviewCount: 0,
          deliveryTime: '2 days', // default
          features: [],
          tags: [],
          image: s.images[0] || '/placeholder.svg',
          popular: false
        }));

        setAllServices(prev => [...initialServices, ...mappedServices]);
      }
    }
    loadAllServices();
  }, [user]);

  const vendorServices = user?.role === 'vendor'
    ? allServices.filter(s => s.vendorId === user.id)
    : [];

  const addService = async (newService: NewService): Promise<Service> => {
    if (!user) throw new Error("No user");

    // Call ServiceService
    const created = await serviceService.createService(user.id, {
      title: newService.title,
      description: newService.description,
      category: newService.category,
      pricing_type: newService.priceType === 'monthly' ? 'subscription' : 'one-time',
      base_price: newService.price,
      tiers: [], // Logic for tiers can be added later
      availability: newService.available,
      images: ['/placeholder.svg'], // logic for image upload here too
    });

    const service: Service = {
      id: created.id,
      title: created.title,
      description: created.description,
      longDescription: created.description,
      category: created.category,
      price: created.base_price,
      priceType: created.pricing_type === 'subscription' ? 'monthly' : 'one-time',
      vendorId: user.id,
      vendorName: user.name,
      rating: 0,
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

  const updateService = async (id: string, updates: Partial<NewService>) => {
    // Implement update logic with serviceService.updateService
    setAllServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = async (id: string) => {
    setAllServices(prev => prev.filter(s => s.id !== id));
  };

  const getServicesByVendor = (vendorId: string) => {
    return allServices.filter(s => s.vendorId === vendorId);
  };

  const updateVendorProfile = async (updates: Partial<Vendor>) => {
    if (!user || !currentVendor) return;
    try {
      await vendorService.updateVendorProfile(user.id, {
        bio: updates.description,
        location: updates.location,
        // map other fields
      });
      // UI update
      setCurrentVendor(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      throw error;
    }
  };

  const uploadVendorImage = async (file: File, path: string): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const storageRef = ref(storage, `vendors/${user.id}/${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  return (
    <VendorServicesContext.Provider value={{
      vendorServices,
      allServices,
      currentVendor,
      loadingVendor,
      addService,
      updateService,
      deleteService,
      getServicesByVendor,
      updateVendorProfile,
      uploadVendorImage,
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
