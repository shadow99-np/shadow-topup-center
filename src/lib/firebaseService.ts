import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import { Order, UserProfile, Coupon, Product, WalletFundRequest, StoreAnnouncement } from '@/types/marketplace';

// Local storage keys for dual-mode persistence
const LOCAL_STORAGE_ORDERS_KEY = 'nepal_marketplace_orders';
const LOCAL_STORAGE_USERS_KEY = 'nepal_marketplace_users';
const LOCAL_STORAGE_COUPONS_KEY = 'nepal_marketplace_coupons';
const LOCAL_STORAGE_FUNDS_KEY = 'nepal_marketplace_funds';
const LOCAL_STORAGE_PRODUCTS_KEY = 'nepal_marketplace_custom_products';
const LOCAL_STORAGE_ANNOUNCEMENTS_KEY = 'nepal_marketplace_announcements';

// Helper to generate unique Customer Access ID
function generateAccessId(): string {
  return 'SHADOW-' + Math.floor(1000 + Math.random() * 9000);
}

// Authorized Master Administrator Credentials
export const MASTER_ADMIN_EMAIL = 'yadunepal8@gmail.com';
export const MASTER_ADMIN_PASS = 'shadow@admin1239';

export function isMasterAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
}

/* =========================================================================
   AUTHENTICATION SERVICES
   ========================================================================= */

export async function firebaseSignUp(
  email: string,
  pass: string,
  displayName: string,
  phone?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const accessId = isMasterAdmin(email) ? 'SHADOW-ROOT-ADMIN' : generateAccessId();
  const role = isMasterAdmin(email) ? 'super_admin' : 'customer';

  if (isFirebaseConfigured && auth && db) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      try {
        await updateAuthProfile(cred.user, { displayName });
      } catch (e) {}
      
      const profile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName: displayName || (isMasterAdmin(email) ? 'Yadu Nepal' : email.split('@')[0]),
        phone: phone || '',
        role,
        accessId,
        walletBalance: isMasterAdmin(email) ? 100000 : 0,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), profile);
      } catch (setErr) {
        console.warn('Firestore setDoc failed during sign up, continuing with local profile:', setErr);
      }
      return { success: true, user: profile };
    } catch (err: any) {
      let msg = err.message || 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
      return { success: false, error: msg };
    }
  }

  // Local Storage Fallback
  try {
    const rawUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    const users: Record<string, any> = rawUsers ? JSON.parse(rawUsers) : {};
    
    if (users[email.toLowerCase()]) {
      return { success: false, error: 'This email is already registered.' };
    }

    const mockUid = 'usr_' + Math.random().toString(36).substring(2, 9);
    const profile: UserProfile = {
      uid: mockUid,
      email,
      displayName: displayName || (isMasterAdmin(email) ? 'Yadu Nepal' : email.split('@')[0]),
      phone: phone || '',
      role,
      accessId,
      walletBalance: isMasterAdmin(email) ? 100000 : 0,
      createdAt: new Date().toISOString(),
    };

    users[email.toLowerCase()] = { profile, password: pass };
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    return { success: true, user: profile };
  } catch (e: any) {
    return { success: false, error: 'Could not save account data.' };
  }
}

