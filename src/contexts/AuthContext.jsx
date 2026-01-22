import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from 'lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { userService } from 'services/userService';
import { vendorService } from 'services/vendorService';
import { clientService } from 'services/clientService';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await userService.getUserProfile(firebaseUser.uid);

          if (userProfile) {
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

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name, role) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      await userService.createUserProfile(firebaseUser.uid, {
        email,
        full_name: name,
        role,
        photo_url: '',
      });

      if (role === 'vendor') {
        await vendorService.createVendorProfile(firebaseUser.uid, {
          agency_name: name,
        });
      } else if (role === 'client') {
        await clientService.createClientProfile(firebaseUser.uid, {
          display_name: name,
        });
      }

      return { success: true };
    } catch (error) {
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
