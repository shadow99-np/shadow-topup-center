'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types/marketplace';
import { formatNpr } from '@/lib/pricingEngine';

export default function ProductCard({ product }: { product: Product }) {
  const minPrice = product.packages.length > 0 
    ? Math.min(...product.packages.map(p => p.sellingPrice)) 
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      prefetch={true}
      className="group relative flex flex-col rounded-2xl bg-[#0f172a] border border-white/10 overflow-hidden hover-card-glow cursor-pointer transition-all duration-200 active:scale-[0.98] select-none"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#141e34]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80" />

        {/* Instant Badge */}
        {product.instantDelivery && (
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-lg shadow-emerald-500/30 backdrop-blur-sm">
            <Zap className="w-3 h-3 fill-slate-950" />
            <span>Instant</span>
          </div>
        )}

        {/* Hot / Popular Tag */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-sm">
            {product.badge}
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="flex-1 p-3.5 flex flex-col justify-between gap-2">
        <div>
          {product.publisher && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 truncate">
              {product.publisher}
            </p>
          )}
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Starts from</span>
            <span className="text-sm font-extrabold text-emerald-400">
              {formatNpr(minPrice)}
            </span>
          </div>

          <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-indigo-600 border border-white/10 group-hover:border-indigo-500 flex items-center justify-center text-slate-400 group-hover:text-white transition">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
