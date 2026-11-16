'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <CartDrawer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