export async function firebaseSignIn(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const isAdminLogin = isMasterAdmin(cleanEmail);

  // Exclusive Master Administrator Verification
  if (isAdminLogin) {
    if (pass !== MASTER_ADMIN_PASS) {
      return { success: false, error: 'Invalid master administrator password.' };
    }

    const masterAdminProfile: UserProfile = {
      uid: 'shadow_master_admin_1',
      email: MASTER_ADMIN_EMAIL,
      displayName: 'Yadu Nepal (Master Admin)',
      role: 'super_admin',
      accessId: 'SHADOW-ROOT-ADMIN',
      walletBalance: 100000,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    if (isFirebaseConfigured && auth) {
      try {
        await signInWithEmailAndPassword(auth, MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASS);
      } catch (authErr: any) {
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASS);
            if (db) {
              await setDoc(doc(db, 'users', 'shadow_master_admin_1'), masterAdminProfile);
            }
          } catch (createErr) {}
        }
      }
    }

    return { success: true, user: masterAdminProfile };
  }

  // Regular Customer Firebase Authentication
  if (isFirebaseConfigured && auth && db) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const isUserAdmin = isMasterAdmin(cred.user.email);
      const defaultProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName: cred.user.displayName || email.split('@')[0],
        role: isUserAdmin ? 'super_admin' : 'customer',
        accessId: isUserAdmin ? 'SHADOW-ROOT-ADMIN' : generateAccessId(),
        walletBalance: 0,
        createdAt: new Date().toISOString(),
      };

      try {
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          if (!data.accessId) {
            data.accessId = defaultProfile.accessId;
            try { await updateDoc(doc(db, 'users', cred.user.uid), { accessId: data.accessId }); } catch (e) {}
          }
          if (data.walletBalance === undefined) {
            data.walletBalance = 0;
            try { await updateDoc(doc(db, 'users', cred.user.uid), { walletBalance: 0 }); } catch (e) {}
          }
          return { success: true, user: data };
        } else {
          try {
            await setDoc(doc(db, 'users', cred.user.uid), defaultProfile);
          } catch (e) {}
          return { success: true, user: defaultProfile };
        }
      } catch (firestoreErr) {
        console.warn('Firestore fetch failed during email login, continuing with authenticated user:', firestoreErr);
        const saved = localStorage.getItem('nepal_market_auth_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.uid === cred.user.uid || parsed.email === email) {
              return { success: true, user: { ...defaultProfile, ...parsed } };
            }
          } catch (e) {}
        }
        return { success: true, user: defaultProfile };
      }
    } catch (err: any) {
      return { success: false, error: 'Invalid email or password.' };
    }
  }

  // Local Storage Fallback
  try {
    const rawUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    const users: Record<string, any> = rawUsers ? JSON.parse(rawUsers) : {};
    const existing = users[email.toLowerCase()];

    if (existing && existing.password === pass) {
      if (!existing.profile.accessId) {
        existing.profile.accessId = generateAccessId();
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
      }
      if (existing.profile.walletBalance === undefined) {
        existing.profile.walletBalance = 0;
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
      }
      return { success: true, user: existing.profile };
    }

    // Default customer demo login for quick testing
    if (email.toLowerCase() === 'gamer@nepal.com' && pass === 'gamer123') {
      const customerProfile: UserProfile = {
        uid: 'gamer_demo_1',
        email: 'gamer@nepal.com',
        displayName: 'Aayush Gamer',
        phone: '9841234567',
        role: 'customer',
        accessId: 'SHADOW-8891',
        walletBalance: 1500,
        createdAt: new Date().toISOString(),
      };
      return { success: true, user: customerProfile };
    }

    return { success: false, error: 'Invalid email or password.' };
  } catch (e) {
    return { success: false, error: 'Login verification failed.' };
  }
}

export async function firebaseGoogleSignIn(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (isFirebaseConfigured && auth && db && googleProvider) {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const isUserAdmin = isMasterAdmin(fbUser.email);

      const defaultProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || (isUserAdmin ? 'Yadu Nepal' : 'Verified Gamer'),
        phone: fbUser.phoneNumber || '',
        role: isUserAdmin ? 'super_admin' : 'customer',
        accessId: isUserAdmin ? 'SHADOW-ROOT-ADMIN' : ('SHADOW-' + fbUser.uid.substring(0, 4).toUpperCase()),
        walletBalance: isUserAdmin ? 100000 : 0,
        createdAt: new Date().toISOString(),
      };

      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          if (!data.accessId) {
            data.accessId = defaultProfile.accessId;
            try { await updateDoc(userRef, { accessId: data.accessId }); } catch (e) {}
          }
          if (data.walletBalance === undefined) {
            data.walletBalance = 0;
            try { await updateDoc(userRef, { walletBalance: 0 }); } catch (e) {}
          }
          return { success: true, user: data };
        } else {
          try {
            await setDoc(userRef, defaultProfile);
          } catch (writeErr) {
            console.warn('Could not write profile to Firestore, continuing with authenticated session:', writeErr);
          }
          return { success: true, user: defaultProfile };
        }
      } catch (firestoreErr) {
        console.warn('Firestore fetch failed during Google login, using authenticated Google profile:', firestoreErr);
        const saved = localStorage.getItem('nepal_market_auth_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.uid === fbUser.uid || parsed.email === fbUser.email) {
              return { success: true, user: { ...defaultProfile, ...parsed } };
            }
          } catch (e) {}
        }
        return { success: true, user: defaultProfile };
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-in popup was cancelled.' };
      }
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.message?.includes('popup')
      ) {
        // Fallback for mobile and popup-blocking browsers
        try {
          await signInWithRedirect(auth, googleProvider);
          return { success: true };
        } catch (redirErr: any) {
          return { success: false, error: 'Mobile popup blocked. Please allow popups or use email sign-in.' };
        }
      }
      return { success: false, error: err.message || 'Google sign-in failed.' };
    }
  }

  // Fallback for mock/local environment
  const mockUid = 'goog_' + Math.random().toString(36).substring(2, 9);
  const profile: UserProfile = {
    uid: mockUid,
    email: 'google.gamer@gmail.com',
    displayName: 'Google Verified Gamer',
    role: 'customer',
    accessId: generateAccessId(),
    walletBalance: 0,
    createdAt: new Date().toISOString(),
  };
  return { success: true, user: profile };
}

