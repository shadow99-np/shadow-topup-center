'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  AlertCircle, 
  Copy, 
  Check, 
  MessageCircle,
  Package,
  CreditCard
} from 'lucide-react';
import { fetchOrderById } from '@/lib/firebaseService';
import { Order, OrderStatus } from '@/types/marketplace';
import { formatNpr } from '@/lib/pricingEngine';

const STATUS_STEPS: OrderStatus[] = [
  'Awaiting Payment',
  'Payment Verification',
  'Payment Confirmed',
  'Processing',
  'Completed',
];

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function load() {
      if (orderId) {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      }
      setLoading(false);
    }
    load();
  }, [orderId]);

  const handleCopy = () => {
    if (order?.id && navigator.clipboard) {
      navigator.clipboard.writeText(order.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          Could not find an order matching ID &ldquo;{orderId}&rdquo;. Please verify the order number.
        </p>
        <Link
          href="/track"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Try Order Lookup
        </Link>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Storefront
        </Link>
        <Link
          href="/track"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          Track another order →
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1526] border border-white/10 shadow-2xl space-y-6">
        {/* Header with status badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400">Order ID:</span>
              <span className="text-base font-mono font-extrabold text-white tracking-wider">{order.id}</span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition ml-1"
                title="Copy Order ID"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
              order.orderStatus === 'Completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : order.orderStatus === 'Payment Verification'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>{order.orderStatus}</span>
            </span>
          </div>
        </div>

        {/* Live Stepper Visualization */}
        <div className="py-2">
          <p className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">Live Status Progression</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STATUS_STEPS.map((step, idx) => {
              const isPastOrCurrent = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div
                  key={step}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                      : isPastOrCurrent
                      ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isPastOrCurrent ? (
                      <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-indigo-400' : 'text-emerald-400'}`} />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <p className="text-[11px] font-bold leading-tight">{step}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery / Credential Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#141e34] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Details</h4>
            <p className="text-sm font-semibold text-white">{order.customerName}</p>
            <p className="text-xs text-slate-300">Email: {order.customerEmail}</p>
            <p className="text-xs text-slate-300">WhatsApp/Phone: {order.customerPhone}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#141e34] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Verification</h4>
            <p className="text-sm font-semibold text-white uppercase">{order.paymentMethod.replace('_', ' ')}</p>
            <p className="text-xs text-slate-300 font-mono">Reference: {order.paymentReference || 'N/A'}</p>
            <p className="text-xs text-emerald-400 font-semibold">Total: {formatNpr(order.totalNpr)}</p>
            {order.paymentProofUrl && (
              <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                <a 
                  href={order.paymentProofUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/20 transition"
                >
                  <img src={order.paymentProofUrl} alt="Receipt" className="w-4 h-4 rounded object-cover" />
                  <span>View Attached Receipt Proof</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items in this Order</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#141e34] border border-white/5 flex gap-4 items-center">
                <img src={item.productImage} alt={item.productName} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-white">{item.productName}</h5>
                  <p className="text-xs font-semibold text-indigo-400">{item.packageName}</p>
                  {Object.entries(item.requirements).length > 0 && (
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mt-1">
                      {Object.entries(item.requirements).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-black/40 border border-white/5">
                          <strong className="text-slate-300 capitalize">{k}:</strong> {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400 block">{formatNpr(item.price * item.quantity)}</span>
                  <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Support / WhatsApp Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Need Immediate Assistance with Order #{order.id}?</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Chat directly with our Nepal operations team on WhatsApp for instantaneous status updates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://chat.whatsapp.com/B750X2SJWyv5KkDwDoWIO7"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 hover:bg-emerald-600/50 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Join Community</span>
            </a>
            <a
              href={`https://wa.me/9779761033755?text=Hi%20Shadow%20Topup,%20I%20am%20inquiring%20about%20Order%20${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct WhatsApp: 9761033755</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
