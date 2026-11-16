'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  ShieldCheck, 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  AlertCircle, 
  Clock, 
  HelpCircle,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useCart } from '@/context/CartContext';
import { formatNpr } from '@/lib/pricingEngine';
import { PackageVariation } from '@/types/marketplace';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { products, pricingSettings } = useMarketplace();
  const { addToCart, setIsCartOpen } = useCart();

  const product = products.find(p => p.slug === slug);

  // Check if this is Free Fire for server selection in Topup section
  const isFreeFire = product ? (product.slug === 'free-fire-diamond-top-up' || product.slug === 'free-fire-india-region-top-up') : false;
  const nepalProduct = products.find(p => p.slug === 'free-fire-diamond-top-up') || product;
  const indiaProduct = products.find(p => p.slug === 'free-fire-india-region-top-up');

  const [selectedServer, setSelectedServer] = useState<'nepal_bd' | 'india'>(
    product?.slug === 'free-fire-india-region-top-up' ? 'india' : 'nepal_bd'
  );

  const displayPackages = (isFreeFire && selectedServer === 'india' && indiaProduct)
    ? indiaProduct.packages
    : (isFreeFire && selectedServer === 'nepal_bd' && nepalProduct)
    ? nepalProduct.packages
    : (product?.packages || []);

  // Form states
  const [selectedPackage, setSelectedPackage] = useState<PackageVariation | null>(
    displayPackages[0] || null
  );
  const [requirementValues, setRequirementValues] = useState<Record<string, string>>({
    server: isFreeFire
      ? (selectedServer === 'india' ? 'India Region Server' : 'Nepal & Bangladesh Server (BD/Nepal Shared Server)')
      : ''
  });
  const [validationError, setValidationError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested product could not be located in our catalog.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
      </div>
    );
  }

  const handleFieldChange = (fieldId: string, val: string) => {
    setRequirementValues(prev => ({ ...prev, [fieldId]: val }));
    if (validationError) setValidationError('');
  };

  const validateInputs = (): boolean => {
    for (const field of product.requirementFields) {
      if (field.required && (!requirementValues[field.id] || requirementValues[field.id].trim() === '')) {
        setValidationError(`Please enter your ${field.label}.`);
        return false;
      }
    }
    if (!selectedPackage) {
      setValidationError('Please select a package variation.');
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateInputs() || !selectedPackage) return;

    const currentProductName = (isFreeFire && selectedServer === 'india')
      ? 'Free Fire Diamond (India Region Server)'
      : (isFreeFire && selectedServer === 'nepal_bd')
      ? 'Free Fire Diamond (Nepal & Bangladesh Server)'
      : product.name;

    const currentProductId = (isFreeFire && selectedServer === 'india' && indiaProduct)
      ? indiaProduct.id
      : product.id;

    addToCart({
      productId: currentProductId,
      productName: currentProductName,
      productImage: product.image,
      productSlug: product.slug,
      category: product.category,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      price: selectedPackage.sellingPrice,
      originalPrice: selectedPackage.originalPrice,
      quantity: 1,
      requirements: requirementValues,
    });
  };

  const handleBuyNow = () => {
    if (!validateInputs() || !selectedPackage) return;

    const currentProductName = (isFreeFire && selectedServer === 'india')
      ? 'Free Fire Diamond (India Region Server)'
      : (isFreeFire && selectedServer === 'nepal_bd')
      ? 'Free Fire Diamond (Nepal & Bangladesh Server)'
      : product.name;

    const currentProductId = (isFreeFire && selectedServer === 'india' && indiaProduct)
      ? indiaProduct.id
      : product.id;

    addToCart({
      productId: currentProductId,
      productName: currentProductName,
      productImage: product.image,
      productSlug: product.slug,
      category: product.category,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      price: selectedPackage.sellingPrice,
      originalPrice: selectedPackage.originalPrice,
      quantity: 1,
      requirements: requirementValues,
    });

    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
        </button>
      </div>

      {/* Product Hero Banner & Title */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1526] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-start">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#141e34] overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.instantDelivery && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow">
              <Zap className="w-2.5 h-2.5 fill-slate-950" />
              <span>Instant</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {product.categoryLabel}
            </span>
            {product.publisher && (
              <span className="text-xs font-semibold text-slate-400">
                by {product.publisher}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {product.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {product.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Average Delivery: 60 Seconds</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official & Authorized Top-Up</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Package Selection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Requirements & Packages */}
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 1: Account / Credential Inputs */}
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {product.requirementFields.some(f => f.type === 'password')
                    ? 'Account Upgrade & Login Details'
                    : product.requiresPlayerId
                    ? 'Enter Player Information'
                    : 'Delivery & Contact Details'}
                </h3>
                <p className="text-xs text-slate-400">
                  {product.requirementFields.some(f => f.type === 'password')
                    ? 'Required by supplier to attach subscription — set temporary password & change anytime'
                    : product.requiresPlayerId
                    ? 'We only need your public numeric ID — never your password or OTP'
                    : 'Enter your WhatsApp/email for instant credential & receipt delivery'}
                </p>
              </div>
            </div>

            {/* Free Fire Server Region Selector in Topup Section */}
            {isFreeFire && (
              <div className="space-y-1.5 pb-2 border-b border-white/5">
                <label className="block text-xs font-bold text-slate-200">
                  Select Game Server Region <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServer('nepal_bd');
                      if (nepalProduct) setSelectedPackage(nepalProduct.packages[0]);
                      setRequirementValues(prev => ({ ...prev, server: 'Nepal & Bangladesh Server (BD/Nepal Shared Server)' }));
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedServer === 'nepal_bd'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-[#141e34] border-white/5 text-slate-300 hover:border-white/10'
                    }`}
                  >
                    <span className="text-base mr-1.5">🇳🇵 🇧🇩</span>
                    <span className="text-xs font-bold">Nepal & Bangladesh</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Shared BD/Nepal Server</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServer('india');
                      if (indiaProduct) setSelectedPackage(indiaProduct.packages[0]);
                      setRequirementValues(prev => ({ ...prev, server: 'India Region Server' }));
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedServer === 'india'
                        ? 'bg-orange-600/20 border-orange-500 text-white shadow-md'
                        : 'bg-[#141e34] border-white/5 text-slate-300 hover:border-white/10'
                    }`}
                  >
                    <span className="text-base mr-1.5">🇮🇳</span>
                    <span className="text-xs font-bold">India Region</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">India Server Rates</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {product.requirementFields
                .filter(field => isFreeFire ? field.id !== 'server' : true)
                .map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      value={requirementValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'password' ? (
                    <div className="relative">
                      <input
                        type={showPasswords[field.id] ? 'text' : 'password'}
                        value={requirementValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                        title={showPasswords[field.id] ? 'Hide password' : 'Show password'}
                      >
                        {showPasswords[field.id] ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={requirementValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  )}

                  {field.helpText && (
                    <p className="text-[11px] text-slate-400">{field.helpText}</p>
                  )}
                </div>
              ))}
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* STEP 2: Package Variations */}
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Select Package & Recharge Amount</h3>
                  <p className="text-xs text-slate-400">All prices include automated transparent processing (Rs. 20 / Rs. 50 above 1K)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {displayPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      setSelectedPackage(pkg);
                      if (validationError) setValidationError('');
                    }}
                    className={`relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                        : 'bg-[#141e34] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      {pkg.bonusAmount && (
                        <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 mb-1.5">
                          {pkg.bonusAmount}
                        </span>
                      )}
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                        {pkg.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-baseline justify-between">
                      <span className="text-sm sm:text-base font-black text-emerald-400">
                        {formatNpr(pkg.sellingPrice)}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Instructions & FAQs */}
          {product.instructions && product.instructions.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>How to Top-Up</span>
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
                {product.instructions.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right Column: Checkout Summary Box */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 shadow-2xl sticky top-24 space-y-5">
            <h3 className="text-base font-bold text-white pb-3 border-b border-white/5">
              Order Summary
            </h3>

            {selectedPackage ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-400">{product.name}</p>
                    <p className="text-sm font-bold text-white truncate">{selectedPackage.name}</p>
                  </div>
                </div>

                {/* Pricing Formula Breakdown */}
                <div className="p-3.5 rounded-2xl bg-[#141e34] border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Reference Cost:</span>
                    <span>{formatNpr(selectedPackage.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-indigo-400 font-semibold">
                    <span>Marketplace Processing Fee:</span>
                    <span>+ {formatNpr(selectedPackage.markupNpr)}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
                    <span>Final Selling Price:</span>
                    <span className="text-emerald-400 text-base">{formatNpr(selectedPackage.sellingPrice)}</span>
                  </div>
                </div>

                {validationError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30 hover:opacity-95 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy Now & Pay with eSewa/Khalti</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Shopping Cart</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Instant automatic dispatch upon payment</span>
                  </div>
                  <p>100% money-back guarantee in case of delivery failure.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Please select a package variation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