export async function firebaseGoogleRedirectSignIn(): Promise<void> {
  if (isFirebaseConfigured && auth && googleProvider) {
    await signInWithRedirect(auth, googleProvider);
  }
}

export async function firebasePasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  if (isFirebaseConfigured && auth) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset email.' };
    }
  }
  return { success: true, message: 'Password reset instructions sent to ' + email };
}

export async function firebaseSignOut(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {}
  }
}

/* =========================================================================
   ORDER MANAGEMENT SERVICES
   ========================================================================= */

export function sanitizeForFirestore<T = any>(obj: T): T {
  if (obj === undefined) return null as any;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as T;
}

export async function saveOrder(order: Order): Promise<{ success: boolean; error?: string }> {
  const cleanOrder = sanitizeForFirestore<Order>(order);

  // 1. Primary Save to Firestore
  let firestoreSaved = false;
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'orders', cleanOrder.id), cleanOrder);
      firestoreSaved = true;
    } catch (err: any) {
      console.warn('Firebase order save error, persisting locally:', err);
    }
  }

  // 2. Local Storage Mirror / Fallback
  try {
    const rawOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    const orders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
    
    // For local storage, if screenshot is very large, truncate for safe quota
    const storageOrder = { ...cleanOrder };
    if (storageOrder.paymentProofUrl && storageOrder.paymentProofUrl.length > 300000) {
      // Keep only thumbnail or summary in localStorage if needed
      storageOrder.paymentProofUrl = storageOrder.paymentProofUrl.substring(0, 500) + '...[truncated-for-storage]';
    }

    const existingIdx = orders.findIndex(o => o.id === storageOrder.id);
    if (existingIdx >= 0) {
      orders[existingIdx] = storageOrder;
    } else {
      orders.unshift(storageOrder);
    }

    // Keep up to 50 recent orders in localStorage to prevent quota exhaustion
    const trimmed = orders.slice(0, 50);
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(trimmed));
    return { success: true };
  } catch (e: any) {
    // If Firestore succeeded, return success even if localStorage had a storage quota hiccup
    if (firestoreSaved) {
      return { success: true };
    }
    return { success: false, error: e.message || 'Failed to save order.' };
  }
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) return snap.data() as Order;
    } catch (e) {}
  }

  // Local Storage Fallback
  try {
    const rawOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    const orders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
    const found = orders.find(o => o.id.toUpperCase() === orderId.toUpperCase().trim());
    return found || null;
  } catch (e) {
    return null;
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnap = await getDocs(q);
      const orders: Order[] = [];
      querySnap.forEach(d => orders.push(d.data() as Order));
      if (orders.length > 0) return orders;
    } catch (e) {}
  }

  // Local Storage Fallback with starter demo orders
  try {
    const rawOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (rawOrders) {
      return JSON.parse(rawOrders);
    }

    // Seed realistic starter orders for admin inspection if empty
    const seedOrders: Order[] = [
      {
        id: 'ORD-94812',
        customerName: 'Aayush Shrestha',
        customerEmail: 'aayush.shrestha@gmail.com',
        customerPhone: '9841234567',
        items: [
          {
            productId: 'ff-diamond',
            productName: 'Free Fire Diamond Top-Up',
            productImage: 'https://rosgayshop.com/assets/upload/top-up/mjmKkIaWKLSaDtJb9GK5e8zyRC3tkW.webp',
            productSlug: 'free-fire-diamond-top-up',
            category: 'topup',
            packageId: 'ff-weekly',
            packageName: 'Weekly Membership (450 Diamonds)',
            price: 240,
            originalPrice: 220,
            quantity: 1,
            requirements: { playerId: '1984719203', server: 'Nepal / India Region' }
          }
        ],
        subtotal: 240,
        discountNpr: 0,
        totalNpr: 240,
        paymentMethod: 'esewa',
        paymentReference: 'ESEWA-9284710294',
        orderStatus: 'Completed',
        deliveryType: 'automatic',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'ORD-94813',
        customerName: 'Prashant Thapa',
        customerEmail: 'prashant.thapa@gmail.com',
        customerPhone: '9812987654',
        items: [
          {
            productId: 'mlbb-nepal',
            productName: 'Mobile Legends: Bang Bang (Nepal / Global)',
            productImage: 'https://rosgayshop.com/assets/upload/top-up/8oHnRwx8oY7THoqy2MhzCpK9BQwwVj.webp',
            productSlug: 'mobile-legends-nepal',
            category: 'topup',
            packageId: 'ml-weekly-pass',
            packageName: 'Weekly Diamond Pass',
            price: 270,
            originalPrice: 250,
            quantity: 1,
            requirements: { playerId: '84920194', zoneId: '2042' }
          }
        ],
        subtotal: 270,
        discountNpr: 0,
        totalNpr: 270,
        paymentMethod: 'fonepay',
        paymentReference: 'FONE-TRX-817294',
        orderStatus: 'Payment Verification',
        deliveryType: 'manual',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
      }
    ];

    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(seedOrders));
    return seedOrders;
  } catch (e) {
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['orderStatus'],
  notes?: string
): Promise<boolean> {
  const updatedAt = new Date().toISOString();
  let firestoreUpdated = false;

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newStatus,
        statusNotes: notes || '',
        updatedAt,
      });
      firestoreUpdated = true;
    } catch (e: any) {
      console.warn('Firestore updateOrderStatus error, persisting in local storage:', e?.message || e);
    }
  }

  // Always update Local Storage mirror as well
  try {
    const rawOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    const orders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      orders[idx].orderStatus = newStatus;
      if (notes !== undefined) orders[idx].statusNotes = notes;
      orders[idx].updatedAt = updatedAt;
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
      return true;
    }
    return firestoreUpdated;
  } catch (e) {
    return firestoreUpdated;
  }
}

