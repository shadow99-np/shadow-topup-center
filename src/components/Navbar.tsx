'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Truck, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  Zap,
  Sliders,
  DollarSign,
  MessageCircle,
  Bell,
  Ticket,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { formatNpr } from '@/lib/pricingEngine';
import { fetchAllAnnouncements, DEFAULT_ANNOUNCEMENTS } from '@/lib/firebaseService';
import { StoreAnnouncement } from '@/types/marketplace';

export default function Navbar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const { products, searchQuery, setSearchQuery } = useMarketplace();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<StoreAnnouncement[]>(DEFAULT_ANNOUNCEMENTS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAnn = async () => {
      try {
        const data = await fetchAllAnnouncements();
        if (data && data.length > 0) {
          setAnnouncements(data);
        }
      } catch (e) {}
    };
    loadAnn();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAnnouncements = announcements.filter(a => a.active);

  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Filter search matches
  const searchResults = searchQuery.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 6);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        {/* Top Notification Bar */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-blue-900/60 border-b border-indigo-500/20 px-4 py-1.5 text-xs text-indigo-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-100">🇳🇵 Nepal's #1 Instant Digital Marketplace</span>
              <span className="hidden sm:inline text-slate-400">• Automated Delivery via eSewa, Khalti & Fonepay</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <a 
                href="https://wa.me/9779761033755" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-emerald-300 transition flex items-center gap-1 font-semibold text-emerald-400"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">WhatsApp: 9761033755</span>
                <span className="xs:hidden">9761033755</span>
              </a>
              <Link href="/track" className="hover:text-white transition flex items-center gap-1 font-semibold text-slate-200">
                <Truck className="w-3.5 h-3.5" /> Track
              </Link>
              <Link href="/admin" className="hover:text-white transition flex items-center gap-1 text-indigo-300">
                <Sliders className="w-3.5 h-3.5" /> Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">SHADOW</span>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">TOPUP</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 -mt-1">Topup Center • Nepal</p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Free Fire, MLBB, ChatGPT, Steam, PUBG..."
                className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Desktop Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-dropdown rounded-2xl overflow-hidden py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5">
                  Products ({searchResults.length})
                </div>
                {searchResults.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug}`}
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition"
                  >
                    <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{prod.name}</p>
                      <p className="text-xs text-slate-400">{prod.categoryLabel} • from {formatNpr(prod.packages[0]?.sellingPrice || 0)}</p>
                    </div>
                    {prod.instantDelivery && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Instant
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
                aria-label="Store Notifications & Announcements"
                title="Updates, Announcements & Coupons"
              >
                <Bell className="w-5 h-5" />
                {activeAnnouncements.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[10px] flex items-center justify-center shadow-md animate-pulse">
                    {activeAnnouncements.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 sm:-right-12 top-full mt-2 w-[330px] sm:w-[380px] glass-dropdown rounded-3xl p-3 z-50 shadow-2xl border border-indigo-500/20 max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Store Notifications ({activeAnnouncements.length})
                      </h3>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Live Updates
                    </span>
                  </div>

                  <div className="overflow-y-auto py-2 space-y-2.5 max-h-[60vh] pr-1">
                    {activeAnnouncements.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No active announcements right now.
                      </div>
                    ) : (
                      activeAnnouncements.map((a) => {
                        const badgeColors: Record<string, string> = {
                          HOT: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                          DISCOUNT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                          UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                          NOTICE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                        };

                        return (
                          <div
                            key={a.id}
                            className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {a.badge && (
                                  <span
                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                      badgeColors[a.badge] || badgeColors.NOTICE
                                    }`}
                                  >
                                    {a.badge}
                                  </span>
                                )}
                                <h4 className="text-xs font-bold text-white">{a.title}</h4>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed">{a.message}</p>

                            {/* Coupon Code 1-Click Copy */}
                            {a.couponCode && (
                              <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs">
                                <div className="flex items-center gap-1.5 text-indigo-200">
                                  <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="text-[10px] text-slate-400">Promo:</span>
                                  <span className="font-mono font-black text-amber-300 tracking-wider">
                                    {a.couponCode}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => handleCopyCoupon(a.couponCode!, e)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition"
                                >
                                  {copiedCoupon === a.couponCode ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-300" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {a.link && (
                              <div className="pt-1 flex items-center justify-between text-[10px]">
                                <Link
                                  href={a.link}
                                  onClick={() => setIsNotificationsOpen(false)}
                                  className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  <span>View Details</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                                <span className="text-slate-500">
                                  {new Date(a.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] px-1">
                    <a
                      href="https://wa.me/9779761033755"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp: 9761033755
                    </a>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-slate-200 hover:bg-indigo-600/30 transition text-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold">{user.displayName.split(' ')[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass-dropdown rounded-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm font-bold text-white">{user.displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                      >
                        <User className="w-4 h-4 text-indigo-400" /> My Orders & Account
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-purple-300 hover:bg-purple-500/10 rounded-xl transition"
                        >
                          <Sliders className="w-4 h-4 text-purple-400" /> Admin Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition active:scale-95"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 border-t border-white/5 bg-[#0e1526]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, apps, coins..."
                className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-xl bg-[#141e34] border border-white/10 overflow-hidden divide-y divide-white/5">
                {searchResults.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug}`}
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-white/5"
                  >
                    <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{prod.name}</p>
                      <p className="text-[11px] text-slate-400">from {formatNpr(prod.packages[0]?.sellingPrice || 0)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0e1526] px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" /> Home & Storefront
            </Link>
            <Link
              href="/category/topup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 font-semibold text-sm"
            >
              <Gamepad2 className="w-4 h-4 text-blue-400" /> Game Top-Ups
            </Link>
            <Link
              href="/category/subscription"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 font-semibold text-sm"
            >
              <Zap className="w-4 h-4 text-purple-400" /> App & AI Subscriptions
            </Link>
            <Link
              href="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 font-semibold text-sm"
            >
              <Truck className="w-4 h-4" /> Track My Order
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-500/10 font-semibold text-sm"
            >
              <Sliders className="w-4 h-4" /> Admin Controls & Pricing
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
