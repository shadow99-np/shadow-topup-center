# 🔥 Firebase Integration & Security Setup Guide

This guide walks you through connecting your existing Firebase project to **Nepal Digital Store**.

---

## 1. Firebase Project Credentials

Open the [Firebase Console](https://console.firebase.google.com/):
1. Select your project.
2. Go to **Project Settings** (gear icon) ➔ **General** tab.
3. Scroll down to **Your apps** and select your Web app (or click **Add app** ➔ **Web `</>`**).
4. Copy the `firebaseConfig` object and populate your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef..."
```

---

## 2. Authentication Setup

In the Firebase Console:
1. Go to **Build** ➔ **Authentication** ➔ **Sign-in method**.
2. Enable **Email/Password**.
3. (Optional) Enable **Google** sign-in if you want 1-click Google authentication.

---

## 3. Cloud Firestore Database Setup

1. Go to **Build** ➔ **Firestore Database** ➔ **Create database**.
2. Choose **Start in production mode**.
3. Select your preferred server location (e.g. `asia-south1` Mumbai for fastest latency to Nepal).
4. Go to the **Rules** tab, paste the contents of `firestore.rules` from this repository, and click **Publish**.

### Collections Architecture

- `users/` — User profiles, phone numbers, and role (`customer` | `admin` | `super_admin`).
- `orders/` — In-flight and completed orders with items, player IDs, payment proofs, and statuses.
- `products/` — Dynamic catalog items and packages.
- `settings/` — Global pricing formula settings (e.g. `globalMarkupNpr: 20`).
- `coupons/` — Active discount vouchers and redemption limits.
- `price_history/` — Competitor tracking records from rosgayshop.com.

---

## 4. Firebase Storage Setup (For Payment Receipts)

1. Go to **Build** ➔ **Storage** ➔ **Get started**.
2. Go to the **Rules** tab, paste the contents of `storage.rules`, and click **Publish**.

---

## 5. Dual-Mode Architecture

The application is built with zero-crash dual-mode architecture:
- When valid Firebase credentials are provided in `.env.local`, all operations synchronize in real-time with Firebase Auth and Cloud Firestore.
- In local development or before keys are set, it transparently persists to reactive local storage so that every single flow (product selection, pricing formulas, cart, checkout, order tracking, admin controls) is 100% testable right away!