/* =========================================================================
   WALLET FUND REQUEST SERVICES
   ========================================================================= */

export async function submitFundRequest(req: WalletFundRequest): Promise<boolean> {
  const cleanReq = sanitizeForFirestore<WalletFundRequest>(req);
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'fund_requests', cleanReq.id), cleanReq);
      return true;
    } catch (e) {
      console.warn('Firebase fund request failed, using local fallback', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FUNDS_KEY);
    const requests: WalletFundRequest[] = raw ? JSON.parse(raw) : [];
    requests.unshift(cleanReq);
    localStorage.setItem(LOCAL_STORAGE_FUNDS_KEY, JSON.stringify(requests));
    return true;
  } catch (e) {
    return false;
  }
}

export async function fetchAllFundRequests(): Promise<WalletFundRequest[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'fund_requests'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: WalletFundRequest[] = [];
      snap.forEach(d => list.push(d.data() as WalletFundRequest));
      if (list.length > 0) return list;
    } catch (e) {}
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FUNDS_KEY);
    if (raw) return JSON.parse(raw);

    // Initial seed demo fund request
    const seed: WalletFundRequest[] = [
      {
        id: 'FND-10492',
        userId: 'gamer_demo_1',
        userEmail: 'gamer@nepal.com',
        userAccessId: 'SHADOW-8891',
        userName: 'Aayush Gamer',
        amountNpr: 1000,
        paymentMethod: 'fonepay',
        paymentReference: 'FP-WALLET-99214',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_FUNDS_KEY, JSON.stringify(seed));
    return seed;
  } catch (e) {
    return [];
  }
}

