'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon } from '@/types/marketplace';
import { fetchAllCoupons, DEFAULT_SYSTEM_COUPONS } from '@/lib/firebaseService';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (packageId: string) => void;
  clearCart: () => void;
  subtotal: number;
  discountNpr: number;
  totalNpr: number;
  appliedCoupon: Coupon | null;
  coupons: Coupon[];
  refreshCoupons: () => Promise<void>;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_SYSTEM_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshCoupons = async () => {
    try {
      const data = await fetchAllCoupons();
      if (data && data.length > 0) {
        setCoupons(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nepal_market_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {} finally {
      setIsLoaded(true);
    }
    refreshCoupons();
  }, []);

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('nepal_market_cart', JSON.stringify(newItems));
    } catch (e) {}
  };

  const addToCart = (newItem: CartItem) => {
    const existingIdx = items.findIndex(i => i.packageId === newItem.packageId);
    let updated: CartItem[];
    if (existingIdx >= 0) {
      updated = [...items];
      updated[existingIdx].quantity += newItem.quantity;
      updated[existingIdx].requirements = { ...updated[existingIdx].requirements, ...newItem.requirements };
    } else {
      updated = [...items, newItem];
    }
    saveItems(updated);
    setIsCartOpen(true);
  };

  const removeFromCart = (packageId: string) => {
    const updated = items.filter(i => i.packageId !== packageId);
    saveItems(updated);
  };

  const clearCart = () => {
    saveItems([]);
    setAppliedCoupon(null);
  };

  // Auto-remove applied coupon if its specific required product is removed from cart
  useEffect(() => {
    if (appliedCoupon?.applicableProductId) {
      const hasProduct = items.some(i => i.productId === appliedCoupon.applicableProductId);
      if (!hasProduct) {
        setAppliedCoupon(null);
      }
    }
  }, [items, appliedCoupon]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountNpr = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minOrderNpr || 0)) {
    // If restricted to a specific product, discount is calculated on that product's subtotal
    let eligibleSubtotal = subtotal;
    if (appliedCoupon.applicableProductId) {
      const eligibleItems = items.filter(i => i.productId === appliedCoupon.applicableProductId);
      eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    if (eligibleSubtotal > 0) {
      if (appliedCoupon.discountType === 'percentage') {
        discountNpr = Math.round((eligibleSubtotal * appliedCoupon.discountValue) / 100);
        if (appliedCoupon.maxDiscountNpr && discountNpr > appliedCoupon.maxDiscountNpr) {
          discountNpr = appliedCoupon.maxDiscountNpr;
        }
      } else {
        discountNpr = Math.min(appliedCoupon.discountValue, eligibleSubtotal);
      }
    }
  }

  const totalNpr = Math.max(0, subtotal - discountNpr);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode);
    
    if (!found || !found.active) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }

    if (found.expiryDate && new Date(found.expiryDate).getTime() < Date.now()) {
      return { success: false, message: 'This coupon has expired.' };
    }

    if (found.usageLimit && (found.usedCount || 0) >= found.usageLimit) {
      return { success: false, message: 'This coupon usage limit has been reached.' };
    }

    if (found.applicableProductId) {
      const hasProduct = items.some(i => i.productId === found.applicableProductId);
      if (!hasProduct) {
        return { 
          success: false, 
          message: `This coupon is exclusively valid for "${found.applicableProductName || 'specific products'}". Please add this product to your cart.` 
        };
      }
    }

    if (found.minOrderNpr && subtotal < found.minOrderNpr) {
      return { success: false, message: `Minimum order amount of Rs. ${found.minOrderNpr} required.` };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        subtotal,
        discountNpr,
        totalNpr,
        appliedCoupon,
        coupons,
        refreshCoupons,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
