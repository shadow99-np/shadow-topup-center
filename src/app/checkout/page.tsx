'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Trash2, 
  CreditCard, 
  Tag, 
  CheckCircle, 
  AlertCircle, 
  QrCode, 
  HelpCircle,
  Copy,
  Check,
  UploadCloud,
  ImageIcon,
  Wallet,
  X,
  MessageCircle,
  Zap,
  Lock,
  Download
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { NEPAL_PAYMENT_METHODS } from '@/data/nepalPayments';
import { formatNpr } from '@/lib/pricingEngine';
import { saveOrder } from '@/lib/firebaseService';
import { Order, PaymentMethod } from '@/types/marketplace';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, walletBalance, deductWalletBalance } = useAuth();
  const { 
    items, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    discountNpr, 
    totalNpr, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    isLoaded 
  } = useCart();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('fonepay');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Download QR Code image directly to device for gallery scanning
  const handleDownloadQr = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }
  };

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Auto-fill customer details from authenticated user
  useEffect(() => {
    if (user) {
      if (!customerName && user.displayName) setCustomerName(user.displayName);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  const paymentConfig = NEPAL_PAYMENT_METHODS[selectedMethod];

  // 1. Loading state while CartContext hydrates from localStorage
  if (!isLoaded) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-base font-bold text-white">Loading your secure checkout...</h2>
        <p className="text-xs text-slate-400 mt-1">Verifying selected items and pricing</p>
      </div>
    );
  }

  // 2. Empty Cart state
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No items to checkout</h2>
        <p className="text-xs text-slate-400 mb-6">
          Your shopping cart is currently empty. Please select a product from our catalog to proceed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </Link>
      </div>
    );
  }

  const handleCopyAccount = () => {
    if (paymentConfig?.accountNumber && navigator.clipboard) {
      navigator.clipboard.writeText(paymentConfig.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  // Client-side image compression to prevent Firestore 1MB and localStorage 5MB overflow
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Screenshot file size must be under 15MB.');
      return;
    }

    setIsCompressing(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // High quality, compact JPEG (typically 50KB - 90KB)
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setPaymentScreenshot(compressed);
            setIsCompressing(false);
            return;
          }
        } catch (canvasErr) {
          console.warn('Canvas compression fallback', canvasErr);
        }
        setPaymentScreenshot(event.target?.result as string);
        setIsCompressing(false);
      };
      img.onerror = () => {
        setIsCompressing(false);
        setErrorMsg('Could not read image file. Please try another image.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCodeInput('');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter your Full Name, Email Address, and WhatsApp/Phone Number.');
      return;
    }

    if (selectedMethod === 'wallet') {
      if (!user) {
        setErrorMsg('Please sign in to pay using your Shadow Wallet balance.');
        return;
      }
      if (walletBalance < totalNpr) {
        setErrorMsg(`Insufficient wallet balance (Current: ${formatNpr(walletBalance)}). Please choose another payment method or load funds.`);
        return;
      }
    } else {
      // Require EITHER Transaction ID OR Screenshot (or both)
      if (!transactionRef.trim() && !paymentScreenshot) {
        setErrorMsg(`Please enter your ${paymentConfig?.name || 'Payment'} Transaction ID or upload your payment screenshot.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const orderId = `ORD-${randomNum}`;

      // If wallet payment, deduct balance
      if (selectedMethod === 'wallet') {
        const isWalletPaid = deductWalletBalance(totalNpr);
        if (!isWalletPaid) {
          setErrorMsg('Failed to deduct from wallet balance. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Determine clean payment reference
      const paymentRef = selectedMethod === 'wallet'
        ? `WALLET-${user?.accessId || 'SHADOW'}-${randomNum}`
        : (transactionRef.trim() || `RECEIPT-UPLOADED-${randomNum}`);

      const newOrder: Order = {
        id: orderId,
        ...(user?.uid ? { userId: user.uid } : {}),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        items: items,
        subtotal: subtotal,
        discountNpr: discountNpr,
        totalNpr: totalNpr,
        ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
        paymentMethod: selectedMethod,
        paymentReference: paymentRef,
        ...(paymentScreenshot ? { paymentProofUrl: paymentScreenshot } : {}),
        orderStatus: selectedMethod === 'wallet' ? 'Payment Confirmed' : 'Payment Verification',
        deliveryType: 'automatic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await saveOrder(newOrder);
      if (res.success) {
        clearCart();
        router.push(`/order/${orderId}`);
      } else {
        setErrorMsg(res.error || 'Failed to place order.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during order submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-indigo-400" />
            <span>Secure Checkout & Payment</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete your order in NPR via eSewa, Khalti, or Fonepay QR (Pushkar Nepal • 9761033755)
          </p>
        </div>

        {/* WhatsApp Quick Assistance */}
        <a
          href="https://wa.me/9779761033755?text=Hi%20Shadow%20Topup,%20I%20have%20a%20question%20during%20checkout"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition shadow"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>Need Help? WhatsApp 9761033755</span>
        </a>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Contact Information & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Customer Contact Information */}
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 shadow-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">1</span>
              <span>Contact Information (For Instant Voucher & Receipt Delivery)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Karki"
                  className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  WhatsApp / Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Select Nepali Payment Method */}
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 shadow-xl space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">2</span>
              <span>Choose Nepali Payment Method</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Option 0: Shadow Wallet */}
              <button
                type="button"
                onClick={() => setSelectedMethod('wallet')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedMethod === 'wallet'
                    ? 'border-emerald-500 bg-emerald-600/15 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'border-white/5 bg-[#141e34] hover:border-white/15'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Instant ⚡
                  </span>
                  <h4 className="text-xs font-bold text-white mt-2 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Shadow Wallet</span>
                  </h4>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold">{formatNpr(walletBalance)}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border ${selectedMethod === 'wallet' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-500'}`} />
                </div>
              </button>

              {(Object.keys(NEPAL_PAYMENT_METHODS) as PaymentMethod[]).map((key) => {
                const method = NEPAL_PAYMENT_METHODS[key];
                const isSelected = selectedMethod === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedMethod(key)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600/15 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                        : 'border-white/5 bg-[#141e34] hover:border-white/15'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                        {method.badge}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-2">{method.name}</h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">NPR Wallet</span>
                      <div className={`w-3.5 h-3.5 rounded-full border ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-500'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Wallet Payment Card */}
            {selectedMethod === 'wallet' && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#101b2b] to-[#0a0f1d] border border-emerald-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Pay with Shadow Wallet Balance</h3>
                      <p className="text-xs text-slate-400">Direct debit from your account • 0-second instant fulfillment</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Your Current Balance</p>
                    <p className="text-base font-black text-emerald-400">{formatNpr(walletBalance)}</p>
                  </div>
                </div>

                {!user ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                    <span>You must be signed in to pay with your wallet.</span>
                    <Link href="/account" className="font-bold underline text-white">Sign In / Register</Link>
                  </div>
                ) : walletBalance < totalNpr ? (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">Insufficient Balance: Needs {formatNpr(totalNpr - walletBalance)} more</p>
                      <p className="text-[11px] text-slate-400">You can load funds in your account dashboard or select Fonepay / eSewa above.</p>
                    </div>
                    <Link href="/account" className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs whitespace-nowrap">
                      Load Wallet
                    </Link>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span>Balance Verified! Order will be debited instantly with zero transaction fees.</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Details & Instructions Card */}
            {selectedMethod !== 'wallet' && paymentConfig && (
              <div className="p-5 rounded-2xl bg-[#141e34] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Pay via {paymentConfig.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400">{paymentConfig.tagline}</p>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 border border-white/10">
                    <span className="text-xs text-slate-400">Pay:</span>
                    <span className="text-sm font-extrabold text-emerald-400">{formatNpr(totalNpr)}</span>
                  </div>
                </div>

                {/* QR Code and Account Details Box */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                  {paymentConfig.qrImage && (
                    <div className="flex flex-col items-center flex-shrink-0 w-36 sm:w-40">
                      <div className="p-2 bg-white rounded-xl shadow-lg border border-white/20 w-full">
                        <img
                          src={paymentConfig.qrImage}
                          alt={`${paymentConfig.name} QR Code`}
                          className="w-full h-32 sm:h-36 object-contain rounded-lg"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">Scan with {paymentConfig.name}</span>

                      {/* Download QR Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadQr(
                          paymentConfig.qrImage,
                          `ShadowTopup-${paymentConfig.name.replace(/[^a-zA-Z0-9]/g, '_')}-QR.png`
                        )}
                        className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
                        title="Download QR code to phone gallery"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadSuccess ? 'Downloaded!' : 'Download QR'}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                    <div>
                      <p className="text-[11px] text-slate-400">Account / Mobile Number</p>
                      <p className="text-base font-mono font-bold text-white tracking-wider">{paymentConfig.accountNumber}</p>
                      <p className="text-xs text-emerald-400 font-semibold">Account Name: {paymentConfig.accountName}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition active:scale-95"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount ? 'Copied Number' : 'Copy Number (9761033755)'}</span>
                    </button>

                    <p className="text-[11px] text-slate-400 leading-tight">
                      Open your eSewa, Khalti, or Mobile Banking app. Scan the QR code or transfer directly to <strong className="text-white">9761033755</strong> (Pushkar Nepal).
                    </p>
                  </div>
                </div>

                {/* Step Instructions */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="font-semibold text-slate-200">How to complete payment:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                    {paymentConfig.instructions.map((ins, idx) => (
                      <li key={idx}>{ins}</li>
                    ))}
                  </ol>
                </div>

                {/* Transaction Reference Input (Optional if Screenshot Attached) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-200">
                      Enter {paymentConfig.name} Transaction ID / Reference Code
                      {!paymentScreenshot && <span className="text-rose-400"> *</span>}
                    </label>
                    {paymentScreenshot && (
                      <span className="text-[10px] text-emerald-400 font-semibold">Screenshot attached (Optional)</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. 10-digit transaction ID or Fonepay RRN code"
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Found on your payment completion receipt or SMS confirmation. You can enter the ID or upload screenshot below.
                  </p>
                </div>

                {/* Screenshot Upload Dropzone */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-200">
                      Payment Screenshot (Fast-Track 60s Verification)
                      {!transactionRef.trim() && <span className="text-rose-400"> *</span>}
                    </label>
                    {isCompressing && (
                      <span className="text-[10px] text-indigo-400 animate-pulse">Compressing image...</span>
                    )}
                  </div>
                  
                  {!paymentScreenshot ? (
                    <label className="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleScreenshotChange}
                      />
                      <UploadCloud className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition mb-2" />
                      <p className="text-xs font-bold text-white">Click or tap to upload payment screenshot</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, WebP (auto-optimized)</p>
                    </label>
                  ) : (
                    <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={paymentScreenshot}
                          alt="Payment Receipt Preview"
                          className="w-14 h-14 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Screenshot Attached & Verified</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Ready for instant visual confirmation</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPaymentScreenshot('')}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review, Coupon & Submit */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white pb-3 border-b border-white/5 flex items-center justify-between">
              <span>Review Items ({items.length})</span>
              <span className="text-xs text-slate-400">Instant Delivery</span>
            </h3>

            {/* Items List with Requirements (UID, Server, Zone ID) */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.packageId} className="p-3 rounded-2xl bg-[#141e34] border border-white/5 space-y-2 text-xs">
                  <div className="flex gap-3">
                    <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{item.productName}</p>
                      <p className="text-indigo-400 font-semibold">{item.packageName}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-slate-400">Qty: {item.quantity}</span>
                        <span className="font-bold text-emerald-400">{formatNpr(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.packageId)}
                      className="text-slate-400 hover:text-rose-400 self-start p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Topup Requirements (UID, Server, Zone) */}
                  {item.requirements && Object.keys(item.requirements).length > 0 && (
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px]">
                      {Object.entries(item.requirements).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center text-slate-300">
                          <span className="capitalize text-slate-400">
                            {k === 'playerId' ? 'Player UID' : k === 'zoneId' ? 'Zone ID' : k === 'server' ? 'Server' : k}:
                          </span>
                          <span className="font-mono font-bold text-indigo-300 truncate max-w-[180px]">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Promo Coupon Box */}
            <div className="p-3.5 rounded-2xl bg-[#141e34] border border-white/5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Promo Coupon Code</span>
              </div>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="e.g. NEPAL10, WELCOME50"
                    className="flex-1 bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="text-emerald-400 font-bold font-mono">Coupon {appliedCoupon.code} Applied</span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponMessage && (
                <p className={`text-[11px] ${couponMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-white/5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-white font-semibold">{formatNpr(subtotal)}</span>
              </div>
              {discountNpr > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>- {formatNpr(discountNpr)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Processing & GST/VAT:</span>
                <span className="text-emerald-400 font-medium">Included (+Rs. 20)</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-base font-black text-white">
                <span>Total to Pay:</span>
                <span className="text-emerald-400 text-lg font-black">{formatNpr(totalNpr)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Order...' : 'Submit & Confirm Payment'}</span>
            </button>

            <div className="pt-2 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Manual Verification & Instant Auto-Keying</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Our support team verifies your transaction code & receipt in real time.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
