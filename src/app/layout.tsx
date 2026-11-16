import type { Metadata, Viewport } from 'next';
import './globals.css';
import './tailwind.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { MarketplaceProvider } from '@/context/MarketplaceContext';
import LayoutShell from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: 'Shadow Topup Center | Nepal\'s #1 Instant Game Top-Ups & Digital Store',
  description: "Nepal's premier gaming top-up & digital subscription center for Free Fire diamonds, Mobile Legends, PUBG UC, ChatGPT Plus, CapCut Pro, Steam gift cards and TikTok coins. Pay instantly with eSewa, Khalti & Fonepay QR.",
  keywords: ['shadow topup', 'shadow topup center', 'game topup nepal', 'free fire diamond nepal', 'pubg uc nepal', 'esewa topup', 'chatgpt plus nepal', 'gift cards nepal', 'fonepay qr'],
  authors: [{ name: 'Shadow Topup Center' }],
  metadataBase: new URL('https://shadowtopup.com'),
  openGraph: {
    title: 'Shadow Topup Center | Instant Game Top-Ups & Subscriptions Nepal',
    description: 'Fast, secure game top-ups and subscriptions in Nepal. Instant delivery within 60 seconds.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Shadow Topup Center',
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#070b14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b14] text-slate-100 min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <MarketplaceProvider>
              <LayoutShell>{children}</LayoutShell>
            </MarketplaceProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
