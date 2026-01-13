import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { User as FirestoreUser, UserRole } from '@/types/firebase';
import { userService } from '@/services/userService';
import { vendorService } from '@/services/vendorService';
import { clientService } from '@/services/clientService';

// Adapter type to support existing UI components expecting 'id', 'name', 'avatar'
// while also providing the new Firestore structure.
export interface ContextUser extends FirestoreUser {
  id: string;   // mapped from uid
  name: string; // mapped from full_name
  avatar?: string; // mapped from photo_url
}

interface AuthContextType {
  user: ContextUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: 'vendor' | 'client') => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ContextUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userProfile = await userService.getUserProfile(firebaseUser.uid);

          if (userProfile) {
            // Map Firestore profile to Context User (Adapter)
            setUser({
              ...userProfile,
              id: userProfile.uid,
              name: userProfile.full_name,
              avatar: userProfile.photo_url
            });
          } else {
            console.warn('User authenticated but no profile found in Firestore.');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // State update happens in onAuthStateChanged
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Ideally check role here or in onAuthStateChanged
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'vendor' | 'client'): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // 1. Create User Document
      await userService.createUserProfile(firebaseUser.uid, {
        email,
        full_name: name,
        role,
        photo_url: '', // Default or placeholder
      });

      // 2. Identify Role and Create Specific Profile
      if (role === 'vendor') {
        await vendorService.createVendorProfile(firebaseUser.uid, {
          agency_name: name, // Default to name initially
        });
      } else if (role === 'client') {
        await clientService.createClientProfile(firebaseUser.uid, {
          display_name: name,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      adminLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
