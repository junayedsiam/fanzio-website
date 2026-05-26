'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { Instagram, Facebook, Phone, MapPin } from 'lucide-react';
import { WHATSAPP_NUMBER, FACEBOOK_URL } from '@/lib/data';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export function Footer() {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-24 border-t border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* ===================== DESKTOP FOOTER (HIDDEN ON MOBILE) ===================== */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3 group">
                <Logo className="w-8 h-8 group-hover:scale-105 transition-transform duration-300" />
                <span className="font-bold text-xl tracking-tight">FANZIO</span>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Premium football jerseys for the ultimate fans. Relive the heritage and celebrate the future of the beautiful game.
              </p>
              <div className="flex gap-4">
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="p-2 glass rounded-full hover:bg-white hover:text-black transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 glass rounded-full hover:bg-white hover:text-black transition-all">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 glass rounded-full hover:bg-white hover:text-black transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">Quick Links</h4>
              <ul className="space-y-4">
                <li><Link href="/" className="text-white/60 hover:text-white transition-colors text-sm">All Products</Link></li>
                <li><Link href="/wishlist" className="text-white/60 hover:text-white transition-colors text-sm">My Wishlist</Link></li>
                <li><Link href="/profile" className="text-white/60 hover:text-white transition-colors text-sm">Account</Link></li>
              </ul>
            </div>



            {/* Contact */}
            <div className="space-y-6">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">Get in Touch</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-white/60">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Dohar Nawabganj, Dhaka, Bangladesh</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/60">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{WHATSAPP_NUMBER}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-row justify-between items-center gap-4 text-xs text-white/30">
            <p>© 2024 Fanzio. Built for Champions.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a>
            </div>
          </div>
        </div>

        {/* ===================== MOBILE FOOTER (ANIMATED, HIDDEN ON DESKTOP) ===================== */}
        <div className="md:hidden relative h-[280px] w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeSection === 0 && (
              <motion.div
                key="section1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-5 px-4"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Logo className="w-8 h-8" />
                  <span className="font-bold text-xl tracking-widest uppercase">FANZIO</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  Premium football jerseys for the ultimate fans. Relive the heritage and celebrate the future of the beautiful game.
                </p>
                <p className="text-white/40 text-xs tracking-wider uppercase font-medium">
                  Location: Dohar Nawabganj, Dhaka, Bangladesh
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            )}

            {activeSection === 1 && (
              <motion.div
                key="section2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 px-4"
              >
                <h4 className="font-bold text-sm uppercase tracking-widest text-white/40 mb-2">Quick Links</h4>
                <ul className="space-y-5">
                  <li><Link href="/" className="text-lg font-medium text-white/80 hover:text-white transition-colors">All Products</Link></li>
                  <li><Link href="/wishlist" className="text-lg font-medium text-white/80 hover:text-white transition-colors">My Wishlist</Link></li>
                  <li><Link href="/profile" className="text-lg font-medium text-white/80 hover:text-white transition-colors">Account</Link></li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pagination Dots */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${activeSection === 0 ? 'bg-white w-6' : 'bg-white/20'}`} />
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${activeSection === 1 ? 'bg-white w-6' : 'bg-white/20'}`} />
          </div>
        </div>

      </div>
    </footer>
  );
}
