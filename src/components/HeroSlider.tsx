'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Zap, Sparkles, ShieldCheck } from 'lucide-react';

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  link: string;
  ctaText: string;
  image: string;
  gradient: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'ff-banner',
    title: 'Free Fire Diamond Top-Up',
    subtitle: 'Instant UID recharge in 60 seconds with eSewa, Khalti & Fonepay QR. Weekly Lite starting at Rs. 90.',
    badge: '⚡ Instant Automated Delivery',
    link: '/product/free-fire-diamond-top-up',
    ctaText: 'Recharge Now',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-amber-600/90 via-orange-950/80 to-[#070b14]',
  },
  {
    id: 'mlbb-banner',
    title: 'Mobile Legends Bang Bang',
    subtitle: 'Weekly Diamond Pass & Double Bonus Diamonds. Level up your hero skins and rank matches with ease.',
    badge: '🏆 Most Popular Pass',
    link: '/product/mobile-legends-nepal',
    ctaText: 'Get Weekly Pass',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-blue-700/90 via-indigo-950/80 to-[#070b14]',
  },
  {
    id: 'chatgpt-banner',
    title: 'ChatGPT Plus Upgrade',
    subtitle: 'Unlock GPT-4o, Advanced Voice Mode, Deep Research & high-speed image generation directly on your email.',
    badge: '🤖 Official AI Upgrade',
    link: '/product/chatgpt-plus-nepal-global',
    ctaText: 'Upgrade to Plus',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-emerald-700/90 via-teal-950/80 to-[#070b14]',
  },
  {
    id: 'capcut-banner',
    title: 'CapCut Pro Video Editor',
    subtitle: 'Export 4K 60FPS videos with AI upscaling, smart auto-captions, and premium cloud effects.',
    badge: '🎬 Content Creator Essential',
    link: '/product/capcut-pro-nepal-global',
    ctaText: 'Get CapCut Pro',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-purple-700/90 via-indigo-950/80 to-[#070b14]',
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#0a0f1d] min-h-[340px] sm:min-h-[400px]">
      {/* Background Image & Ambient Gradients */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${slide.image})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-all duration-700`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent opacity-90" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-16 flex flex-col justify-center h-full min-h-[340px] sm:min-h-[400px]">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{slide.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {slide.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed drop-shadow">
            {slide.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={slide.link}
              className="px-6 py-3 rounded-xl bg-white text-slate-950 font-extrabold text-sm hover:bg-slate-100 shadow-xl shadow-white/10 flex items-center gap-2 transition active:scale-95"
            >
              <Zap className="w-4 h-4 text-orange-600 fill-orange-600" />
              <span>{slide.ctaText}</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Merchant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center backdrop-blur-sm transition"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center backdrop-blur-sm transition"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
