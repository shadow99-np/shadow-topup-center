# ⚡ Shadow Topup Center (Nepal • नेपाल टप-अप सेन्टर)
> Premium Next.js 16 & Firebase Marketplace for Instant Game Top-Ups, App Subscriptions, and Digital Gift Cards in Nepal.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Firebase 13**. Designed to deliver a superior customer experience compared to existing Nepali stores like [rosgayshop.com](https://rosgayshop.com/).

---

## 🌟 Core Highlights

1. **Automated NPR 20 Business Rule Engine**:
   - Every product variation dynamically calculates: `FINAL SELLING PRICE = ORIGINAL PRICE + NPR 20`.
   - Distinguishes competitor reference prices from confirmed supplier costs.
   - Admin controls to adjust the global markup, toggle it on/off, or lock custom price overrides.

2. **Official Nepali Payment Gateways & Workflows**:
   - **Fonepay QR**: Dynamic scan-to-pay from any Nepali commercial mobile banking app (Nabil, Global IME, NIC Asia, etc.).
   - **eSewa Wallet**: Direct wallet ID transfer or merchant QR.
   - **Khalti Wallet**: Fast transfer with transaction code verification.
   - **Bank Transfer / ConnectIPS**: Direct account transfers.

3. **60-Second In-Game UID Top-Up**:
   - No passwords or OTPs required! Pure numeric Player ID (Free Fire UID, Mobile Legends User ID + Zone ID, PUBG Character ID).
   - Dedicated validation inputs tailored per game and app subscription.

4. **Interactive 5-Stage Live Order Tracker**:
   - Real-time status stepper: `Awaiting Payment` ➔ `Payment Verification` ➔ `Payment Confirmed` ➔ `Processing` ➔ `Completed`.
   - 1-click WhatsApp order assistance pre-filled with order ID.

5. **Full Admin Operations Portal**:
   - Manage incoming orders, approve payments, and update fulfillment notes.
   - Real-time gross sales metrics, order counts, and estimated profit calculators.
   - Product catalog inventory management.

---

## 🚀 Quickstart & Development

```bash
cd /data/user/0/com.termux/files/home/projects/nepal_digital_marketplace

# 1. Compile Tailwind CSS bundle
node build-css.js

# 2. Run local development server
pnpm dev --port 3000

# 3. Build optimized production bundle
pnpm build
```

Open in your browser:
* Local: [http://localhost:3000](http://localhost:3000)
* Mobile (Local Wi-Fi): [http://YOUR_LOCAL_IP:3000](http://YOUR_LOCAL_IP:3000)

---

## 🔐 Admin Dashboard Access

- **Route:** `/admin`
- **Default 1-Click Demo Login:** Available directly in the Sign In modal (`admin@nepalmarket.com` / `admin123`).

---

## 📁 Repository Structure

```
nepal_digital_marketplace/
├── src/
│   ├── app/
│   │   ├── globals.css              # Custom dark palette & design tokens
│   │   ├── layout.tsx               # Root layout & context providers
│   │   ├── page.tsx                 # Homepage with hero slider & catalog
│   │   ├── category/[slug]/page.tsx # Category filter & browse
│   │   ├── product/[slug]/page.tsx  # Dynamic UID inputs & package selector
│   │   ├── checkout/page.tsx        # Nepali wallet checkout & verification
│   │   ├── order/[id]/page.tsx      # 5-stage live order tracking
│   │   ├── track/page.tsx           # Order lookup by ID
│   │   ├── account/page.tsx         # Customer portal & order history
│   │   ├── admin/page.tsx           # Full admin dashboard & pricing engine
│   │   ├── faq/page.tsx             # Customer questions
│   │   ├── terms/page.tsx           # Terms & delivery conditions
│   │   └── privacy/page.tsx         # Data protection policy
│   ├── components/
│   │   ├── Navbar.tsx               # Header with live search autocomplete
│   │   ├── Footer.tsx               # Trust badges & Nepali payment icons
│   │   ├── HeroSlider.tsx           # Interactive banner carousel
│   │   ├── CategoryNav.tsx          # Horizontal category filter pills
│   │   ├── ProductCard.tsx          # High-impact gaming product card
│   │   ├── CartDrawer.tsx           # Slide-over cart with coupon engine
│   │   └── AuthModal.tsx            # Login, registration & demo logins
│   ├── context/
│   │   ├── AuthContext.tsx          # Customer & Admin authentication
│   │   ├── CartContext.tsx          # Shopping cart & discount coupons
│   │   └── MarketplaceContext.tsx   # Real-time catalog & pricing formula
│   ├── data/
│   │   ├── catalog.ts               # Verified products with NPR 20 formula
│   │   └── nepalPayments.ts         # eSewa, Khalti, Fonepay & Bank config
│   ├── lib/
│   │   ├── firebase.ts              # Firebase client setup with auto-detect
│   │   ├── firebaseService.ts       # Firestore & dual-mode local fallback
│   │   └── pricingEngine.ts         # Business formula: Selling = Base + 20
│   └── types/
│       └── marketplace.ts           # Complete TypeScript models
├── public/
│   └── manifest.json                # PWA mobile app manifest
├── firestore.rules                  # Production-hardened Firestore security rules
├── storage.rules                    # Secure payment proof storage rules
├── FIREBASE_SETUP.md                # Step-by-step Firebase deployment guide
├── DEVELOPMENT_STATUS.md            # Execution matrix & competitor analysis
├── .env.example                     # Environment template
└── package.json
```
