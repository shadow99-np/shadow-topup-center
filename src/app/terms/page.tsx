import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-slate-300 text-xs leading-relaxed">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Storefront
      </Link>

      <div className="space-y-2 border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black text-white">Terms & Delivery Conditions</h1>
        <p className="text-slate-400">Last updated: November 2026 • Governed by Nepal Electronic Transactions Act</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Digital Goods & Nature of Service</h2>
        <p>
          Nepal Digital Store provides digital top-up services, virtual credits, and voucher delivery for video games, entertainment streaming platforms, and artificial intelligence software subscriptions. All items are intangible digital commodities delivered electronically.
        </p>

        <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Account Information Accuracy</h2>
        <p>
          Customers are strictly responsible for providing accurate numeric Player IDs (UID), Zone IDs, or delivery email addresses. We will never ask for your game password or SMS one-time password (OTP). Orders processed to an incorrect UID provided by the user cannot be retrieved once credited by the game publisher.
        </p>

        <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Pricing & Transparency</h2>
        <p>
          All prices are quoted in Nepalese Rupees (NPR). Our retail pricing is calculated systematically from supplier base costs plus our transparent operational markup (NPR 20 for packages up to Rs. 1,000, and NPR 50 for packages above Rs. 1,000). There are zero hidden currency conversion fees.
        </p>

        <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Refund & Replacement Policy</h2>
        <p>
          If a digital product or game top-up fails to deliver due to our system error or publisher maintenance, we provide a full refund or immediate replacement upon verification of payment proof.
        </p>
      </div>
    </div>
  );
}
