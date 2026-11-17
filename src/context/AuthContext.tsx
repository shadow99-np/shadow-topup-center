'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, WalletFundRequest } from '@/types/marketplace';
import { 
  firebaseSignIn, 
  firebaseSignUp, 
  firebaseGoogleSignIn,
  firebaseGoogleRedirectSignIn,
  firebasePasswordReset,
  firebaseSignOut,
  submitFundRequest,
  fetchAllFundRequests,
  approveFundRequest as apiApproveFund,
  rejectFundRequest as apiRejectFund,
  isMasterAdmin
} from '@/lib/firebaseService';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isFirebaseActive: boolean;
  isAdmin: boolean;
  walletBalance: number;
  accessId: string;
  fundRequests: WalletFundRequest[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleRedirect: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  deductWalletBalance: (amount: number) => boolean;
  requestAddFunds: (amount: number, method: 'fonepay' | 'esewa' | 'khalti' | 'bank_transfer', reference: string, screenshotUrl?: string) => Promise<boolean>;
  approveFundRequest: (id: string) => Promise<boolean>;
  rejectFundRequest: (id: string, notes?: string) => Promise<boolean>;
  refreshFundRequests: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fundRequests, setFundRequests] = useState<WalletFundRequest[]>([]);

  const loadFunds = async () => {
    try {
      const list = await fetchAllFundRequests();
      setFundRequests(list);
    } catch (e) {}
  };

  useEffect(() => {
    // 1. Initial check from LocalStorage for instant render
    try {
      const saved = localStorage.getItem('nepal_market_auth_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse saved user', e);
    } finally {
      setIsLoading(false);
    }

    // 2. Real-time Firebase Auth state observer and Redirect Result handler
    let unsubscribe: (() => void) | undefined;
    if (isFirebaseConfigured && auth && db) {
      const firestore = db;

      // Handle return from Google OAuth redirect (especially for mobile browsers)
      getRedirectResult(auth).then(async (cred) => {
        if (cred && cred.user) {
          const fbUser = cred.user;
          const isUserAdmin = isMasterAdmin(fbUser.email);
          const redirectProfile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || (isUserAdmin ? 'Yadu Nepal' : 'Verified Gamer'),
            phone: fbUser.phoneNumber || '',
            role: isUserAdmin ? 'super_admin' : 'customer',
            accessId: isUserAdmin ? 'SHADOW-ROOT-ADMIN' : ('SHADOW-' + fbUser.uid.substring(0, 4).toUpperCase()),
            walletBalance: isUserAdmin ? 100000 : 0,
            createdAt: new Date().toISOString(),
          };
          setUser(redirectProfile);
          localStorage.setItem('nepal_market_auth_user', JSON.stringify(redirectProfile));
          try {
            await setDoc(doc(firestore, 'users', fbUser.uid), redirectProfile, { merge: true });
          } catch (e) {}
        }
      }).catch((e) => {
        console.warn('Google redirect result check notice:', e);
      });

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // If current local session is verified master admin, don't overwrite with customer
          const currentLocal = localStorage.getItem('nepal_market_auth_user');
          if (currentLocal) {
            try {
              const parsedLocal = JSON.parse(currentLocal);
              if (isMasterAdmin(parsedLocal.email) && !isMasterAdmin(fbUser.email)) {
                return;
              }
            } catch (e) {}
          }

          const isUserAdmin = isMasterAdmin(fbUser.email);
          const fallbackProfile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || (isUserAdmin ? 'Yadu Nepal' : 'Verified Customer'),
            phone: fbUser.phoneNumber || '',
            role: isUserAdmin ? 'super_admin' : 'customer',
            accessId: isUserAdmin ? 'SHADOW-ROOT-ADMIN' : ('SHADOW-' + fbUser.uid.substring(0, 4).toUpperCase()),
            walletBalance: isUserAdmin ? 100000 : 0,
            createdAt: new Date().toISOString(),
          };

          try {
            const userRef = doc(firestore, 'users', fbUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const profile = userSnap.data() as UserProfile;
              setUser(profile);
              localStorage.setItem('nepal_market_auth_user', JSON.stringify(profile));
            } else {
              try {
                await setDoc(userRef, fallbackProfile);
              } catch (e) {}
              setUser(fallbackProfile);
              localStorage.setItem('nepal_market_auth_user', JSON.stringify(fallbackProfile));
            }
          } catch (e) {
            console.warn('Failed to sync Firestore user profile, using fallback profile:', e);
            const saved = localStorage.getItem('nepal_market_auth_user');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (parsed.uid === fbUser.uid || parsed.email === fbUser.email) {
                  setUser({ ...fallbackProfile, ...parsed });
                  return;
                }
              } catch (parseErr) {}
            }
            setUser(fallbackProfile);
            localStorage.setItem('nepal_market_auth_user', JSON.stringify(fallbackProfile));
          }
        }
      });
    }

    loadFunds();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth && auth.currentUser && isMasterAdmin(email) && !isMasterAdmin(auth.currentUser.email)) {
      try {
        await signOut(auth);
      } catch (e) {}
    }
    const res = await firebaseSignIn(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('nepal_market_auth_user', JSON.stringify(res.user));
      await loadFunds();
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid credentials' };
  };

  const signup = async (email: string, pass: string, name: string, phone?: string) => {
    const res = await firebaseSignUp(email, pass, name, phone);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('nepal_market_auth_user', JSON.stringify(res.user));
      await loadFunds();
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to register account' };
  };

  const loginWithGoogle = async () => {
    const res = await firebaseGoogleSignIn();
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('nepal_market_auth_user', JSON.stringify(res.user));
      await loadFunds();
      return { success: true };
    }
    return { success: false, error: res.error || 'Google sign-in could not be completed' };
  };

  const resetPassword = async (email: string) => {
    return await firebasePasswordReset(email);
  };

  const logout = async () => {
    await firebaseSignOut();
    setUser(null);
    localStorage.removeItem('nepal_market_auth_user');
  };

  const deductWalletBalance = (amount: number): boolean => {
    if (!user) return false;
    const current = user.walletBalance || 0;
    if (current < amount) return false;

    const newBalance = current - amount;
    const updatedUser: UserProfile = {
      ...user,
      walletBalance: newBalance,
    };
    setUser(updatedUser);
    localStorage.setItem('nepal_market_auth_user', JSON.stringify(updatedUser));

    // Persist new balance to Firestore
    if (isFirebaseConfigured && db && user.uid) {
      updateDoc(doc(db, 'users', user.uid), { walletBalance: newBalance }).catch((err) => {
        console.warn('Failed to persist deducted wallet balance in Firestore:', err);
      });
    }

    return true;
  };

  const loginWithGoogleRedirect = async () => {
    await firebaseGoogleRedirectSignIn();
  };

  const requestAddFunds = async (
    amount: number,
    method: 'fonepay' | 'esewa' | 'khalti' | 'bank_transfer',
    reference: string,
    screenshotUrl?: string
  ): Promise<boolean> => {
    if (!user) return false;

    const newReq: WalletFundRequest = {
      id: 'FND-' + Math.floor(10000 + Math.random() * 90000),
      userId: user.uid,
      userEmail: user.email,
      userAccessId: user.accessId || 'SHADOW-USER',
      userName: user.displayName || user.email.split('@')[0],
      amountNpr: amount,
      paymentMethod: method,
      paymentReference: reference,
      screenshotUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const success = await submitFundRequest(newReq);
    if (success) {
      setFundRequests(prev => [newReq, ...prev]);
    }
    return success;
  };

  const approveFundRequest = async (id: string): Promise<boolean> => {
    const success = await apiApproveFund(id);
    if (success) {
      setFundRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() } : r)
      );
      const approvedReq = fundRequests.find(r => r.id === id);
      if (approvedReq && user && (approvedReq.userId === user.uid || approvedReq.userEmail === user.email)) {
        const updatedUser: UserProfile = {
          ...user,
          walletBalance: (user.walletBalance || 0) + approvedReq.amountNpr,
        };
        setUser(updatedUser);
        localStorage.setItem('nepal_market_auth_user', JSON.stringify(updatedUser));
      }
    }
    return success;
  };

  const rejectFundRequest = async (id: string, notes?: string): Promise<boolean> => {
    const success = await apiRejectFund(id, notes);
    if (success) {
      setFundRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'rejected', adminNotes: notes, reviewedAt: new Date().toISOString() } : r)
      );
    }
    return success;
  };

  const isAdmin = !!(user && (user.role === 'admin' || user.role === 'super_admin') && isMasterAdmin(user.email));
  const walletBalance = user?.walletBalance || 0;
  const accessId = user?.accessId || 'SHADOW-GUEST';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirebaseActive: isFirebaseConfigured,
        isAdmin,
        walletBalance,
        accessId,
        fundRequests,
        login,
        signup,
        loginWithGoogle,
        loginWithGoogleRedirect,
        resetPassword,
        logout,
        deductWalletBalance,
        requestAddFunds,
        approveFundRequest,
        rejectFundRequest,
        refreshFundRequests: loadFunds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
