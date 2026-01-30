import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialServices, categories } from 'data/services';
import { useAuth } from 'contexts/AuthContext';
import { storage } from 'lib/firebase';
import { serviceService } from 'services/serviceService';
import { vendorService } from 'services/vendorService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const VendorServicesContext = createContext(undefined);

export function VendorServicesProvider({ children }) {
  const { user } = useAuth();

  // ✅ SINGLE SOURCE OF TRUTH
  const authUid = user?.uid;

  const [allServices, setAllServices] = useState(initialServices || []);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [loadingVendor, setLoadingVendor] = useState(false);

  // Fetch Vendor Profile from Firestore
  useEffect(() => {
    async function fetchVendor() {
      if (!user || user.role !== 'vendor' || !authUid) {
        setCurrentVendor(null);
        return;
      }

      setLoadingVendor(true);
      try {
        // ✅ use authUid (uid)
        const profile = await vendorService.getVendorProfile(authUid);

        if (profile) {
          const createdAt = profile.created_at?.toDate ? profile.created_at.toDate() : null;

          const uiVendor = {
            id: profile.uid || authUid,
            name: user.name,
            email: user.email,
            tagline: '',
            description: profile.bio || '',
            location: profile.location || '',
            memberSince: createdAt ? String(createdAt.getFullYear()) : '',
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
  }, [user, authUid]);

  // Fetch services function
  useEffect(() => {
    async function loadAllServices() {
      if (user && user.role === 'vendor' && authUid) {
        try {
          // ✅ use authUid (uid)
          const myServices = await serviceService.getServicesByVendor(authUid);

          const mappedServices = myServices.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            longDescription: s.description,
            category: s.category,
            price: s.base_price,
            priceType: s.pricing_type === 'subscription' ? 'monthly' : 'one-time',

            // ✅ normalize vendor id in UI objects
            vendorId: s.vendor_id || s.vendorId || authUid,
            vendorName: user.name,

            rating: 0,
            reviewCount: 0,
            deliveryTime: '2 days',
            features: [],
            tags: [],
            image: s.images?.[0] || '/placeholder.svg',
            popular: false
          }));

          // prevent duplicates if effect runs again
          setAllServices(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const merged = [...prev];
            mappedServices.forEach(ms => {
              if (!existingIds.has(ms.id)) merged.push(ms);
            });
            return merged;
          });
        } catch (error) {
          console.error("Error loading services:", error);
        }
      }
    }
    loadAllServices();
  }, [user, authUid]);

  const vendorServices = (user?.role === 'vendor' && authUid)
    ? allServices.filter(s => String(s.vendorId) === String(authUid))
    : [];

  const addService = async (newService) => {
    if (!user || !authUid) throw new Error("Not authenticated");

    const created = await serviceService.createService(authUid, {
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
      vendorId: authUid,
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
    await serviceService.updateService(id, {
      title: updates.title,
      description: updates.description,
      category: updates.category,
      pricing_type: updates.priceType === 'monthly' ? 'subscription' : 'one-time',
      base_price: updates.price,
      availability: updates.available,
      images: ['/placeholder.svg'],
    });

    setAllServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = async (id) => {
    await serviceService.deleteService(id);
    setAllServices(prev => prev.filter(s => s.id !== id));
  };

  const getServicesByVendor = (vendorId) => {
    return allServices.filter(s => String(s.vendorId) === String(vendorId));
  };

  const updateVendorProfile = async (updates) => {
    if (!user || !currentVendor || !authUid) return;
    try {
      await vendorService.updateVendorProfile(authUid, {
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
    if (!user || !authUid) throw new Error("Not authenticated");
    const storageRef = ref(storage, `vendors/${authUid}/${path}/${Date.now()}_${file.name}`);
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
