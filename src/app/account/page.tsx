'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  ShoppingBag, 
  CreditCard, 
  ShieldCheck, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Truck,
  Bookmark,
  Wallet,
  PlusCircle,
  Copy,
  Check,
  UploadCloud,
  X,
  AlertCircle,
  Sparkles,
  QrCode,
  Mail,
  Lock,
  Phone,
  RefreshCw,
  Zap,
  Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllOrders } from '@/lib/firebaseService';
import { Order, PaymentMethod } from '@/types/marketplace';
import { formatNpr } from '@/lib/pricingEngine';
import { NEPAL_PAYMENT_METHODS } from '@/data/nepalPayments';

export default function CustomerAccountPage() {
  const { 
    user, 
    logout, 
    walletBalance, 
    accessId, 
    fundRequests, 
    requestAddFunds,
    login,
    signup,
    loginWithGoogle,
    loginWithGoogleRedirect,
    resetPassword
  } = useAuth();

  // Auth Form states for guest view
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  // Add Funds Modal state
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(500);
  const [fundMethod, setFundMethod] = useState<'fonepay' | 'esewa' | 'khalti' | 'bank_transfer'>('fonepay');
  const [fundTrxRef, setFundTrxRef] = useState('');
  const [fundScreenshot, setFundScreenshot] = useState('');
  const [fundSubmitting, setFundSubmitting] = useState(false);
  const [fundSuccess, setFundSuccess] = useState(false);
  const [fundError, setFundError] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const paymentConfig = NEPAL_PAYMENT_METHODS[fundMethod];

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

  useEffect(() => {
    async function load() {
      const all = await fetchAllOrders();
      const myOrders = user?.email 
        ? all.filter(o => o.customerEmail?.toLowerCase() === user.email.toLowerCase() || o.userId === user.uid)
        : all.slice(0, 5);
      setOrders(myOrders.length > 0 ? myOrders : all.slice(0, 5));
      setLoading(false);
    }
    load();
  }, [user]);

  const handleCopyAccessId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accessId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyAccount = () => {
    if (paymentConfig?.accountNumber && navigator.clipboard) {
      navigator.clipboard.writeText(paymentConfig.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setFundError('Screenshot file size must be less than 15MB.');
      return;
    }
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
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setFundScreenshot(compressed);
            return;
          }
        } catch (canvasErr) {
          console.warn('Canvas compression fallback', canvasErr);
        }
        setFundScreenshot(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFundError('');
    if (!fundTrxRef.trim()) {
      setFundError('Please enter the payment Transaction ID / Reference code.');
      return;
    }
    if (fundAmount < 50) {
      setFundError('Minimum deposit amount is NPR 50.');
      return;
    }

    setFundSubmitting(true);
    const success = await requestAddFunds(fundAmount, fundMethod, fundTrxRef.trim(), fundScreenshot || undefined);
    setFundSubmitting(false);

    if (success) {
      setFundSuccess(true);
      setTimeout(() => {
        setFundSuccess(false);
        setIsFundModalOpen(false);
        setFundTrxRef('');
        setFundScreenshot('');
      }, 2500);
    } else {
      setFundError('Failed to submit fund deposit request. Please try again.');
    }
  };

  // If user is guest, show proper Firebase Authentication card (Google + Email)
  if (!user) {
    const handleGoogleSignIn = async () => {
      setAuthError('');
      setAuthSuccess('');
      setGoogleLoading(true);
      try {
        const res = await loginWithGoogle();
        if (!res.success) {
          if (res.error?.toLowerCase().includes('popup') || res.error?.toLowerCase().includes('blocked')) {
            await loginWithGoogleRedirect();
            return;
          }
          setAuthError(res.error || 'Google sign-in could not be completed.');
        }
      } catch (err: any) {
        if (err.message?.toLowerCase().includes('popup') || err.message?.toLowerCase().includes('blocked')) {
          try {
            await loginWithGoogleRedirect();
            return;
          } catch (rErr) {}
        }
        setAuthError(err.message || 'Failed to authenticate with Google.');
      } finally {
        setGoogleLoading(false);
      }
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setAuthSuccess('');
      setAuthLoading(true);

      try {
        if (authMode === 'forgot') {
          if (!authEmail) {
            setAuthError('Please enter your account email.');
            setAuthLoading(false);
            return;
          }
          const res = await resetPassword(authEmail);
          if (res.success) {
            setAuthSuccess(res.message || 'Password reset link sent! Check your inbox.');
          } else {
            setAuthError(res.error || 'Failed to send reset link.');
          }
        } else if (authMode === 'register') {
          if (!authDisplayName) {
            setAuthError('Please enter your full name.');
            setAuthLoading(false);
            return;
          }
          if (authPassword.length < 6) {
            setAuthError('Password must be at least 6 characters.');
            setAuthLoading(false);
            return;
          }
          const res = await signup(authEmail, authPassword, authDisplayName, authPhone);
          if (!res.success) {
            setAuthError(res.error || 'Failed to create account.');
          }
        } else {
          const res = await login(authEmail, authPassword);
          if (!res.success) {
            setAuthError(res.error || 'Invalid email or password.');
          }
        }
      } catch (err: any) {
        setAuthError(err.message || 'Authentication error.');
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
          <Zap className="w-8 h-8 text-amber-300" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">
            {authMode === 'login' ? 'Customer Sign In' : authMode === 'register' ? 'Create Customer Account' : 'Reset Account Password'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your Customer Access ID, in-store Shadow Wallet, and live order status
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1526] border border-white/10 shadow-2xl text-left space-y-5">
          {/* Tab Switcher */}
          {authMode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#141e34] border border-white/5">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Continue with Google */}
          {authMode !== 'forgot' && (
            <div className="space-y-4">
              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-3 transition shadow-lg active:scale-95 disabled:opacity-60"
              >
                {googleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0e1526] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  or continue with email
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={authDisplayName}
                      onChange={(e) => setAuthDisplayName(e.target.value)}
                      placeholder="e.g. Ramesh Karki"
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp / Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {authMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccess(''); }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 mt-4"
            >
              {authLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>
                    {authMode === 'login' ? 'Sign In to Account' : authMode === 'register' ? 'Create Customer Account' : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {authMode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                  className="text-xs text-slate-400 hover:text-white font-semibold"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Profile Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e1526] via-[#101b33] to-[#0a0f1d] border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {user?.displayName || 'Customer Dashboard'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Customer Access ID & Wallet Quick Cards */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Access ID Card */}
          <div className="p-3.5 rounded-2xl bg-[#141e34] border border-white/10 flex items-center gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Access ID</p>
              <p className="text-sm font-mono font-black text-white">{accessId}</p>
            </div>
            <button
              onClick={handleCopyAccessId}
              title="Copy Customer Access ID"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Wallet Balance Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Wallet Balance</p>
              <p className="text-base font-black text-white">{formatNpr(walletBalance)}</p>
            </div>
            <button
              onClick={() => setIsFundModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Funds</span>
            </button>
          </div>

          <button
            onClick={() => logout()}
            className="p-3 rounded-2xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Wallet Deposit History Section (if any requests) */}
      {fundRequests.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Wallet Deposit History</span>
            </h3>
            <button
              onClick={() => setIsFundModalOpen(true)}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              + Deposit More Funds
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fundRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl bg-[#141e34] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">{req.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    req.status === 'approved' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : req.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-amber-500/20 text-amber-300 animate-pulse'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Amount:</span>
                  <span className="text-sm font-black text-white">{formatNpr(req.amountNpr)}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  via {req.paymentMethod.toUpperCase()} • Ref: <span className="font-mono text-slate-300">{req.paymentReference}</span>
                </p>
                {req.screenshotUrl && (
                  <a
                    href={req.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>View Receipt Screenshot</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span>Recent Orders & Top-Up History</span>
            </h2>
            <p className="text-xs text-slate-400">Track real-time delivery status and receipts</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading order history...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0e1526] border border-white/5 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No orders placed yet</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
            >
              Browse Games & Apps
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-[#0e1526] border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      order.orderStatus === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : order.orderStatus === 'Payment Confirmed'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {order.items.map(i => `${i.productName} (${i.packageName})`).join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()} via {order.paymentMethod.toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <span className="text-sm font-extrabold text-emerald-400">
                    {formatNpr(order.totalNpr)}
                  </span>
                  <Link
                    href={`/order/${order.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs transition"
                  >
                    <span>View Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          ADD FUNDS MODAL
          ========================================================================= */}
      {isFundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1526] border border-white/15 p-6 shadow-2xl my-8">
            <button
              onClick={() => setIsFundModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add Funds to Shadow Wallet</h3>
                <p className="text-xs text-slate-400">Top-up your balance for 0-wait instant purchases</p>
              </div>
            </div>

            {fundSuccess ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Deposit Request Submitted!</h4>
                <p className="text-xs text-slate-300">
                  Our admin team has received your deposit details. Your wallet will be credited within minutes!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFundRequest} className="space-y-5">
                {/* Step A: Amount Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Select Amount to Add (NPR)</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[200, 500, 1000, 2000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFundAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold transition border ${
                          fundAmount === amt
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-[#141e34] text-slate-300 border-white/5 hover:border-white/10'
                        }`}
                      >
                        Rs {amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={fundAmount}
                    onChange={(e) => setFundAmount(Number(e.target.value))}
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Custom amount in NPR"
                  />
                </div>

                {/* Step B: Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['fonepay', 'esewa', 'khalti'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFundMethod(m)}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition border ${
                          fundMethod === m
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-[#141e34] text-slate-300 border-white/5'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step C: Merchant Account & QR Code */}
                {paymentConfig && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {paymentConfig.qrImage && (
                        <div className="flex flex-col items-center flex-shrink-0 w-32">
                          <div className="p-1.5 bg-white rounded-xl shadow-md border border-white/20 w-full">
                            <img
                              src={paymentConfig.qrImage}
                              alt={`${paymentConfig.name} QR Code`}
                              className="w-full h-28 object-contain rounded-lg"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">Scan & Pay</span>

                          <button
                            type="button"
                            onClick={() => handleDownloadQr(
                              paymentConfig.qrImage,
                              `ShadowTopup-Wallet-${paymentConfig.name.replace(/[^a-zA-Z0-9]/g, '_')}-QR.png`
                            )}
                            className="mt-1.5 w-full inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] font-bold shadow transition active:scale-95"
                            title="Download QR code to phone gallery"
                          >
                            <Download className="w-3 h-3" />
                            <span>{downloadSuccess ? 'Downloaded!' : 'Download QR'}</span>
                          </button>
                        </div>
                      )}

                      <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pay to {paymentConfig.name} ID / Number:</p>
                          <p className="text-base font-mono font-bold text-emerald-400">{paymentConfig.accountNumber}</p>
                          <p className="text-xs text-slate-300 font-medium">Recipient Name: <strong className="text-white">{paymentConfig.accountName}</strong></p>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition active:scale-95"
                        >
                          {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAccount ? 'Copied Number' : 'Copy Number (9761033755)'}</span>
                        </button>

                        <p className="text-[11px] text-slate-400 leading-tight">
                          Transfer Rs. {fundAmount} and copy the Transaction ID / Reference code from your receipt below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step D: Transaction ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Enter Transaction Reference Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fundTrxRef}
                    onChange={(e) => setFundTrxRef(e.target.value)}
                    placeholder="e.g. 10-digit transaction ID from eSewa/Fonepay"
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Step E: Screenshot Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Upload Payment Receipt Screenshot (Optional)
                  </label>
                  {!fundScreenshot ? (
                    <label className="border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer bg-black/20 transition">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleScreenshotUpload}
                      />
                      <UploadCloud className="w-6 h-6 text-emerald-400 mb-1" />
                      <p className="text-xs font-bold text-white">Attach screenshot</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG up to 5MB</p>
                    </label>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={fundScreenshot} alt="Receipt Preview" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-xs font-bold text-emerald-400">Screenshot Attached ✓</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFundScreenshot('')}
                        className="text-slate-400 hover:text-rose-400 text-xs p-1"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {fundError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{fundError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={fundSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:opacity-95 transition disabled:opacity-50"
                >
                  {fundSubmitting ? 'Submitting Request...' : `Submit Deposit for ${formatNpr(fundAmount)}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
