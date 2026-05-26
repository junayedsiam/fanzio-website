'use client';

import Link from 'next/link';
import { Heart, User, Search, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Logo } from './Logo';

export function Navbar() {
  const router = useRouter();

  const { products, categories } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopFocus, setIsDesktopFocus] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  /* =========================
     OUTSIDE CLICK CLOSE
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileCategoryOpen(false);
      }

      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setIsDesktopFocus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* =========================
     SAFE SEARCH (OPTIMIZED)
  ========================= */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return products
      .filter((p) =>
        p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [searchQuery, products]);

  const clearSearch = () => setSearchQuery('');

  /* =========================
     SEARCH UI
  ========================= */
  const SearchDropdown = () => {
    if (!searchQuery.trim()) return null;

    return (
      <div className="absolute top-full right-0 mt-3 w-[280px] sm:w-[320px] bg-white rounded-2xl shadow-2xl p-2 z-[70] border flex flex-col gap-1 text-black">
        {searchResults.length > 0 ? (
          searchResults.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsDesktopFocus(false);
                clearSearch();
              }}
              className="flex items-center gap-3 p-2 hover:bg-black/5 rounded-xl"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5">
                {p.image && (
                  <img
                    src={p.image}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">
                  {p.name}
                </p>
                <p className="text-xs text-black/50">
                  ৳{p.price}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-black/50">
            No results found
          </div>
        )}
      </div>
    );
  };

  /* =========================
     RETURN UI
  ========================= */
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full h-16 flex items-center justify-between px-4 sm:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          {/* MOBILE MENU */}
          <div className="md:hidden relative" ref={mobileMenuRef}>
            <button
              onClick={() =>
                setIsMobileCategoryOpen((prev) => !prev)
              }
              className="p-2 text-white/70"
            >
              {isMobileCategoryOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <AnimatePresence>
              {isMobileCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-3 w-56 bg-black rounded-2xl p-2 border border-white/10"
                >
                  <Link
                    href="/wishlist"
                    className="block px-4 py-2 text-white"
                  >
                    ❤️ Wishlist
                  </Link>

                  <button
                    onClick={() => router.push('/')}
                    className="block w-full text-left px-4 py-2 text-white"
                  >
                    All Products
                  </button>

                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setIsMobileCategoryOpen(false);
                        router.push(
                          `/?category=${encodeURIComponent(
                            c.name
                          )}`
                        );
                      }}
                      className="block w-full text-left px-4 py-2 text-white"
                    >
                      {c.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold"
          >
            <Logo className="w-8 h-8" />
            FANZIO
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* MOBILE SEARCH */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="w-5 h-5 text-white/70" />
          </button>

          {/* DESKTOP SEARCH */}
          <div
            ref={desktopSearchRef}
            className="hidden md:block relative"
          >
            <input
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              onFocus={() => setIsDesktopFocus(true)}
              placeholder="Search..."
              className="bg-black/40 text-white px-4 py-2 rounded-full w-48 focus:w-64 transition-all"
            />

            {isDesktopFocus && <SearchDropdown />}
          </div>

          <Link href="/profile">
            <User className="w-5 h-5 text-white/70" />
          </Link>

          <Link href="/wishlist">
            <Heart className="w-5 h-5 text-white/70" />
          </Link>
        </div>
      </div>

      {/* MOBILE SEARCH OVERLAY */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex justify-center z-[60]"
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <div
              className="mt-10 w-[95%] max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-full flex items-center px-4 h-14">
                <Search className="text-black/50" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search..."
                  className="ml-3 w-full outline-none text-black"
                />
                {searchQuery && (
                  <button onClick={clearSearch}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <SearchDropdown />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}