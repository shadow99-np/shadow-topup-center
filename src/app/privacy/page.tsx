import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-slate-300 text-xs leading-relaxed">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Storefront
      </Link>

      <div className="space-y-2 border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black text-white">Privacy & Data Protection Policy</h1>
        <p className="text-slate-400">Respecting your digital sovereignty and gaming privacy</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Information We Collect</h2>
        <p>
          We only collect information necessary to fulfill digital orders: customer name, email address (for order receipts), WhatsApp number (for instant order notifications and delivery codes), and public in-game Player IDs.
        </p>

        <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Zero Sensitive Credential Storage</h2>
        <p>
          We never collect, store, or transmit your game account passwords, social media logins, two-factor authentication codes, or credit card CVVs.
        </p>

        <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Third-Party Wallets</h2>
        <p>
          When paying via eSewa, Khalti, or Fonepay, payments are completed inside your authentic wallet application or banking app. We only record the transaction reference identifier to confirm payment.
        </p>
      </div>
    </div>
  );
}