export async function approveFundRequest(requestId: string): Promise<boolean> {
  let matchedReq: WalletFundRequest | undefined;

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'fund_requests', requestId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        matchedReq = snap.data() as WalletFundRequest;
        await updateDoc(ref, {
          status: 'approved',
          reviewedAt: new Date().toISOString(),
        });

        // Credit user wallet in Firestore
        const userRef = doc(db, 'users', matchedReq.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const curBal = (userSnap.data()?.walletBalance || 0) + matchedReq.amountNpr;
          await updateDoc(userRef, { walletBalance: curBal });
        }
        return true;
      }
    } catch (e) {}
  }

  // Local Storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FUNDS_KEY);
    const requests: WalletFundRequest[] = raw ? JSON.parse(raw) : [];
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx >= 0) {
      requests[idx].status = 'approved';
      requests[idx].reviewedAt = new Date().toISOString();
      matchedReq = requests[idx];
      localStorage.setItem(LOCAL_STORAGE_FUNDS_KEY, JSON.stringify(requests));

      // Credit user in local auth storage
      const rawUser = localStorage.getItem('nepal_market_auth_user');
      if (rawUser) {
        const u: UserProfile = JSON.parse(rawUser);
        if (u.uid === matchedReq.userId || u.email === matchedReq.userEmail) {
          u.walletBalance = (u.walletBalance || 0) + matchedReq.amountNpr;
          localStorage.setItem('nepal_market_auth_user', JSON.stringify(u));
        }
      }
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function rejectFundRequest(requestId: string, notes?: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'fund_requests', requestId), {
        status: 'rejected',
        adminNotes: notes || '',
        reviewedAt: new Date().toISOString(),
      });
      return true;
    } catch (e) {}
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FUNDS_KEY);
    const requests: WalletFundRequest[] = raw ? JSON.parse(raw) : [];
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx >= 0) {
      requests[idx].status = 'rejected';
      requests[idx].adminNotes = notes || '';
      requests[idx].reviewedAt = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_FUNDS_KEY, JSON.stringify(requests));
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/* =========================================================================
   CUSTOM PRODUCTS PERSISTENCE
   ========================================================================= */

export async function saveCustomProduct(product: Product): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      return true;
    } catch (e) {}
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    const products: Product[] = raw ? JSON.parse(raw) : [];
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.unshift(product);
    }
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    return true;
  } catch (e) {
    return false;
  }
}

export async function fetchCustomProducts(): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const prods: Product[] = [];
      snap.forEach(d => prods.push(d.data() as Product));
      if (prods.length > 0) return prods;
    } catch (e) {}
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function deleteCustomProduct(productId: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    const products: Product[] = raw ? JSON.parse(raw) : [];
    const filtered = products.filter(p => p.id !== productId);
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    return false;
  }
}

/* =========================================================================
   COUPON & DISCOUNT MANAGEMENT
   ========================================================================= */

