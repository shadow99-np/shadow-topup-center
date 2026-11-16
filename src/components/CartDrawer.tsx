'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, Tag, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatNpr } from '@/lib/pricingEngine';

export default function CartDrawer() {
  const router = useRouter();
  const { 
    items, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    discountNpr, 
    totalNpr, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    isCartOpen, 
    setIsCartOpen 
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; text?: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e1526] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Your Shopping Cart</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Select a game top-up, app subscription or digital gift card to get started.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition"
                >
                  Explore Storefront
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.packageId}
                  className="p-3.5 rounded-2xl bg-[#141e34] border border-white/5 flex gap-3 relative group"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-sm font-bold text-white truncate">{item.productName}</h4>
                    <p className="text-xs font-semibold text-indigo-400 mt-0.5">{item.packageName}</p>
                    
                    {/* Display entered requirement fields (UID, Zone ID, etc.) */}
                    {Object.entries(item.requirements).length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-white/5 text-[11px] text-slate-400 space-y-0.5">
                        {Object.entries(item.requirements).map(([k, val]) => (
                          <p key={k} className="truncate">
                            <span className="text-slate-500 capitalize">{k}:</span> <span className="text-slate-200 font-mono">{val}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {formatNpr(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.packageId)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-400 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#0a0f1d] space-y-3.5">
              {/* Coupon Input */}
              <form onSubmit={handleApply} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (e.g. NEPAL10)"
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 uppercase font-mono font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
                >
                  Apply
                </button>
              </form>

              {couponFeedback && (
                <p className={`text-xs ${couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {couponFeedback.text}
                </p>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span>Coupon: <strong>{appliedCoupon.code}</strong></span>
                  <button onClick={removeCoupon} className="hover:underline text-[11px]">Remove</button>
                </div>
              )}

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">{formatNpr(subtotal)}</span>
                </div>
                {discountNpr > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>- {formatNpr(discountNpr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-white/10">
                  <span>Total Amount</span>
                  <span className="text-base text-emerald-400 font-extrabold">{formatNpr(totalNpr)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/checkout');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Secure Payment with eSewa, Khalti & Fonepay</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
