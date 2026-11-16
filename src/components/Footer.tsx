import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Headphones, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050811] border-t border-white/10 text-slate-400 text-sm">
      {/* Trust Badges Bar */}
      <div className="border-b border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">60-Second Top-Up</h4>
              <p className="text-xs text-slate-400">Automated UID delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Nepali Payments</h4>
              <p className="text-xs text-slate-400">eSewa, Khalti & Fonepay</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Guaranteed Best Price</h4>
              <p className="text-xs text-slate-400">Transparent NPR formula</p>
            </div>
          </div>

          <a
            href="https://wa.me/9779761033755"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-90 transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">24/7 WhatsApp Support</h4>
              <p className="text-xs text-emerald-400 font-bold">+977 9761033755</p>
            </div>
          </a>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">SHADOW</span>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">TOPUP CENTER</span>
            </div>
          </Link>
          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            Nepal's premier gaming top-up & digital subscription center. Instant automated delivery for Free Fire, Mobile Legends, PUBG UC, AI subscriptions, and gift cards across all 7 provinces of Nepal.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <a
              href="https://wa.me/9779761033755"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: 9761033755</span>
            </a>
            <a
              href="https://chat.whatsapp.com/B750X2SJWyv5KkDwDoWIO7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-600/20 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Join Community</span>
            </a>
          </div>
        </div>

        {/* Column 1: Game Top-Ups */}
        <div>
          <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-3">Game Top-Ups</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/product/free-fire-diamond-top-up" className="hover:text-white transition">Free Fire Diamonds</Link></li>
            <li><Link href="/product/mobile-legends-nepal" className="hover:text-white transition">Mobile Legends Diamonds</Link></li>
            <li><Link href="/product/pubg-mobile-uc-topup" className="hover:text-white transition">PUBG Mobile UC</Link></li>
            <li><Link href="/category/topup" className="hover:text-white transition">Clash of Clans Gems</Link></li>
            <li><Link href="/category/topup" className="hover:text-white transition">eFootball PES Coins</Link></li>
          </ul>
        </div>

        {/* Column 2: Apps & AI */}
        <div>
          <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-3">Subscriptions</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/product/chatgpt-plus-nepal-global" className="hover:text-white transition">ChatGPT Plus Official</Link></li>
            <li><Link href="/product/capcut-pro-nepal-global" className="hover:text-white transition">CapCut Pro Video Editor</Link></li>
            <li><Link href="/product/netflix-shared-account-nepal" className="hover:text-white transition">Netflix 4K UHD Profiles</Link></li>
            <li><Link href="/product/discord-nitro-nepal" className="hover:text-white transition">Discord Nitro & Boosts</Link></li>
            <li><Link href="/product/telegram-stars-and-premium" className="hover:text-white transition">Telegram Stars & Premium</Link></li>
          </ul>
        </div>

        {/* Column 3: Trust & Legal */}
        <div>
          <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-3">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/track" className="hover:text-white transition text-emerald-400 font-semibold">Track Live Order</Link></li>
            <li><Link href="/faq" className="hover:text-white transition">Frequently Asked Questions</Link></li>
            <li><Link href="/terms" className="hover:text-white transition">Terms & Delivery Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="/admin" className="hover:text-white transition text-indigo-400">Merchant Portal</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Payment Bar */}
      <div className="border-t border-white/5 py-6 px-4 bg-[#03060c]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Accepted in Nepal:</span>
            <span className="px-2.5 py-1 rounded bg-[#16a34a]/15 text-emerald-400 border border-emerald-500/20 font-bold">eSewa</span>
            <span className="px-2.5 py-1 rounded bg-[#7c3aed]/15 text-purple-400 border border-purple-500/20 font-bold">Khalti</span>
            <span className="px-2.5 py-1 rounded bg-[#dc2626]/15 text-rose-400 border border-rose-500/20 font-bold">Fonepay QR</span>
            <span className="px-2.5 py-1 rounded bg-[#0284c7]/15 text-sky-400 border border-sky-500/20 font-bold">ConnectIPS / Bank</span>
          </div>
          <p className="text-slate-500 text-center md:text-right">
            © 2026 Shadow Topup Center • Nepal. All rights reserved. Nepal IRD Tax Compliant.
          </p>
        </div>
      </div>
    </footer>
  );
}
