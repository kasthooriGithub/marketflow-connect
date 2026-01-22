import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialServices, categories } from 'data/services';
import { useAuth } from 'contexts/AuthContext';
import { db, storage } from 'lib/firebase';
import { serviceService } from 'services/serviceService';
import { vendorService } from 'services/vendorService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const VendorServicesContext = createContext(undefined);

export function VendorServicesProvider({ children }) {
  const { user } = useAuth();
  const [allServices, setAllServices] = useState(initialServices || []);
  const [currentVendor, setCurrentVendor] = useState(null);
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
          const uiVendor = {
            id: profile.uid,
            name: user.name,
            email: user.email,
            tagline: '',
            description: profile.bio || '',
            location: profile.location || '',
            memberSince: profile.created_at.toDate().getFullYear().toString(),
            responseTime: '24 hours',
            completionRate: 100,
            totalProjects: 0,
            rating: profile.rating,
            reviewCount: profile.review_count,
            skills: [],
            categories: profile.categories,
            startingPrice: 0,
            portfolio: [],
            reviews: [],
            avatar: profile.profile_image,
            coverImage: profile.cover_image
          };
          setCurrentVendor(uiVendor);
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
      if (user && user.role === 'vendor') {
        try {
          const myServices = await serviceService.getServicesByVendor(user.id);
          const mappedServices = myServices.map(s => ({
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
            deliveryTime: '2 days',
            features: [],
            tags: [],
            image: s.images[0] || '/placeholder.svg',
            popular: false
          }));

          setAllServices(prev => [...(initialServices || []), ...mappedServices]);
        } catch (error) {
          console.error("Error loading services:", error);
        }
      }
    }
    loadAllServices();
  }, [user]);

  const vendorServices = user?.role === 'vendor'
    ? allServices.filter(s => s.vendorId === user.id)
    : [];

  const addService = async (newService) => {
    if (!user) throw new Error("No user");

    const created = await serviceService.createService(user.id, {
      title: newService.title,
      description: newService.description,
      category: newService.category,
      pricing_type: newService.priceType === 'monthly' ? 'subscription' : 'one-time',
      base_price: newService.price,
      tiers: [],
      availability: newService.available,
      images: ['/placeholder.svg'],
    });

    const service = {
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

  const updateService = async (id, updates) => {
    setAllServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = async (id) => {
    setAllServices(prev => prev.filter(s => s.id !== id));
  };

  const getServicesByVendor = (vendorId) => {
    return allServices.filter(s => s.vendorId === vendorId);
  };

  const updateVendorProfile = async (updates) => {
    if (!user || !currentVendor) return;
    try {
      await vendorService.updateVendorProfile(user.id, {
        bio: updates.description,
        location: updates.location,
      });
      setCurrentVendor(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      throw error;
    }
  };

  const uploadVendorImage = async (file, path) => {
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
