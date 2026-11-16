'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does automated game top-up work?',
      a: 'We connect directly to official game distribution protocols. When you provide your Player ID (UID) and complete your payment, our system dispatches your currency within 30-60 seconds directly to your game server vault.'
    },
    {
      q: 'Is this legal and safe for my game account?',
      a: '100% yes! We only perform official authorized top-ups using standard publisher APIs and server IDs. Your account will never receive negative diamonds or face bans.'
    },
    {
      q: 'What if I entered an incorrect Player ID?',
      a: 'If the numeric ID does not exist on the selected server, our verification system stops the order and flags it for review. Please contact our 24/7 WhatsApp support immediately with your Order ID so our agents can correct the number before dispatch.'
    },
    {
      q: 'How do I pay with eSewa, Khalti, or Fonepay?',
      a: 'At checkout, select your preferred wallet or Fonepay QR. You can scan our merchant QR directly from any Nepali banking app (Nabil, Global IME, NIC Asia, etc.) or transfer to our wallet ID. Simply copy the Transaction ID or RRN code from your receipt and paste it into the verification box.'
    },
    {
      q: 'What is your refund policy?',
      a: 'If any top-up fails to credit due to a server downtime or supplier error that cannot be resolved within 1 hour, we issue an immediate 100% refund to your eSewa, Khalti, or bank account.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Storefront
      </Link>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Help & Frequently Asked Questions
        </h1>
        <p className="text-xs text-slate-400">Everything you need to know about top-ups, payments, and account safety</p>
      </div>

      <div className="space-y-3 pt-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-[#0e1526] border border-white/5 overflow-hidden"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-bold text-white hover:text-indigo-300 transition"
            >
              <span>{faq.q}</span>
              {openIdx === idx ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 text-center space-y-3 mt-8">
        <h3 className="text-sm font-bold text-white">Still have questions?</h3>
        <p className="text-xs text-slate-400">Our operations team is available 24 hours a day on WhatsApp to assist you.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://wa.me/9779761033755"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Support: 9761033755
          </a>
          <a
            href="https://chat.whatsapp.com/B750X2SJWyv5KkDwDoWIO7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-600/20 transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" /> Join Community
          </a>
        </div>
      </div>
    </div>
  );
}
