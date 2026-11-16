'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Search, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderQuery, setOrderQuery] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderQuery.trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter your Order ID.');
      return;
    }
    router.push(`/order/${cleanId}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Storefront
      </Link>

      <div className="p-8 rounded-3xl bg-[#0e1526] border border-white/10 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <Truck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Track Your Order Status</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Enter your unique Order ID (e.g. <span className="font-mono text-indigo-300 font-bold">ORD-94812</span>) to view real-time delivery and payment verification updates.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => {
                setOrderQuery(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. ORD-94812"
              className="w-full bg-[#141e34] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono tracking-wider text-center sm:text-left"
            />
          </div>

          {error && <p className="text-xs text-rose-400 text-left">{error}</p>}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>Track Live Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Need help finding your Order ID? Check your receipt SMS or WhatsApp.</span>
        </div>
      </div>
    </div>
  );
}
