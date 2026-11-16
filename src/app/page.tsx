'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Gamepad2, 
  Layers, 
  Sparkles,
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  ShoppingBag,
  User,
  ExternalLink,
  ShieldCheck,
  Clock,
  Wallet
} from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import { useMarketplace } from '@/context/MarketplaceContext';

export default function HomePage() {
  const { products } = useMarketplace();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const whatsappUrl = 'https://chat.whatsapp.com/B750X2SJWyv5KkDwDoWIO7';
  const directWhatsappUrl = 'https://wa.me/9779761033755';
  const whatsappNumber = '9761033755';

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const trendingGames = products.filter(p => p.category === 'topup').slice(0, 4);
  const popularSubscriptions = products.filter(p => p.category === 'subscription').slice(0, 4);

  const faqs = [
    {
      q: 'Do I need to provide my game account passwords or OTP?',
      a: 'Never! For all game top-ups (Free Fire, Mobile Legends, PUBG Mobile, etc.), we exclusively require your public numeric Player ID (UID) or Character ID. We never ask for your passwords, OTP codes, or social media logins.'
    },
    {
      q: 'How fast will my diamonds / UC / subscription be delivered?',
      a: 'Over 98% of orders are delivered within 30 to 60 seconds after payment verification. Direct game UID top-ups are credited directly to your in-game vault instantly.'
    },
    {
      q: 'Which Nepali payment methods do you accept?',
      a: 'During checkout, you can pay via all major Nepali payment options including eSewa, Khalti, and Fonepay QR (scannable with any mobile banking app), or direct Bank Transfer.'
    },
    {
      q: 'How does your pricing formula work?',
      a: 'We maintain complete pricing transparency: our final retail selling prices follow our clear tiered business rule (Original Reference Price + NPR 20 fee for items up to Rs. 1,000, and + NPR 50 for items above Rs. 1,000) with zero hidden charges or currency conversion surprises.'
    },
    {
      q: 'What is the Shadow Wallet & Customer Access ID?',
      a: 'Every registered customer receives a unique Customer Access ID (SHADOW-XXXX). You can load funds into your Shadow Wallet anytime and enjoy 0-second instant checkout with one tap.'
    },
    {
      q: 'Can I track the status of my order?',
      a: 'Yes! Every purchase receives a unique Order ID. You can enter your Order ID anytime on our "Track Order" page to see real-time updates from payment verification to completion.'
    }
  ];

  return (
    <div className="flex-1 pb-16 space-y-12">
      {/* 1. Quick Action & Welcome Bar */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#111a33] via-[#0d152a] to-[#080d1a] border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 flex-shrink-0">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  ⚡ 60s Fast Delivery
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Automated In-Game Crediting</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Shadow Topup Center — Nepal's Premium Digital Hub
              </h1>
              <p className="text-xs text-slate-300">
                Official In-Game Top-Ups • AI & App Subscriptions • Instant Nepali QR Checkout
              </p>
            </div>
          </div>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-center">
            <a
              href="#shop-catalog"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Open Shop</span>
            </a>

            <Link
              href="/account"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#18233d] hover:bg-[#1f2d4e] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span>Customer Login</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Group</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Hero Slider */}
      <section className="max-w-7xl mx-auto px-4">
        <HeroSlider />
      </section>

      {/* 3. Category Filter & Main Products Grid */}
      <section id="shop-catalog" className="max-w-7xl mx-auto px-4 pt-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Explore Marketplace Catalog</span>
            </h2>
            <p className="text-xs text-slate-400">Choose a category to browse instant gaming credits & premium digital tools</p>
          </div>
        </div>

        <CategoryNav
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-[#0f172a] rounded-3xl border border-white/5">
            <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-base font-bold text-white">No products found in this category.</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting another category above.</p>
          </div>
        )}
      </section>

      {/* 4. Featured Section: Instant Game Top-Ups */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#111c35] via-[#0d1527] to-[#070b14] border border-indigo-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Trending Game Currencies</h3>
                <p className="text-xs text-slate-400">Top-rated games with 60-second direct UID top-up</p>
              </div>
            </div>
            <Link
              href="/category/topup"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>View All Games</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trendingGames.map((game) => (
              <ProductCard key={game.id} product={game} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Section: AI & App Subscriptions */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#191530] via-[#101326] to-[#070b14] border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Premium App & AI Subscriptions</h3>
                <p className="text-xs text-slate-400">Verified personal and team activations for creative professionals</p>
              </div>
            </div>
            <Link
              href="/category/subscription"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
            >
              <span>View All Subscriptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {popularSubscriptions.map((app) => (
              <ProductCard key={app.id} product={app} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-white tracking-tight">How It Works in 3 Simple Steps</h2>
          <p className="text-xs text-slate-400 mt-1">Get your game currency or digital subscription delivered in under 2 minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-white/5 relative group hover-card-glow">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-lg mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2">Select Your Product</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your game or service and pick your package (e.g. Free Fire Diamond Pass or ChatGPT Plus).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f172a] border border-white/5 relative group hover-card-glow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-lg mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2">Enter Details & Pay</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input your Player ID (UID) or delivery email. Pay securely via eSewa, Khalti, or Fonepay QR at checkout.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f172a] border border-white/5 relative group hover-card-glow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2">Instant Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your diamonds or vouchers are automatically credited within 60 seconds. Track your live order status anytime.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Why Choose Us & Customer Community */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0b101e] border border-white/10 relative overflow-hidden">
            <h2 className="text-2xl font-black text-white tracking-tight mb-3">
              Why Nepali Gamers & Creators Choose Shadow Topup Center
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Dedicated digital marketplace tailored specifically for Nepal with instant localized payment fulfillment and 24/7 automated delivery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Zero Password Guarantee</h4>
                  <p className="text-xs text-slate-400">We never ask for game passwords, Google logins, or OTPs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Transparent NPR 20 Pricing</h4>
                  <p className="text-xs text-slate-400">Clear cost breakdown with zero hidden currency fees.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">All Nepali Wallets Supported</h4>
                  <p className="text-xs text-slate-400">Pay at checkout via eSewa, Khalti, Fonepay, or Mobile Banking.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Customer Access ID & Wallet</h4>
                  <p className="text-xs text-slate-400">Deposit funds once and enjoy instant 0-second one-tap checkout.</p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Support & Community Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-[#0d1f18] to-[#07130e] border border-emerald-500/30 flex flex-col justify-between space-y-6 shadow-2xl shadow-emerald-950/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  24/7 Live
                </span>
              </div>
              <h3 className="text-xl font-black text-white">Direct WhatsApp Support</h3>
              <p className="text-sm font-extrabold text-emerald-400 mt-1">
                +977 {whatsappNumber}
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Need immediate help with your top-up, order status, or payment verification? Chat directly with our verified operations support team on WhatsApp.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp: {whatsappNumber}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Join Community Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0f172a] border border-white/5 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-bold text-white hover:text-indigo-300 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