export const DEFAULT_SYSTEM_COUPONS: Coupon[] = [
  {
    code: 'NEPAL10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderNpr: 500,
    maxDiscountNpr: 200,
    usedCount: 0,
    active: true,
  },
  {
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderNpr: 300,
    usedCount: 0,
    active: true,
  },
  {
    code: 'ROBLOX50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderNpr: 500,
    usedCount: 0,
    active: true,
    applicableProductId: 'roblox-topup',
    applicableProductName: 'Roblox Robux Top-Up'
  },
  {
    code: 'ROBLOX10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderNpr: 100,
    maxDiscountNpr: 300,
    usedCount: 0,
    active: true,
    applicableProductId: 'roblox-topup',
    applicableProductName: 'Roblox Robux Top-Up'
  },
  {
    code: 'EFOOTBALL10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderNpr: 100,
    maxDiscountNpr: 250,
    usedCount: 0,
    active: true,
    applicableProductId: 'efootball-pes',
    applicableProductName: 'eFootball PES Coins'
  },
  {
    code: 'STRIKE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderNpr: 80,
    maxDiscountNpr: 200,
    usedCount: 0,
    active: true,
    applicableProductId: 'blood-strike',
    applicableProductName: 'Blood Strike Gold Top-Up'
  },
  {
    code: 'WINDS10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderNpr: 100,
    maxDiscountNpr: 250,
    usedCount: 0,
    active: true,
    applicableProductId: 'where-winds-meet',
    applicableProductName: 'Where Winds Meet Echo Beads'
  },
  {
    code: 'CHATGPT100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderNpr: 2500,
    usedCount: 0,
    active: true,
    applicableProductId: 'chatgpt-plus-nepal-global',
    applicableProductName: 'ChatGPT Plus (Official Upgrade)'
  },
  {
    code: 'FFDIAMOND10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderNpr: 500,
    maxDiscountNpr: 250,
    usedCount: 0,
    active: true,
    applicableProductId: 'free-fire-diamond-top-up',
    applicableProductName: 'Free Fire Diamond (Nepal & BD Server)'
  },
  {
    code: 'MLBB10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderNpr: 200,
    maxDiscountNpr: 200,
    usedCount: 0,
    active: true,
    applicableProductId: 'mobile-legends-nepal',
    applicableProductName: 'Mobile Legends Bang Bang'
  },
  {
    code: 'PUBG10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderNpr: 200,
    maxDiscountNpr: 250,
    usedCount: 0,
    active: true,
    applicableProductId: 'pubg-mobile-uc-topup',
    applicableProductName: 'PUBG Mobile UC'
  },
  {
    code: 'TOPUP20',
    discountType: 'fixed',
    discountValue: 20,
    minOrderNpr: 100,
    usedCount: 0,
    active: true,
  },
  {
    code: 'FESTIVE15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderNpr: 1000,
    maxDiscountNpr: 300,
    usedCount: 0,
    active: true,
  }
];

export async function fetchAllCoupons(): Promise<Coupon[]> {
  let list: Coupon[] = [];
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      snap.forEach(d => list.push(d.data() as Coupon));
    } catch (e) {}
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_COUPONS_KEY) : null;
    const localList: Coupon[] = raw ? JSON.parse(raw) : [];
    
    // Merge remote/local with defaults if empty
    const codeMap = new Map<string, Coupon>();
    // Start with defaults
    DEFAULT_SYSTEM_COUPONS.forEach(c => codeMap.set(c.code.toUpperCase(), c));
    // Overlay local storage
    localList.forEach(c => codeMap.set(c.code.toUpperCase(), c));
    // Overlay Firestore
    list.forEach(c => codeMap.set(c.code.toUpperCase(), c));

    const merged = Array.from(codeMap.values());
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_COUPONS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (e) {
    return DEFAULT_SYSTEM_COUPONS;
  }
}

export async function saveCoupon(coupon: Coupon): Promise<boolean> {
  const normalized: Coupon = {
    ...coupon,
    code: coupon.code.trim().toUpperCase(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'coupons', normalized.code), sanitizeForFirestore(normalized));
    } catch (e) {}
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_COUPONS_KEY) : null;
    let list: Coupon[] = raw ? JSON.parse(raw) : [...DEFAULT_SYSTEM_COUPONS];
    const idx = list.findIndex(c => c.code.toUpperCase() === normalized.code);
    if (idx >= 0) {
      list[idx] = normalized;
    } else {
      list.unshift(normalized);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_COUPONS_KEY, JSON.stringify(list));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const cleanCode = code.trim().toUpperCase();
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'coupons', cleanCode));
    } catch (e) {}
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_COUPONS_KEY) : null;
    let list: Coupon[] = raw ? JSON.parse(raw) : [...DEFAULT_SYSTEM_COUPONS];
    list = list.filter(c => c.code.toUpperCase() !== cleanCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_COUPONS_KEY, JSON.stringify(list));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function toggleCouponStatus(code: string, active: boolean): Promise<boolean> {
  const cleanCode = code.trim().toUpperCase();
  let firestoreSuccess = false;

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'coupons', cleanCode), { code: cleanCode, active }, { merge: true });
      firestoreSuccess = true;
    } catch (e: any) {
      console.warn('Firestore toggleCouponStatus error, persisting locally:', e?.message || e);
    }
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_COUPONS_KEY) : null;
    let list: Coupon[] = raw ? JSON.parse(raw) : [...DEFAULT_SYSTEM_COUPONS];
    const idx = list.findIndex(c => c.code.toUpperCase() === cleanCode);
    if (idx >= 0) {
      list[idx].active = active;
    } else {
      const def = DEFAULT_SYSTEM_COUPONS.find(c => c.code.toUpperCase() === cleanCode);
      if (def) {
        list.push({ ...def, active });
      } else {
        list.push({
          code: cleanCode,
          discountType: 'percentage',
          discountValue: 10,
          usedCount: 0,
          active
        });
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_COUPONS_KEY, JSON.stringify(list));
    }
    return true;
  } catch (e) {
    return firestoreSuccess;
  }
}

