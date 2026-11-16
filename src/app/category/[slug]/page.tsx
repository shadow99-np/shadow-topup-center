'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Gamepad2, Sparkles } from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES_LIST } from '@/data/catalog';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { products } = useMarketplace();
  const [localSearch, setLocalSearch] = useState('');

  const categoryMeta = CATEGORIES_LIST.find(c => c.id === slug) || {
    id: slug,
    label: slug.replace('_', ' ').toUpperCase(),
    icon: 'Sparkles',
    count: 0,
  };

  const categoryProducts = products.filter(p => {
    const matchesCategory = slug === 'all' ? true : p.category === slug;
    const matchesSearch = localSearch.trim() === '' 
      ? true 
      : p.name.toLowerCase().includes(localSearch.toLowerCase()) || 
        p.tags.some(t => t.toLowerCase().includes(localSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Products
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span>{categoryMeta.label}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Showing {categoryProducts.length} verified products with automated NPR 20 pricing
            </p>
          </div>

          {/* Category Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={`Filter in ${categoryMeta.label}...`}
              className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 pt-2">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {categoryProducts.length === 0 && (
        <div className="text-center py-20 bg-[#0f172a] rounded-3xl border border-white/5">
          <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No products found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or browse another category.</p>
        </div>
      )}
    </div>
  );
}
