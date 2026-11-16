export type ProductCategory = 
  | 'topup'         // Direct game top-ups (Free Fire, Mobile Legends, etc.)
  | 'subscription'  // App & AI subscriptions (ChatGPT, Netflix, CapCut, etc.)
  | 'giftcard'      // Gift cards (Steam, Apple, Google Play, etc.)
  | 'live_coins'    // Live streaming coins (TikTok, Chamet, Poppo, etc.)
  | 'gamekeys';     // PC game keys and software licenses

export interface PackageVariation {
  id: string;
  name: string;
  originalPrice: number;    // Competitor reference price in NPR
  sellingPrice: number;     // Calculated: originalPrice + markup, or overridden
  supplierCost?: number;    // Confirmed cost from supplier in NPR, or undefined/null
  markupNpr: number;        // Markup applied (default 20 NPR)
  isOverride?: boolean;     // If admin manually locked a specific price
  instantDelivery: boolean;
  image?: string;
  inStock: boolean;
  sku?: string;
  bonusAmount?: string;     // e.g. "+ 10 Diamonds Free"
}

export interface ProductRequirementField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'select' | 'email' | 'password';
  options?: string[];       // for select type
  required: boolean;
  helpText?: string;
  example?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  publisher?: string;
  category: ProductCategory;
  categoryLabel: string;
  image: string;
  banner?: string;
  description: string;
  shortDescription: string;
  badge?: 'Hot' | 'Instant' | 'Popular' | 'Best Value' | 'Exclusive';
  instantDelivery: boolean;
  requiresPlayerId: boolean;
  requirementFields: ProductRequirementField[];
  packages: PackageVariation[];
  sourceUrl?: string;
  lastCheckedDate: string;
  inStock: boolean;
  tags: string[];
  instructions?: string[];
  faq?: { question: string; answer: string }[];
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  category: ProductCategory;
  packageId: string;
  packageName: string;
  price: number;
  originalPrice: number;
  quantity: number;
  requirements: Record<string, string>; // e.g. { playerId: "123456", server: "Asia" }
}

export type OrderStatus = 
  | 'Awaiting Payment'
  | 'Payment Verification'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Refund Requested'
  | 'Refunded';

export type PaymentMethod = 'esewa' | 'khalti' | 'fonepay' | 'bank_transfer' | 'wallet';

export interface Order {
  id: string;                     // e.g. "ORD-94812"
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discountNpr: number;
  totalNpr: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;       // Transaction ID from eSewa/Khalti
  paymentProofUrl?: string;        // Uploaded screenshot image (base64 data URI or storage URL)
  orderStatus: OrderStatus;
  statusNotes?: string;
  deliveryType: 'automatic' | 'manual' | 'supplier_api';
  createdAt: string;
  updatedAt: string;
  deliveryData?: Record<string, string>; // Voucher codes, serial keys, confirmation links
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;          // e.g. 5% or 50 NPR
  minOrderNpr?: number;
  maxDiscountNpr?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  applicableProductId?: string;   // specific product ID (e.g. 'chatgpt-plus-nepal-global', 'free-fire-diamond-top-up') or undefined for all products
  applicableProductName?: string; // friendly product title (e.g. 'ChatGPT Plus', 'Free Fire Diamonds')
}

export interface WalletFundRequest {
  id: string;
  userId: string;
  userEmail: string;
  userAccessId: string;
  userName: string;
  amountNpr: number;
  paymentMethod: 'esewa' | 'khalti' | 'fonepay' | 'bank_transfer';
  paymentReference: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin';
  accessId: string;                        // Unique customer identifier e.g. "SHADOW-9812"
  walletBalance: number;                   // In-store wallet balance in NPR
  savedPlayerIds?: Record<string, string>; // { "free-fire": "94827110", "mobile-legends": "3829104|2042" }
  createdAt: string;
}

export interface PricingSettings {
  globalMarkupNpr: number;        // Default 20 NPR for packages <= 1000 NPR
  highTierMarkupNpr?: number;     // Default 50 NPR for packages > 1000 NPR
  highTierThresholdNpr?: number;  // Threshold at 1000 NPR
  isMarkupActive: boolean;
  minProfitMarginPct: number;
  lastUpdated: string;
}

export interface StoreAnnouncement {
  id: string;
  title: string;
  message: string;
  badge?: 'HOT' | 'DISCOUNT' | 'UPDATE' | 'NOTICE';
  couponCode?: string;
  link?: string;
  active: boolean;
  createdAt: string;
}