/* =========================================================================
   STORE ANNOUNCEMENTS & NOTICES
   ========================================================================= */

export const DEFAULT_ANNOUNCEMENTS: StoreAnnouncement[] = [
  {
    id: 'ann-1',
    title: '🔥 Free Fire & MLBB Regional Server Notice',
    message: 'Nepal & Bangladesh share the same regional top-up route! India region is separate. Top-ups credit automatically in 30-60 seconds.',
    badge: 'HOT',
    link: '/#shop-catalog',
    active: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'ann-2',
    title: '🎉 Welcome Coupon Code: WELCOME50',
    message: 'Get flat Rs. 50 OFF on your first purchase above Rs. 300! Apply WELCOME50 at checkout.',
    badge: 'DISCOUNT',
    couponCode: 'WELCOME50',
    link: '/checkout',
    active: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'ann-3',
    title: '⚡ Instant Payment QR Download Available',
    message: 'You can now download high-resolution eSewa, Khalti & Fonepay QR codes directly during checkout or wallet add funds.',
    badge: 'UPDATE',
    active: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

export async function fetchAllAnnouncements(): Promise<StoreAnnouncement[]> {
  let list: StoreAnnouncement[] = [];
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'announcements'));
      snap.forEach(d => list.push(d.data() as StoreAnnouncement));
    } catch (e) {}
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_ANNOUNCEMENTS_KEY) : null;
    const localList: StoreAnnouncement[] = raw ? JSON.parse(raw) : [];

    const map = new Map<string, StoreAnnouncement>();
    DEFAULT_ANNOUNCEMENTS.forEach(a => map.set(a.id, a));
    localList.forEach(a => map.set(a.id, a));
    list.forEach(a => map.set(a.id, a));

    const merged = Array.from(map.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (e) {
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export async function saveAnnouncement(ann: StoreAnnouncement): Promise<boolean> {
  const toSave: StoreAnnouncement = {
    ...ann,
    id: ann.id || `ann-${Date.now()}`,
    createdAt: ann.createdAt || new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'announcements', toSave.id), sanitizeForFirestore(toSave));
    } catch (e) {}
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_ANNOUNCEMENTS_KEY) : null;
    let list: StoreAnnouncement[] = raw ? JSON.parse(raw) : [...DEFAULT_ANNOUNCEMENTS];
    const idx = list.findIndex(a => a.id === toSave.id);
    if (idx >= 0) {
      list[idx] = toSave;
    } else {
      list.unshift(toSave);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(list));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (e) {}
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_ANNOUNCEMENTS_KEY) : null;
    let list: StoreAnnouncement[] = raw ? JSON.parse(raw) : [...DEFAULT_ANNOUNCEMENTS];
    list = list.filter(a => a.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(list));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function toggleAnnouncementStatus(id: string, active: boolean): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'announcements', id), { active });
    } catch (e) {}
  }

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_ANNOUNCEMENTS_KEY) : null;
    let list: StoreAnnouncement[] = raw ? JSON.parse(raw) : [...DEFAULT_ANNOUNCEMENTS];
    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) {
      list[idx].active = active;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(list));
      }
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
