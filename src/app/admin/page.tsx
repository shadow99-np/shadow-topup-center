'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  Filter, 
  Edit3, 
  Check, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Eye, 
  Tag,
  PlusCircle,
  UploadCloud,
  ImageIcon,
  Wallet,
  ExternalLink,
  Trash2,
  Sparkles,
  Lock,
  KeyRound,
  LogOut,
  Ticket,
  Bell,
  Megaphone,
  Copy,
  Percent,
  CheckCircle,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ROSGAY_PACKAGE_MAPPINGS } from '@/lib/rosgayService';
import { 
  fetchAllOrders, 
  updateOrderStatus, 
  MASTER_ADMIN_EMAIL, 
  isMasterAdmin,
  fetchAllCoupons,
  saveCoupon,
  deleteCoupon,
  toggleCouponStatus,
  fetchAllAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus
} from '@/lib/firebaseService';
import { Order, OrderStatus, Product, ProductCategory, PackageVariation, ProductRequirementField, Coupon, StoreAnnouncement } from '@/types/marketplace';
import { formatNpr, calculateProfit, calculateSellingPrice } from '@/lib/pricingEngine';

export default function AdminDashboardPage() {
  const { 
    user, 
    isAdmin,
    login,
    logout,
    fundRequests, 
    approveFundRequest, 
    rejectFundRequest, 
    refreshFundRequests 
  } = useAuth();

  // Admin Security Gateway State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');
    setAdminAuthLoading(true);

    try {
      const res = await login(adminEmail.trim(), adminPassword);
      if (res.success) {
        if (!isMasterAdmin(adminEmail.trim())) {
          await logout();
          setAdminAuthError('Access Denied: This account does not possess Merchant Administrator privileges.');
        } else {
          loadOrders();
          refreshFundRequests();
          loadCoupons();
          loadAnnouncements();
        }
      } else {
        setAdminAuthError(res.error || 'Access Denied: Invalid administrator credentials.');
      }
    } catch (err: any) {
      setAdminAuthError(err.message || 'Authentication failed.');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const { 
    products, 
    pricingSettings, 
    updateGlobalMarkup, 
    toggleMarkupActive,
    overridePackagePrice,
    updateSupplierCost,
    toggleProductStock,
    togglePackageStock,
    addProduct,
    deleteProduct,
    resetAllPricing
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'funds' | 'pricing' | 'products' | 'coupons' | 'announcements' | 'supplier'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Coupon Management State
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [discountTypeInput, setDiscountTypeInput] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValueInput, setDiscountValueInput] = useState<number>(10);
  const [minOrderInput, setMinOrderInput] = useState<number>(500);
  const [maxDiscountInput, setMaxDiscountInput] = useState<number>(200);
  const [expiryDateInput, setExpiryDateInput] = useState<string>('');
  const [couponActiveInput, setCouponActiveInput] = useState<boolean>(true);
  const [applicableProductIdInput, setApplicableProductIdInput] = useState<string>('all');
  const [couponFormSubmitting, setCouponFormSubmitting] = useState(false);
  const [couponFormError, setCouponFormError] = useState('');
  const [couponFormSuccess, setCouponFormSuccess] = useState('');

  // False Request Rejection State (for False Top-Ups and False Deposits)
  const [rejectTarget, setRejectTarget] = useState<{
    type: 'order' | 'fund';
    id: string;
    customerName: string;
    amount?: number;
    reference?: string;
  } | null>(null);
  const [rejectReasonPreset, setRejectReasonPreset] = useState<string>('False / Unverified Transaction Reference');
  const [rejectCustomNote, setRejectCustomNote] = useState<string>('');
  const [rejectSubmitting, setRejectSubmitting] = useState<boolean>(false);

  // Announcement Management State
  const [announcementsList, setAnnouncementsList] = useState<StoreAnnouncement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [annTitleInput, setAnnTitleInput] = useState('');
  const [annMessageInput, setAnnMessageInput] = useState('');
  const [annBadgeInput, setAnnBadgeInput] = useState<'HOT' | 'DISCOUNT' | 'UPDATE' | 'NOTICE'>('UPDATE');
  const [annCouponCodeInput, setAnnCouponCodeInput] = useState('');
  const [annLinkInput, setAnnLinkInput] = useState('');
  const [annActiveInput, setAnnActiveInput] = useState<boolean>(true);
  const [annFormSubmitting, setAnnFormSubmitting] = useState(false);
  const [annFormError, setAnnFormError] = useState('');
  const [annFormSuccess, setAnnFormSuccess] = useState('');
  
  // Quick Markup Edit
  const [markupInput, setMarkupInput] = useState(pricingSettings.globalMarkupNpr.toString());
  const [highTierMarkupInput, setHighTierMarkupInput] = useState((pricingSettings.highTierMarkupNpr ?? 50).toString());
  const [markupSaved, setMarkupSaved] = useState(false);

  // Selected Order for Action or Screenshot Preview
  const [actionNotes, setActionNotes] = useState('');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('topup');
  const [newProdPublisher, setNewProdPublisher] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdReqType, setNewProdReqType] = useState<'player_id' | 'player_and_zone' | 'email' | 'login_credentials' | 'whatsapp_only' | 'none'>('player_id');
  const [newProdInstant, setNewProdInstant] = useState(true);
  
  // Packages for new product
  const [packagesList, setPackagesList] = useState<Array<{ name: string; originalPrice: number; sellingPrice: number }>>([
    { name: 'Starter Pack', originalPrice: 100, sellingPrice: 120 },
    { name: 'Standard Pack', originalPrice: 250, sellingPrice: 270 }
  ]);
  const [addProdSubmitting, setAddProdSubmitting] = useState(false);
  const [addProdError, setAddProdError] = useState('');
  const [addProdSuccess, setAddProdSuccess] = useState(false);

  const loadOrders = async () => {
    setLoadingOrders(true);
    const data = await fetchAllOrders();
    setOrders(data);
    setLoadingOrders(false);
  };

  const loadCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const data = await fetchAllCoupons();
      setCouponsList(data);
    } catch (e) {} finally {
      setLoadingCoupons(false);
    }
  };

  const loadAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const data = await fetchAllAnnouncements();
      setAnnouncementsList(data);
    } catch (e) {} finally {
      setLoadingAnnouncements(false);
    }
  };

  // Rosgay Supplier Automation State
  const [rosgayStatus, setRosgayStatus] = useState<{
    connected: boolean;
    balance: number;
    username: string;
    name: string;
    email: string;
    mappingsCount: number;
  } | null>(null);
  const [rosgayLoading, setRosgayLoading] = useState(false);
  const [rosgayAutopilot, setRosgayAutopilot] = useState(false);

  // Rosgay Dispatch Modal State
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [dispatchModalItem, setDispatchModalItem] = useState<any | null>(null);
  const [dispatchModalMapping, setDispatchModalMapping] = useState<any | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState('');

  const fetchRosgayBalance = async () => {
    setRosgayLoading(true);
    try {
      const res = await fetch('/api/supplier/rosgay');
      if (res.ok) {
        const data = await res.json();
        setRosgayStatus(data);
      }
    } catch (e) {
      console.warn('Error fetching Rosgay balance', e);
    } finally {
      setRosgayLoading(false);
    }
  };

  const openRosgayDispatchModal = (order: Order, item: any) => {
    const mapping = ROSGAY_PACKAGE_MAPPINGS[item.packageId];
    setDispatchModalOrder(order);
    setDispatchModalItem(item);
    setDispatchModalMapping(mapping || null);
    setDispatchError('');
    setDispatchSuccess('');
    fetchRosgayBalance();
  };

  const handleConfirmRosgayDispatch = async () => {
    if (!dispatchModalOrder || !dispatchModalItem) return;
    setDispatching(true);
    setDispatchError('');
    setDispatchSuccess('');

    try {
      const res = await fetch('/api/supplier/rosgay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fulfill',
          orderId: dispatchModalOrder.id,
          item: dispatchModalItem
        })
      });

      const data = await res.json();
      if (data.success) {
        await updateOrderStatus(
          dispatchModalOrder.id,
          'Completed',
          `Auto-fulfilled via Rosgay Shop API (Item: ${dispatchModalMapping?.name || dispatchModalItem.packageName}, Wholesale: Rs. ${data.requiredCost || 0} NPR)`
        );
        setDispatchSuccess(`Order ${dispatchModalOrder.id} successfully dispatched to Rosgay Shop and marked Completed!`);
        await loadOrders();
        await fetchRosgayBalance();
        setTimeout(() => {
          setDispatchModalOrder(null);
          setDispatchSuccess('');
        }, 2000);
      } else {
        setDispatchError(data.message || 'Rosgay fulfillment failed.');
      }
    } catch (e: any) {
      setDispatchError(e.message || 'Network error executing Rosgay dispatch.');
    } finally {
      setDispatching(false);
    }
  };

  useEffect(() => {
    loadOrders();
    refreshFundRequests();
    loadCoupons();
    loadAnnouncements();
    fetchRosgayBalance();
  }, []);

  const handleGenerateRandomCouponCode = () => {
    const prefixes = ['SHADOW', 'NEPAL', 'DIAMOND', 'FLASH', 'TOPUP'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setCouponCodeInput(`${prefix}${num}`);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFormError('');
    setCouponFormSuccess('');
    if (!couponCodeInput.trim()) {
      setCouponFormError('Coupon code is required.');
      return;
    }
    if (discountValueInput <= 0) {
      setCouponFormError('Discount value must be greater than 0.');
      return;
    }
    setCouponFormSubmitting(true);
    try {
      let applicableId: string | undefined = undefined;
      let applicableName: string | undefined = undefined;

      if (applicableProductIdInput.startsWith('cat:')) {
        applicableId = applicableProductIdInput;
        const catMap: Record<string, string> = {
          'cat:topup': 'All Game Top-Ups (Free Fire, Roblox, MLBB, etc.)',
          'cat:subscription': 'All Subscriptions (ChatGPT, CapCut, Netflix, etc.)',
          'cat:giftcard': 'All Gift Cards & Vouchers',
          'cat:live_coins': 'All Live App Coins (TikTok, etc.)',
          'cat:gamekeys': 'All Digital Keys & Cards'
        };
        applicableName = catMap[applicableProductIdInput] || 'Category Restriction';
      } else if (applicableProductIdInput !== 'all') {
        const selectedProduct = products.find(p => p.id === applicableProductIdInput);
        if (selectedProduct) {
          applicableId = selectedProduct.id;
          applicableName = selectedProduct.name;
        }
      }

      const newCoupon: Coupon = {
        code: couponCodeInput.trim().toUpperCase(),
        discountType: discountTypeInput,
        discountValue: Number(discountValueInput),
        minOrderNpr: minOrderInput ? Number(minOrderInput) : undefined,
        maxDiscountNpr: discountTypeInput === 'percentage' && maxDiscountInput ? Number(maxDiscountInput) : undefined,
        expiryDate: expiryDateInput ? expiryDateInput : undefined,
        applicableProductId: applicableId,
        applicableProductName: applicableName,
        usedCount: 0,
        active: couponActiveInput
      };

      // Optimistic instant UI addition
      setCouponsList(prev => [newCoupon, ...prev.filter(c => c.code.toUpperCase() !== newCoupon.code)]);

      const ok = await saveCoupon(newCoupon);
      if (ok) {
        setCouponFormSuccess(`Coupon ${newCoupon.code} created and published successfully!`);
        setCouponCodeInput('');
        setApplicableProductIdInput('all');
        loadCoupons();
        setTimeout(() => setCouponFormSuccess(''), 4000);
      } else {
        setCouponFormError('Failed to save coupon.');
      }
    } catch (err: any) {
      setCouponFormError(err.message || 'Error creating coupon.');
    } finally {
      setCouponFormSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setRejectSubmitting(true);
    const combinedReason = rejectCustomNote.trim() 
      ? `${rejectReasonPreset}: ${rejectCustomNote.trim()}`
      : rejectReasonPreset;

    const target = rejectTarget;
    setRejectTarget(null);
    setRejectCustomNote('');
    setRejectReasonPreset('False / Unverified Transaction Reference');

    try {
      if (target.type === 'order') {
        // Optimistic UI update
        setOrders(prev => prev.map(o => o.id === target.id ? { ...o, orderStatus: 'Cancelled', statusNotes: combinedReason, updatedAt: new Date().toISOString() } : o));
        await updateOrderStatus(target.id, 'Cancelled', combinedReason);
        await loadOrders();
      } else if (target.type === 'fund') {
        await rejectFundRequest(target.id, combinedReason);
        await refreshFundRequests();
      }
    } catch (e) {
      console.error('Error rejecting target:', e);
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleToggleCoupon = async (code: string, currentActive: boolean) => {
    // Optimistic UI update
    setCouponsList(prev => prev.map(c => c.code.toUpperCase() === code.toUpperCase() ? { ...c, active: !currentActive } : c));
    await toggleCouponStatus(code, !currentActive);
    loadCoupons();
  };

  const handleDeleteCoupon = async (code: string) => {
    if (confirm(`Are you sure you want to delete coupon code "${code}"?`)) {
      setCouponsList(prev => prev.filter(c => c.code.toUpperCase() !== code.toUpperCase()));
      await deleteCoupon(code);
      loadCoupons();
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnFormError('');
    setAnnFormSuccess('');
    if (!annTitleInput.trim() || !annMessageInput.trim()) {
      setAnnFormError('Title and message are required.');
      return;
    }
    setAnnFormSubmitting(true);
    try {
      const newAnn: StoreAnnouncement = {
        id: `ann-${Date.now()}`,
        title: annTitleInput.trim(),
        message: annMessageInput.trim(),
        badge: annBadgeInput,
        couponCode: annCouponCodeInput.trim().toUpperCase() || undefined,
        link: annLinkInput.trim() || undefined,
        active: annActiveInput,
        createdAt: new Date().toISOString()
      };
      const ok = await saveAnnouncement(newAnn);
      if (ok) {
        setAnnFormSuccess('Announcement published successfully!');
        setAnnTitleInput('');
        setAnnMessageInput('');
        setAnnCouponCodeInput('');
        setAnnLinkInput('');
        loadAnnouncements();
        setTimeout(() => setAnnFormSuccess(''), 4000);
      } else {
        setAnnFormError('Failed to publish announcement.');
      }
    } catch (err: any) {
      setAnnFormError(err.message || 'Error publishing announcement.');
    } finally {
      setAnnFormSubmitting(false);
    }
  };

  const handleToggleAnnouncement = async (id: string, currentActive: boolean) => {
    setAnnouncementsList(prev => prev.map(a => a.id === id ? { ...a, active: !currentActive } : a));
    await toggleAnnouncementStatus(id, !currentActive);
    loadAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncementsList(prev => prev.filter(a => a.id !== id));
      await deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  const handleUpdateMarkup = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(markupInput);
    const highVal = parseFloat(highTierMarkupInput);
    if (!isNaN(val) && val >= 0) {
      updateGlobalMarkup(val, !isNaN(highVal) && highVal >= 0 ? highVal : undefined);
      setMarkupSaved(true);
      setTimeout(() => setMarkupSaved(false), 2000);
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status, statusNotes: actionNotes || o.statusNotes, updatedAt: new Date().toISOString() } : o));
    await updateOrderStatus(orderId, status, actionNotes);
    setActionNotes('');
    loadOrders();
  };

  // Image Upload handler for new product
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProdImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPackageRow = () => {
    setPackagesList(prev => [
      ...prev,
      { name: `Package ${prev.length + 1}`, originalPrice: 100, sellingPrice: 120 }
    ]);
  };

  const handleRemovePackageRow = (idx: number) => {
    setPackagesList(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePackageChange = (idx: number, field: 'name' | 'originalPrice' | 'sellingPrice', value: any) => {
    setPackagesList(prev => {
      const copy = [...prev];
      if (field === 'originalPrice') {
        const num = parseFloat(value) || 0;
        copy[idx].originalPrice = num;
        const { sellingPrice } = calculateSellingPrice(num, {
          markupNpr: pricingSettings.globalMarkupNpr,
          highTierMarkupNpr: pricingSettings.highTierMarkupNpr,
          highTierThresholdNpr: pricingSettings.highTierThresholdNpr,
          isMarkupActive: pricingSettings.isMarkupActive
        });
        copy[idx].sellingPrice = sellingPrice;
      } else if (field === 'sellingPrice') {
        copy[idx].sellingPrice = parseFloat(value) || 0;
      } else {
        copy[idx].name = value;
      }
      return copy;
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddProdError('');

    if (!newProdName.trim()) {
      setAddProdError('Please enter a Product Name.');
      return;
    }
    if (!newProdImage.trim()) {
      setAddProdError('Please upload an image or provide an Image URL.');
      return;
    }
    if (packagesList.length === 0) {
      setAddProdError('Please add at least one package variation.');
      return;
    }

    setAddProdSubmitting(true);

    try {
      const slug = newProdName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const prodId = 'prod_' + Math.random().toString(36).substring(2, 9);

      // Define requirement fields
      let requirementFields: ProductRequirementField[] = [];
      let requiresPlayerId = false;

      if (newProdReqType === 'player_id') {
        requiresPlayerId = true;
        requirementFields = [{
          id: 'playerId',
          label: 'Player ID (UID)',
          placeholder: 'Enter numeric Player ID',
          type: 'text',
          required: true
        }];
      } else if (newProdReqType === 'player_and_zone') {
        requiresPlayerId = true;
        requirementFields = [
          { id: 'playerId', label: 'User ID', placeholder: 'Enter numeric User ID', type: 'text', required: true },
          { id: 'zoneId', label: 'Zone ID / Server', placeholder: 'e.g. 2042', type: 'text', required: true }
        ];
      } else if (newProdReqType === 'email') {
        requirementFields = [
          { id: 'deliveryEmail', label: 'Account / Delivery Email', placeholder: 'your.account@gmail.com', type: 'email', required: true }
        ];
      } else if (newProdReqType === 'login_credentials') {
        requirementFields = [
          { id: 'accountEmail', label: 'Account Email / Gmail', placeholder: 'yourname@gmail.com', type: 'email', required: true, helpText: 'Account email where service will be activated.' },
          { id: 'accountPassword', label: 'Account Password', placeholder: 'Temporary password', type: 'password', required: true, helpText: 'Required by supplier for login upgrade.' },
          { id: 'whatsappNumber', label: 'WhatsApp Number for 2FA/Confirmation', placeholder: '98XXXXXXXX', type: 'text', required: true, helpText: 'For delivery & 2FA coordination.' }
        ];
      } else if (newProdReqType === 'whatsapp_only') {
        requirementFields = [
          { id: 'whatsappNumber', label: 'WhatsApp Number for Account Credentials', placeholder: '98XXXXXXXX', type: 'text', required: true, helpText: 'We send your pre-activated account login & PIN to this WhatsApp.' }
        ];
      }

      // Map packages
      const formattedPackages: PackageVariation[] = packagesList.map((pkg, i) => ({
        id: `${prodId}_pkg_${i + 1}`,
        name: pkg.name.trim(),
        originalPrice: pkg.originalPrice,
        sellingPrice: pkg.sellingPrice,
        markupNpr: pkg.sellingPrice - pkg.originalPrice,
        instantDelivery: newProdInstant,
        inStock: true
      }));

      const newProduct: Product = {
        id: prodId,
        slug,
        name: newProdName.trim(),
        publisher: newProdPublisher.trim() || 'Digital Publisher',
        category: newProdCategory,
        categoryLabel: newProdCategory === 'topup' ? 'Game Top-Up' : newProdCategory === 'subscription' ? 'App Subscription' : newProdCategory === 'giftcard' ? 'Gift Card' : 'Live Streaming',
        image: newProdImage,
        description: newProdDesc.trim() || `${newProdName} digital credits with instant delivery.`,
        shortDescription: `Buy ${newProdName} packages instantly via eSewa, Khalti & Fonepay.`,
        instantDelivery: newProdInstant,
        requiresPlayerId,
        requirementFields,
        packages: formattedPackages,
        inStock: true,
        tags: [newProdName.toLowerCase(), newProdCategory, 'nepal'],
        lastCheckedDate: new Date().toISOString().split('T')[0]
      };

      const ok = await addProduct(newProduct);
      if (ok) {
        setAddProdSuccess(true);
        setTimeout(() => {
          setAddProdSuccess(false);
          setIsAddProductOpen(false);
          setNewProdName('');
          setNewProdImage('');
          setNewProdDesc('');
        }, 1500);
      } else {
        setAddProdError('Could not save product.');
      }
    } catch (err: any) {
      setAddProdError(err.message || 'Error creating product.');
    } finally {
      setAddProdSubmitting(false);
    }
  };

  // Metrics calculations
  const totalSalesNpr = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.totalNpr : 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Payment Verification' || o.orderStatus === 'Awaiting Payment').length;
  const completedOrders = orders.filter(o => o.orderStatus === 'Completed').length;
  const pendingFundsCount = fundRequests.filter(r => r.status === 'pending').length;

  const estimatedProfit = Math.round(orders.reduce((sum, o) => {
    if (o.orderStatus === 'Cancelled') return sum;
    const orderProfit = o.items.reduce((itemSum, item) => {
      const isHighTier = (item.originalPrice || item.price) > (pricingSettings.highTierThresholdNpr ?? 1000);
      const profitPerUnit = isHighTier ? (pricingSettings.highTierMarkupNpr ?? 50) : pricingSettings.globalMarkupNpr;
      return itemSum + (profitPerUnit * (item.quantity || 1));
    }, 0);
    return sum + orderProfit;
  }, 0));

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderFilter === 'all' ? true : o.orderStatus === orderFilter;
    const matchesSearch = orderSearch.trim() === '' ? true :
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.paymentReference && o.paymentReference.toLowerCase().includes(orderSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-[#11192e] to-[#0a0f1d] border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider">
              Restricted Security Gateway
            </span>
            <h1 className="text-2xl font-black text-white mt-3">Admin Portal Verification</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              This management console is strictly restricted to the registered Shadow Topup Administrator.
            </p>
          </div>

          {user && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Unauthorized Account</p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Logged in as customer: <span className="underline font-semibold">{user.email}</span>. This account does not possess Merchant Administrator privileges.
                </p>
              </div>
            </div>
          )}

          {adminAuthError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="font-semibold">{adminAuthError}</p>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="merchant.admin@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm outline-none transition placeholder-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Security Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm outline-none transition placeholder-slate-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {adminAuthLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Unlock Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition"
            >
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 sm:py-8 space-y-5 sm:space-y-8 overflow-x-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0d162b] via-[#101b33] to-[#0a0f1d] border border-indigo-500/20 shadow-2xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Sliders className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">Merchant Admin Center</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-xs font-bold uppercase">
                Master Admin Verified
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Logged in as: <strong className="text-indigo-300">Yadu Nepal</strong> ({MASTER_ADMIN_EMAIL})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Live Rosgay Wholesale Balance Pill */}
          {rosgayStatus?.connected ? (
            <div 
              onClick={() => setActiveTab('supplier')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-pointer hover:bg-emerald-500/20 transition text-xs font-bold"
              title="Click to open Rosgay Automation Center"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Rosgay: Rs. {rosgayStatus.balance} NPR</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fetchRosgayBalance(); }}
                className="hover:rotate-180 transition p-0.5 text-emerald-300"
                title="Refresh Rosgay live balance"
              >
                <RefreshCw className={`w-3 h-3 ${rosgayLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setActiveTab('supplier')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/20 transition text-xs font-bold"
              title="Configure Rosgay Supplier"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Connect Rosgay</span>
            </div>
          )}

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => { loadOrders(); refreshFundRequests(); loadCoupons(); loadAnnouncements(); fetchRosgayBalance(); }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
            title="Refresh Store Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={async () => { await logout(); }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-400 hover:text-rose-300 transition"
            title="Log out from Admin Center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock & Exit</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-white/10 pb-2.5 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1 sm:mx-0 sm:px-0">
        {[
          { id: 'overview', label: 'Performance Overview', icon: TrendingUp },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : undefined },
          { id: 'funds', label: `Wallet Deposits (${fundRequests.length})`, icon: Wallet, badge: pendingFundsCount > 0 ? pendingFundsCount : undefined },
          { id: 'supplier', label: '⚡ Rosgay Automation', icon: Zap, badge: rosgayStatus?.connected ? `Rs. ${rosgayStatus.balance}` : undefined },
          { id: 'coupons', label: `Coupons & Promos (${couponsList.length})`, icon: Ticket },
          { id: 'announcements', label: `Notices & Updates (${announcementsList.length})`, icon: Bell },
          { id: 'pricing', label: `Pricing Formula (+Rs. ${pricingSettings.globalMarkupNpr} / +Rs. ${pricingSettings.highTierMarkupNpr ?? 50})`, icon: DollarSign },
          { id: 'products', label: `Catalog (${products.length})`, icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW METRICS
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#0e1526] border border-white/10 shadow-lg space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Gross Sales</span>
              <p className="text-2xl font-black text-white">{formatNpr(totalSalesNpr)}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span>All time order volume</span>
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0e1526] border border-white/10 shadow-lg space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Profit</span>
              <p className="text-2xl font-black text-purple-400">{formatNpr(estimatedProfit)}</p>
              <p className="text-[10px] text-slate-400">Tiered profit: Rs. {pricingSettings.globalMarkupNpr} (≤1K) / Rs. {pricingSettings.highTierMarkupNpr ?? 50} (&gt;1K)</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0e1526] border border-white/10 shadow-lg space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Orders</span>
              <p className="text-2xl font-black text-amber-400">{pendingOrders}</p>
              <p className="text-[10px] text-slate-400">Requires verification</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0e1526] border border-white/10 shadow-lg space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Wallet Deposits Pending</span>
              <p className="text-2xl font-black text-emerald-400">{pendingFundsCount}</p>
              <p className="text-[10px] text-slate-400">Awaiting balance credit</p>
            </div>
          </div>

          {/* Quick Markup Config Card */}
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  <span>Automated Markup Business Rule Settings</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tiered Rule: <strong>Original Price + Rs. {pricingSettings.globalMarkupNpr} (≤1K) • + Rs. {pricingSettings.highTierMarkupNpr ?? 50} (&gt;1K)</strong>
                </p>
              </div>

              <form onSubmit={handleUpdateMarkup} className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">≤1K Profit:</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={markupInput}
                    onChange={(e) => setMarkupInput(e.target.value)}
                    className="w-16 bg-[#141e34] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-indigo-400 whitespace-nowrap">&gt;1K Profit:</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={highTierMarkupInput}
                    onChange={(e) => setHighTierMarkupInput(e.target.value)}
                    className="w-16 bg-[#141e34] border border-indigo-500/40 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
                >
                  {markupSaved ? 'Saved ✓' : 'Update'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ORDER VERIFICATION & MANAGEMENT
          ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0e1526] border border-white/10">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search Order ID, Name, Reference..."
                className="w-full bg-[#141e34] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {['all', 'Payment Verification', 'Payment Confirmed', 'Completed', 'Cancelled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    orderFilter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#141e34] text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Orders Card View (Phone / Small Screens) */}
          <div className="block md:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#0e1526] border border-white/5 text-slate-400 text-xs">
                No orders match your filter criteria.
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-2xl bg-[#0e1526] border border-white/10 space-y-3 shadow-lg">
                  {/* Card Header: Order ID & Date + Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div>
                      <span className="font-mono font-bold text-white text-xs block">{ord.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      ord.orderStatus === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : ord.orderStatus === 'Payment Confirmed'
                        ? 'bg-blue-500/20 text-blue-300'
                        : ord.orderStatus === 'Cancelled'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300 animate-pulse'
                    }`}>
                      {ord.orderStatus}
                    </span>
                  </div>

                  {/* Customer Details & Payment Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Customer</span>
                      <span className="font-bold text-white block truncate">{ord.customerName}</span>
                      <span className="text-[11px] text-slate-400 block">{ord.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment</span>
                      <span className="font-bold uppercase text-white block">{ord.paymentMethod}</span>
                      <span className="text-emerald-400 font-extrabold text-sm block">{formatNpr(ord.totalNpr)}</span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">Ref: {ord.paymentReference || 'None'}</span>
                    </div>
                  </div>

                  {/* Items & Requirements */}
                  <div className="bg-[#141e34] rounded-xl p-2.5 space-y-2 border border-white/5 text-xs">
                    {ord.items.map((i, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-xs">{i.productName}</span>
                          <span className="text-indigo-400 text-[11px] font-semibold">{i.packageName} (x{i.quantity})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(i.requirements).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-emerald-400 font-mono">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Attached Screenshot Button */}
                  {ord.paymentProofUrl && (
                    <button
                      onClick={() => setPreviewScreenshotUrl(ord.paymentProofUrl || null)}
                      className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Payment Receipt Screenshot</span>
                    </button>
                  )}

                  {/* Cancellation Reason note */}
                  {ord.statusNotes && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                      <div>
                        <strong className="block text-rose-400">Rejection Reason:</strong>
                        <span>{ord.statusNotes}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                    {ord.orderStatus !== 'Completed' && ord.orderStatus !== 'Cancelled' && (
                      <>
                        {(() => {
                          const automatableItem = ord.items.find(i => ROSGAY_PACKAGE_MAPPINGS[i.packageId]);
                          if (automatableItem) {
                            return (
                              <button
                                type="button"
                                onClick={() => openRosgayDispatchModal(ord, automatableItem)}
                                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition"
                                title="Instant Auto-Topup via Rosgay Shop"
                              >
                                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                                <span>Auto-Topup</span>
                              </button>
                            );
                          }
                          return null;
                        })()}
                        <button
                          onClick={() => handleStatusChange(ord.id, 'Completed')}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                        >
                          Approve & Complete
                        </button>
                        <button
                          onClick={() => setRejectTarget({
                            type: 'order',
                            id: ord.id,
                            customerName: ord.customerName,
                            amount: ord.totalNpr,
                            reference: ord.paymentReference
                          })}
                          className="py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs transition"
                        >
                          Reject (False)
                        </button>
                      </>
                    )}
                    <Link
                      href={`/order/${ord.id}`}
                      target="_blank"
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs inline-flex items-center justify-center"
                      title="Open Order Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Orders Table */}
          <div className="hidden md:block overflow-x-auto rounded-3xl bg-[#0e1526] border border-white/10 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141e34] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Item & Requirements</th>
                  <th className="py-3.5 px-4">Payment & Proof</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div>
                        <span>{ord.id}</span>
                        <p className="text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400">{ord.customerPhone}</p>
                      <p className="text-[10px] text-slate-500">{ord.customerEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {ord.items.map((i, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="font-semibold text-white">{i.productName}</p>
                          <p className="text-indigo-400 text-[11px]">{i.packageName} (Qty: {i.quantity})</p>
                          {Object.entries(i.requirements).map(([k, v]) => (
                            <span key={k} className="inline-block mr-1 text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-emerald-400 font-mono">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold uppercase text-white block">{ord.paymentMethod}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">
                        Ref: {ord.paymentReference || 'None'}
                      </span>
                      <span className="text-emerald-400 font-extrabold text-sm block">
                        {formatNpr(ord.totalNpr)}
                      </span>

                      {/* Attached Screenshot Button */}
                      {ord.paymentProofUrl ? (
                        <button
                          onClick={() => setPreviewScreenshotUrl(ord.paymentProofUrl || null)}
                          className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-500/30 transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Screenshot</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No receipt attached</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        ord.orderStatus === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : ord.orderStatus === 'Payment Confirmed'
                          ? 'bg-blue-500/20 text-blue-300'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300 animate-pulse'
                      }`}>
                        {ord.orderStatus}
                      </span>
                      {ord.statusNotes && (
                        <p className="text-[10px] text-rose-400 mt-1 max-w-[140px] truncate" title={ord.statusNotes}>
                          {ord.statusNotes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {ord.orderStatus !== 'Completed' && ord.orderStatus !== 'Cancelled' && (() => {
                        const automatableItem = ord.items.find(i => ROSGAY_PACKAGE_MAPPINGS[i.packageId]);
                        if (automatableItem) {
                          return (
                            <button
                              type="button"
                              onClick={() => openRosgayDispatchModal(ord, automatableItem)}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-[11px] shadow-sm transition inline-flex items-center gap-1"
                              title="Instant Auto-Topup via Rosgay Shop"
                            >
                              <Zap className="w-3 h-3 text-yellow-300" />
                              <span>Auto-Topup</span>
                            </button>
                          );
                        }
                        return null;
                      })()}
                      {ord.orderStatus === 'Payment Verification' && (
                        <button
                          onClick={() => handleStatusChange(ord.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition"
                        >
                          Approve & Complete
                        </button>
                      )}
                      {ord.orderStatus !== 'Completed' && ord.orderStatus !== 'Cancelled' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(ord.id, 'Completed')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => setRejectTarget({
                              type: 'order',
                              id: ord.id,
                              customerName: ord.customerName,
                              amount: ord.totalNpr,
                              reference: ord.paymentReference
                            })}
                            className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-semibold text-[11px] transition"
                            title="Reject False Order"
                          >
                            Reject (False)
                          </button>
                        </>
                      )}
                      <Link
                        href={`/order/${ord.id}`}
                        target="_blank"
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] inline-flex items-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: WALLET DEPOSIT REQUESTS
          ========================================================================= */}
      {activeTab === 'funds' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <span>Customer Wallet Deposit Requests</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Verify transaction receipts and credit balance into customer account
                </p>
              </div>
            </div>

            {/* Mobile Funds Card View (Phone / Small Screens) */}
            <div className="block md:hidden space-y-3">
              {fundRequests.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#0e1526] border border-white/5 text-slate-400 text-xs">
                  No wallet deposit requests found.
                </div>
              ) : (
                fundRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-[#0e1526] border border-white/10 space-y-3 shadow-lg">
                    <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                      <div>
                        <span className="font-mono font-bold text-white text-xs block">{req.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">User</span>
                        <span className="font-bold text-white block truncate">{req.userName}</span>
                        <span className="text-[10px] font-mono text-indigo-400 font-bold block">{req.userAccessId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Amount to Credit</span>
                        <span className="text-emerald-400 font-black text-sm block">{formatNpr(req.amountNpr)}</span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">{req.paymentMethod.toUpperCase()} • {req.paymentReference}</span>
                      </div>
                    </div>

                    {req.screenshotUrl && (
                      <button
                        onClick={() => setPreviewScreenshotUrl(req.screenshotUrl || null)}
                        className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Deposit Payment Proof</span>
                      </button>
                    )}

                    {req.adminNotes && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                        <div>
                          <strong className="block text-rose-400">Rejection Reason:</strong>
                          <span>{req.adminNotes}</span>
                        </div>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => approveFundRequest(req.id)}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                        >
                          Approve & Credit
                        </button>
                        <button
                          onClick={() => setRejectTarget({
                            type: 'fund',
                            id: req.id,
                            customerName: req.userName,
                            amount: req.amountNpr,
                            reference: req.paymentReference
                          })}
                          className="py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs transition"
                        >
                          Reject (False)
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141e34] text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Access ID</th>
                    <th className="py-3 px-4">Amount to Credit</th>
                    <th className="py-3 px-4">Gateway & Ref</th>
                    <th className="py-3 px-4">Proof</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {fundRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-mono font-bold text-white">{req.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">{req.userName}</p>
                        <p className="text-[10px] text-slate-400">{req.userEmail}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-400 font-bold">{req.userAccessId}</td>
                      <td className="py-3 px-4 font-black text-emerald-400 text-sm">{formatNpr(req.amountNpr)}</td>
                      <td className="py-3 px-4">
                        <span className="uppercase text-white font-semibold">{req.paymentMethod}</span>
                        <p className="text-[10px] text-slate-400 font-mono">{req.paymentReference}</p>
                      </td>
                      <td className="py-3 px-4">
                        {req.screenshotUrl ? (
                          <button
                            onClick={() => setPreviewScreenshotUrl(req.screenshotUrl || null)}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : req.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300 animate-pulse'
                        }`}>
                          {req.status}
                        </span>
                        {req.adminNotes && (
                          <p className="text-[10px] text-rose-400 mt-0.5 max-w-[120px] truncate" title={req.adminNotes}>
                            {req.adminNotes}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveFundRequest(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                            >
                              Approve & Credit
                            </button>
                            <button
                              onClick={() => setRejectTarget({
                                type: 'fund',
                                id: req.id,
                                customerName: req.userName,
                                amount: req.amountNpr,
                                reference: req.paymentReference
                              })}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-semibold text-[11px] transition"
                              title="Reject False Deposit Request"
                            >
                              Reject (False)
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PRICING FORMULA ENGINE & OVERRIDES
          ========================================================================= */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span>Real-Time Product & Pricing Analysis Engine</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Formula: Original Price + NPR {pricingSettings.globalMarkupNpr} (≤1K) • +NPR {pricingSettings.highTierMarkupNpr ?? 50} (&gt;1K)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMarkupActive(!pricingSettings.isMarkupActive)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                    pricingSettings.isMarkupActive
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  Markup Engine: {pricingSettings.isMarkupActive ? `ACTIVE (+${pricingSettings.globalMarkupNpr} / +${pricingSettings.highTierMarkupNpr ?? 50} NPR)` : 'DISABLED (0 NPR)'}
                </button>

                <button
                  onClick={resetAllPricing}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Price Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141e34] text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Product & Variation</th>
                    <th className="py-3 px-4">Competitor Reference Price</th>
                    <th className="py-3 px-4">Marketplace Markup</th>
                    <th className="py-3 px-4">Final Customer Selling Price</th>
                    <th className="py-3 px-4">Estimated Profit Margin</th>
                    <th className="py-3 px-4 text-right">Price Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.flatMap(p => p.packages.map(pkg => {
                    const profitInfo = calculateProfit(pkg.sellingPrice, pkg.supplierCost, pkg.originalPrice);
                    return (
                      <tr key={`${p.id}_${pkg.id}`} className="hover:bg-white/5">
                        <td className="py-2.5 px-4">
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-[11px] text-indigo-400">{pkg.name}</p>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-300">
                          {formatNpr(pkg.originalPrice)}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-indigo-400 font-bold">
                          +{formatNpr(pkg.markupNpr)}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-black text-emerald-400 text-sm">
                          {formatNpr(pkg.sellingPrice)}
                          {pkg.isOverride && (
                            <span className="ml-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                              Override
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-purple-300 font-bold">{formatNpr(profitInfo.profitNpr)}</span>
                          <span className="text-[10px] text-slate-500 ml-1">({profitInfo.marginPct}%)</span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => {
                              const newPrice = prompt(`Enter custom Selling Price in NPR for ${pkg.name}:`, pkg.sellingPrice.toString());
                              if (newPrice !== null) {
                                const parsed = parseFloat(newPrice);
                                overridePackagePrice(p.id, pkg.id, isNaN(parsed) ? null : parsed);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: CATALOG & INVENTORY
          ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Live Product Catalog ({products.length} Products)</h3>
              <p className="text-xs text-slate-400">Manage products, toggle availability, or add new catalog items</p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-[#0e1526] border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-white/5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                    <p className="text-xs text-slate-400">{p.categoryLabel} • {p.packages.length} packages</p>
                    <p className="text-[11px] font-mono text-emerald-400">from {formatNpr(p.packages[0]?.sellingPrice || 0)}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className={p.inStock ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {p.inStock ? '● Active in Store' : '○ Out of Stock'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleProductStock(p.id, !p.inStock)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-[11px]"
                    >
                      {p.inStock ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                          deleteProduct(p.id);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: COUPONS & DISCOUNT ENGINE
          ========================================================================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Coupon & Promo Code Engine</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                  {couponsList.filter(c => c.active).length} Active Promos
                </span>
              </div>
              <p className="text-xs text-slate-400">Generate discount codes, set validity limits, and manage promotions across checkout.</p>
            </div>
            <button
              onClick={handleGenerateRandomCouponCode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Random Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Create Coupon Form */}
            <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Create New Coupon</h4>
                  <p className="text-[11px] text-slate-400">Add automatic discounts for your customers</p>
                </div>
              </div>

              {couponFormSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{couponFormSuccess}</span>
                </div>
              )}

              {couponFormError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{couponFormError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Coupon Code <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME50 or FESTIVE20"
                      className="flex-1 bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateRandomCouponCode}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300"
                      title="Generate random code"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Discount Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountTypeInput('percentage')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        discountTypeInput === 'percentage'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                          : 'bg-[#141e34] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountTypeInput('fixed')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        discountTypeInput === 'fixed'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                          : 'bg-[#141e34] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Flat Amount (Rs.)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {discountTypeInput === 'percentage' ? 'Discount %' : 'Discount (Rs.)'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={discountTypeInput === 'percentage' ? 90 : 10000}
                      value={discountValueInput}
                      onChange={(e) => setDiscountValueInput(Number(e.target.value))}
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Min Order (NPR)</label>
                    <input
                      type="number"
                      min="0"
                      value={minOrderInput}
                      onChange={(e) => setMinOrderInput(Number(e.target.value))}
                      placeholder="e.g. 300"
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                    />
                  </div>
                </div>

                {discountTypeInput === 'percentage' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Max Discount Cap (NPR)</label>
                    <input
                      type="number"
                      min="1"
                      value={maxDiscountInput}
                      onChange={(e) => setMaxDiscountInput(Number(e.target.value))}
                      placeholder="e.g. 200"
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Applicable Product (Restriction)
                  </label>
                  <select
                    value={applicableProductIdInput}
                    onChange={(e) => setApplicableProductIdInput(e.target.value)}
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">🌐 All Products (Storewide Discount)</option>
                    
                    <optgroup label="📂 Category Restrictions">
                      <option value="cat:topup">🎮 All Game Top-Ups (Free Fire, Roblox, MLBB, PUBG, etc.)</option>
                      <option value="cat:subscription">📦 All App Subscriptions (ChatGPT, CapCut, Netflix, etc.)</option>
                      <option value="cat:giftcard">💳 All Gift Cards (Steam, Dollar Card, etc.)</option>
                      <option value="cat:live_coins">📻 All Live App Coins (TikTok Coins, etc.)</option>
                      <option value="cat:gamekeys">🔑 All Digital Cards & Keys</option>
                    </optgroup>

                    <optgroup label="🎯 Specific Products (Including New Releases)">
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id.includes('roblox') ? '🧱' : p.id.includes('efoot') ? '⚽' : p.id.includes('strike') ? '🔫' : p.id.includes('winds') ? '⚔️' : p.id.includes('ff') || p.id.includes('free-fire') ? '🔥' : '🎯'} {p.name} ({p.categoryLabel})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Restrict discount to a specific game (e.g. Roblox Robux, Free Fire), a whole category, or leave storewide.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={expiryDateInput}
                    onChange={(e) => setExpiryDateInput(e.target.value)}
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="couponActiveInput"
                    checked={couponActiveInput}
                    onChange={(e) => setCouponActiveInput(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="couponActiveInput" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Activate and enable immediately on checkout
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={couponFormSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition disabled:opacity-50"
                >
                  {couponFormSubmitting ? 'Saving Coupon...' : 'Publish Coupon Code'}
                </button>
              </form>
            </div>

            {/* Right Column: Existing Coupons List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Configured Coupons ({couponsList.length})
                </h4>
                <span className="text-[11px] text-slate-400">Click toggle to activate/pause instantly</span>
              </div>

              {loadingCoupons ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading coupons...</div>
              ) : couponsList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#0e1526] border border-white/5 text-slate-400 text-xs">
                  No coupons found. Create your first coupon using the form on the left!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {couponsList.map((c) => {
                    const isExpired = c.expiryDate && new Date(c.expiryDate).getTime() < Date.now();
                    return (
                      <div
                        key={c.code}
                        className={`p-4 rounded-2xl border transition space-y-3 ${
                          c.active && !isExpired
                            ? 'bg-[#0e1526] border-indigo-500/30 shadow-lg'
                            : 'bg-[#0e1526]/50 border-white/5 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-black text-sm tracking-wider">
                                {c.code}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  !c.active
                                    ? 'bg-slate-700 text-slate-300'
                                    : isExpired
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}
                              >
                                {!c.active ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-white pt-1">
                              {c.discountType === 'percentage'
                                ? `${c.discountValue}% OFF ${c.maxDiscountNpr ? `(Max Rs. ${c.maxDiscountNpr})` : ''}`
                                : `Flat Rs. ${c.discountValue} OFF`}
                            </p>
                            {c.applicableProductName ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[10px] font-semibold">
                                <span>🎯 Only for:</span>
                                <span className="text-white font-bold">{c.applicableProductName}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-medium">
                                <span>🌐 Storewide (All Products)</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-400 border-t border-white/5 pt-2">
                          <div className="flex justify-between">
                            <span>Minimum Order:</span>
                            <span className="text-slate-200 font-medium">
                              {c.minOrderNpr ? `Rs. ${c.minOrderNpr}` : 'No minimum'}
                            </span>
                          </div>
                          {c.expiryDate && (
                            <div className="flex justify-between">
                              <span>Expires:</span>
                              <span className={isExpired ? 'text-rose-400 font-medium' : 'text-slate-200'}>
                                {new Date(c.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Used Times:</span>
                            <span className="text-slate-200 font-medium">{c.usedCount || 0} times</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleCoupon(c.code, c.active)}
                            className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              c.active
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {c.active ? 'Deactivate Coupon' : 'Activate Coupon'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: STORE ANNOUNCEMENTS & NOTICES
          ========================================================================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Broadcast Notices & Store Announcements</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  {announcementsList.filter(a => a.active).length} Active Broadcasts
                </span>
              </div>
              <p className="text-xs text-slate-400">Post server notices, discount alerts, and updates to the Notification Bell and Homepage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Create Announcement Form */}
            <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Publish New Announcement</h4>
                  <p className="text-[11px] text-slate-400">Instantly visible in customer notification center</p>
                </div>
              </div>

              {annFormSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{annFormSuccess}</span>
                </div>
              )}

              {annFormError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{annFormError}</span>
                </div>
              )}

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Announcement Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={annTitleInput}
                    onChange={(e) => setAnnTitleInput(e.target.value)}
                    placeholder="e.g. 🔥 Server Notice or 🎉 Weekend Flash Sale"
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Badge Type <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['HOT', 'DISCOUNT', 'UPDATE', 'NOTICE'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setAnnBadgeInput(b)}
                        className={`py-1.5 rounded-lg text-xs font-black transition border ${
                          annBadgeInput === b
                            ? b === 'HOT'
                              ? 'bg-rose-500 text-white border-rose-400 shadow'
                              : b === 'DISCOUNT'
                              ? 'bg-amber-500 text-white border-amber-400 shadow'
                              : b === 'UPDATE'
                              ? 'bg-blue-600 text-white border-blue-400 shadow'
                              : 'bg-purple-600 text-white border-purple-400 shadow'
                            : 'bg-[#141e34] border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Notice Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={annMessageInput}
                    onChange={(e) => setAnnMessageInput(e.target.value)}
                    placeholder="Explain the update, server details, or promotion..."
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Featured Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={annCouponCodeInput}
                    onChange={(e) => setAnnCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME50"
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-xs uppercase placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Action Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={annLinkInput}
                    onChange={(e) => setAnnLinkInput(e.target.value)}
                    placeholder="e.g. /#shop-catalog or /checkout"
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="annActiveInput"
                    checked={annActiveInput}
                    onChange={(e) => setAnnActiveInput(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="annActiveInput" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Publish actively to customer notification feed
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={annFormSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:opacity-95 transition disabled:opacity-50"
                >
                  {annFormSubmitting ? 'Publishing...' : 'Publish Announcement to Store'}
                </button>
              </form>
            </div>

            {/* Right Column: Existing Announcements */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Broadcasts ({announcementsList.length})
                </h4>
                <span className="text-[11px] text-slate-400">Real-time updates delivered to users</span>
              </div>

              {loadingAnnouncements ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading announcements...</div>
              ) : announcementsList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#0e1526] border border-white/5 text-slate-400 text-xs">
                  No announcements published yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcementsList.map((a) => {
                    const badgeStyles: Record<string, string> = {
                      HOT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                      DISCOUNT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      NOTICE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    };

                    return (
                      <div
                        key={a.id}
                        className={`p-4 rounded-2xl border transition space-y-2.5 ${
                          a.active
                            ? 'bg-[#0e1526] border-white/10 shadow-lg'
                            : 'bg-[#0e1526]/50 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {a.badge && (
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                    badgeStyles[a.badge] || badgeStyles.NOTICE
                                  }`}
                                >
                                  {a.badge}
                                </span>
                              )}
                              <h4 className="text-sm font-bold text-white">{a.title}</h4>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleAnnouncement(a.id, a.active)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition ${
                                a.active
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                  : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
                              }`}
                            >
                              {a.active ? 'Active' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(a.id)}
                              className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="Delete announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {(a.couponCode || a.link) && (
                          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs">
                            {a.couponCode && (
                              <div className="flex items-center gap-1.5 text-indigo-300">
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Code:</span>
                                <span className="font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                  {a.couponCode}
                                </span>
                              </div>
                            )}
                            {a.link && (
                              <a
                                href={a.link}
                                className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                <span>View Target Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <span className="text-[10px] text-slate-500 ml-auto">
                              {new Date(a.createdAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: ROSGAY SHOP SUPPLIER AUTOMATION
          ========================================================================= */}
      {activeTab === 'supplier' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0e172a] to-[#0a0f1d] border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">Rosgay Shop Supplier Automation</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    API Live & Connected
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Automated direct-to-UID game top-up engine powered by Rosgay Shop wholesale API (Kalanki, Kathmandu).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchRosgayBalance}
                disabled={rosgayLoading}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rosgayLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Balance</span>
              </button>
              <a
                href="https://rosgayshop.com/user/wallet/add-fund"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Load Funds</span>
              </a>
            </div>
          </div>

          {/* Metrics & Account Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0e1526] border border-white/10 shadow-lg space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Available Wholesale Balance</span>
              <p className="text-2xl font-black text-emerald-400">
                Rs. {rosgayStatus?.balance ?? 0} <span className="text-xs font-semibold text-slate-400">NPR</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {rosgayStatus && rosgayStatus.balance < 100 ? (
                  <span className="text-amber-400 font-semibold">⚠️ Balance low. Top up on rosgayshop.com to enable auto-fulfillment.</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">✓ Ready for instant automated order dispatch.</span>
                )}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1526] border border-white/10 shadow-lg space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Connected Merchant Account</span>
              <p className="text-base font-bold text-white truncate">
                {rosgayStatus?.name || 'Pukar Nepal'}
              </p>
              <p className="text-[11px] text-indigo-300 font-mono">
                @{rosgayStatus?.username || 'Shadow1239'} • {rosgayStatus?.email || 'yadunepal8@gmail.com'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1526] border border-white/10 shadow-lg space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Game Mappings</span>
              <p className="text-2xl font-black text-white">
                {Object.keys(ROSGAY_PACKAGE_MAPPINGS).length} <span className="text-xs font-semibold text-slate-400">Packages</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Free Fire, MLBB, PUBG, Roblox, eFootball, Blood Strike, Where Winds Meet & Dollar Cards.
              </p>
            </div>
          </div>

          {/* Operating Mode Selector */}
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/5 flex items-center justify-between">
              <span>Auto-Fulfill Operating Mode</span>
              <span className="text-xs text-indigo-400 font-normal">Choose how orders are sent to supplier</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setRosgayAutopilot(false)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  !rosgayAutopilot 
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg' 
                    : 'bg-[#141e34] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Semi-Automatic: 1-Click Rosgay Dispatch (Recommended)</span>
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!rosgayAutopilot ? 'border-emerald-400 bg-emerald-500' : 'border-slate-500'}`}>
                    {!rosgayAutopilot && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  You review payment screenshot or reference in the Orders tab first. Once confirmed, tap the green <strong>"⚡ Auto-Topup"</strong> button to send diamonds directly to player UID in 5 seconds.
                </p>
              </div>

              <div 
                onClick={() => setRosgayAutopilot(true)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  rosgayAutopilot 
                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg' 
                    : 'bg-[#141e34] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span>Full Autopilot: Instant Auto-Send on Checkout</span>
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${rosgayAutopilot ? 'border-indigo-400 bg-indigo-500' : 'border-slate-500'}`}>
                    {rosgayAutopilot && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  As soon as customer submits payment reference on checkout, order automatically executes on Rosgay Shop with zero manual intervention. (Ensure you maintain Rs. 2,000+ wholesale balance).
                </p>
              </div>
            </div>
          </div>

          {/* Active Mappings Table */}
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Live Automated Package Mappings</h3>
                <p className="text-xs text-slate-400 mt-0.5">Catalog variations linked to Rosgay topUpId & serviceId</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                {Object.keys(ROSGAY_PACKAGE_MAPPINGS).length} Active Integrations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141e34] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Store Package ID</th>
                    <th className="py-3 px-4">Rosgay Game & Item</th>
                    <th className="py-3 px-4 text-center">Rosgay ID</th>
                    <th className="py-3 px-4 text-right">Wholesale Cost</th>
                    <th className="py-3 px-4 text-right">Your Price</th>
                    <th className="py-3 px-4 text-right">Net Profit</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(ROSGAY_PACKAGE_MAPPINGS).map(([pkgId, map]) => {
                    const { sellingPrice: retailPrice, markupNpr: profit } = calculateSellingPrice(map.wholesaleCostNpr, {
                      markupNpr: pricingSettings.globalMarkupNpr,
                      highTierMarkupNpr: pricingSettings.highTierMarkupNpr,
                      highTierThresholdNpr: pricingSettings.highTierThresholdNpr,
                      isMarkupActive: pricingSettings.isMarkupActive
                    });
                    return (
                      <tr key={pkgId} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-300">{pkgId}</td>
                        <td className="py-3 px-4 font-bold text-white">
                          <span>{map.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {map.topUpId === 1 ? 'Free Fire (Nepal & BD)' :
                             map.topUpId === 2 ? 'Mobile Legends' :
                             map.topUpId === 3 ? 'PUBG Mobile UC' :
                             map.topUpId === 5 ? 'Roblox Robux' :
                             map.topUpId === 6 ? 'TikTok Coins' :
                             map.topUpId === 7 ? 'CapCut Pro' :
                             map.topUpId === 10 ? 'ChatGPT Plus' :
                             map.topUpId === 14 ? 'Netflix' :
                             map.topUpId === 16 ? 'Prepaid Dollar Card' :
                             map.topUpId === 22 ? 'eFootball Coins & Packs' :
                             map.topUpId === 25 ? 'Where Winds Meet' :
                             map.topUpId === 30 ? 'Blood Strike' :
                             `Product #${map.topUpId}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                          topUp: {map.topUpId} • svc: {map.serviceId}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-300">Rs. {map.wholesaleCostNpr}</td>
                        <td className="py-3 px-4 text-right font-bold text-white">Rs. {retailPrice}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-400">+ Rs. {profit}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            ⚡ Automated
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREENSHOT PREVIEW MODAL
          ========================================================================= */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0e1526] border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Payment Receipt Screenshot Preview</h3>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl flex items-center justify-center bg-black/50 p-2">
              <img
                src={previewScreenshotUrl}
                alt="Payment Receipt"
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>

            <div className="text-right">
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW PRODUCT MODAL
          ========================================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-[#0e1526] border border-white/15 p-4 sm:p-6 shadow-2xl my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add New Product to Store</h3>
                <p className="text-xs text-slate-400">Set prices with automated NPR 20 formula & upload image</p>
              </div>
            </div>

            {addProdSuccess ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Product Added Successfully!</h4>
                <p className="text-xs text-slate-300">
                  The product is now active in your live storefront catalog.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Product Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="e.g. Roblox Robux or Valorant Points"
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="topup">Game Top-Up (Free Fire, MLBB, etc.)</option>
                      <option value="subscription">App & AI Subscription (ChatGPT, CapCut)</option>
                      <option value="giftcard">Digital Gift Card (Steam, Apple)</option>
                      <option value="live_coins">Live-Streaming Coins (TikTok, Poppo)</option>
                    </select>
                  </div>
                </div>

                {/* Product Image (URL or Upload) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Product Image (Upload File or Enter Image URL) <span className="text-rose-400">*</span>
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="url"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        placeholder="Paste image web URL (https://...)"
                        className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 mb-2"
                      />
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 cursor-pointer w-fit">
                        <UploadCloud className="w-4 h-4 text-indigo-400" />
                        <span>Or upload image from device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProductImageUpload}
                        />
                      </label>
                    </div>

                    {/* Image Preview Thumbnail */}
                    <div className="flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/10 min-h-[70px]">
                      {newProdImage ? (
                        <img src={newProdImage} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                      ) : (
                        <div className="text-center text-[10px] text-slate-500">
                          <ImageIcon className="w-6 h-6 mx-auto mb-0.5" />
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Brief description of the product and benefits..."
                    className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Required Fields for Customer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Required Customer Input</label>
                    <select
                      value={newProdReqType}
                      onChange={(e) => setNewProdReqType(e.target.value as any)}
                      className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    >
                      <option value="player_id">Player ID (UID) only</option>
                      <option value="player_and_zone">User ID + Zone ID (MLBB style)</option>
                      <option value="email">Account / Delivery Email</option>
                      <option value="login_credentials">Gmail/Email + Password + WhatsApp (ChatGPT / App style)</option>
                      <option value="whatsapp_only">WhatsApp Number only (Netflix / CapCut credentials delivery)</option>
                      <option value="none">No input required (Instant code delivery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Delivery Badge</label>
                    <label className="flex items-center gap-2 pt-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProdInstant}
                        onChange={(e) => setNewProdInstant(e.target.checked)}
                        className="rounded accent-indigo-600"
                      />
                      <span>Mark as 60-Second Instant Delivery</span>
                    </label>
                  </div>
                </div>

                {/* Packages / Variations Builder */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Product Packages & Selling Prices</h4>
                      <p className="text-[10px] text-slate-400">Formula automatically adds +NPR {pricingSettings.globalMarkupNpr} (≤1K) or +NPR {pricingSettings.highTierMarkupNpr ?? 50} (&gt;1K) profit</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPackageRow}
                      className="text-xs text-indigo-400 font-bold hover:underline"
                    >
                      + Add Variation
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {packagesList.map((pkg, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#141e34] border border-white/5 grid grid-cols-12 gap-2 items-center text-xs">
                        <div className="col-span-5">
                          <input
                            type="text"
                            required
                            value={pkg.name}
                            onChange={(e) => handlePackageChange(idx, 'name', e.target.value)}
                            placeholder="Package Name"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="1"
                            required
                            value={pkg.originalPrice}
                            onChange={(e) => handlePackageChange(idx, 'originalPrice', e.target.value)}
                            placeholder="Cost/Base NPR"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                            title="Base/Competitor Price"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="1"
                            required
                            value={pkg.sellingPrice}
                            onChange={(e) => handlePackageChange(idx, 'sellingPrice', e.target.value)}
                            placeholder="Selling NPR"
                            className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-xs"
                            title="Final Selling Price (Auto +20 NPR)"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          {packagesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePackageRow(idx)}
                              className="text-slate-400 hover:text-rose-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {addProdError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{addProdError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addProdSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-95 transition disabled:opacity-50"
                >
                  {addProdSubmitting ? 'Creating Product...' : 'Publish Product to Marketplace'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          REJECT FALSE REQUEST MODAL (Orders / Wallet Deposits)
          ========================================================================= */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1526] border border-rose-500/30 p-5 sm:p-6 shadow-2xl my-6">
            <button
              onClick={() => setRejectTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Reject False {rejectTarget.type === 'order' ? 'Top-Up Order' : 'Deposit Request'}
                </h3>
                <p className="text-xs text-slate-400">
                  Target ID: <span className="font-mono font-bold text-rose-300">{rejectTarget.id}</span>
                </p>
              </div>
            </div>

            {/* Target Summary Card */}
            <div className="p-3.5 rounded-2xl bg-[#141e34] border border-white/5 space-y-2 mb-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{rejectTarget.customerName}</span>
              </div>
              {rejectTarget.amount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-extrabold text-emerald-400">{formatNpr(rejectTarget.amount)}</span>
                </div>
              )}
              {rejectTarget.reference && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Submitted Ref:</span>
                  <span className="font-mono text-slate-300">{rejectTarget.reference}</span>
                </div>
              )}
            </div>

            {/* Reason Presets */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Reason for Rejection <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    'False / Unverified Transaction Reference',
                    'Fake / Photoshopped Payment Receipt',
                    'Payment not received in merchant account (eSewa/Khalti/Bank)',
                    'Incorrect Player UID / Server Zone provided',
                    'Duplicate / Already Claimed Submission',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReasonPreset(preset)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition border flex items-center justify-between ${
                        rejectReasonPreset === preset
                          ? 'bg-rose-500/20 border-rose-500/40 text-white font-bold'
                          : 'bg-[#141e34] border-white/5 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{preset}</span>
                      {rejectReasonPreset === preset && (
                        <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Additional Note / Clarification (Optional)
                </label>
                <textarea
                  rows={2}
                  value={rejectCustomNote}
                  onChange={(e) => setRejectCustomNote(e.target.value)}
                  placeholder="e.g. Transaction ID did not match any incoming payment..."
                  className="w-full bg-[#141e34] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={rejectSubmitting}
                  onClick={handleConfirmReject}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
                >
                  {rejectSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ROSGAY INSTANT AUTO-FULFILLMENT MODAL
          ========================================================================= */}
      {dispatchModalOrder && dispatchModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0e1526] border border-emerald-500/30 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span>⚡ Rosgay Instant Auto-Fulfillment</span>
              </div>
              <button 
                onClick={() => setDispatchModalOrder(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success message banner */}
            {dispatchSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{dispatchSuccess}</span>
              </div>
            )}

            {/* Error message banner */}
            {dispatchError && (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{dispatchError}</span>
              </div>
            )}

            {/* Order Info */}
            <div className="p-3.5 rounded-2xl bg-[#141e34] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono font-bold text-white">{dispatchModalOrder.id}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-white">{dispatchModalOrder.customerName} ({dispatchModalOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Item & Package:</span>
                <span className="font-bold text-indigo-300 truncate max-w-[200px]">{dispatchModalItem.productName} • {dispatchModalItem.packageName}</span>
              </div>
              {dispatchModalItem.requirements?.playerId && (
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Player UID:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{dispatchModalItem.requirements.playerId}</span>
                </div>
              )}
              {dispatchModalItem.requirements?.server && (
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Server / Zone:</span>
                  <span className="font-semibold text-white">{dispatchModalItem.requirements.server}</span>
                </div>
              )}
            </div>

            {/* Economics / Pricing Breakdown */}
            {dispatchModalMapping && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#101b2b] to-[#0a0f1d] border border-emerald-500/20 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Paid:</span>
                  <span className="font-bold text-white">{formatNpr(dispatchModalItem.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rosgay Wholesale Cost:</span>
                  <span className="font-bold text-emerald-400">Rs. {dispatchModalMapping.wholesaleCostNpr} NPR</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="font-bold text-slate-200">Your Net Margin (Profit):</span>
                  <span className="font-black text-emerald-400 text-sm">
                    + Rs. {Math.max(0, dispatchModalItem.price - dispatchModalMapping.wholesaleCostNpr)} NPR
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-400">Current Rosgay Balance:</span>
                  <span className={`font-bold ${rosgayStatus && rosgayStatus.balance < dispatchModalMapping.wholesaleCostNpr ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}`}>
                    Rs. {rosgayStatus?.balance ?? 0} NPR
                  </span>
                </div>
              </div>
            )}

            {/* Balance Warning if insufficient */}
            {dispatchModalMapping && rosgayStatus && rosgayStatus.balance < dispatchModalMapping.wholesaleCostNpr && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">Insufficient Rosgay Wholesale Balance!</p>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      Your balance is Rs. {rosgayStatus.balance}, but this item costs Rs. {dispatchModalMapping.wholesaleCostNpr}. Please add funds to your Rosgay account, or click "Cancel" and use "Approve & Complete" for manual delivery.
                    </p>
                  </div>
                </div>
                <a
                  href="https://rosgayshop.com/user/wallet/add-fund"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Load Wholesale Funds on rosgayshop.com</span>
                </a>
              </div>
            )}

            {/* Dispatch Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dispatching || !!dispatchSuccess}
                onClick={handleConfirmRosgayDispatch}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {dispatching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Confirm & Send to Rosgay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
