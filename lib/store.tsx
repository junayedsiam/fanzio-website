'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, HeroBanner } from './data';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

type User = {
  name: string;
  email: string;
  phone: string;
  location: string;
  role?: string;
};

type StoreContextType = {
  user: User | null;
  setUser: (user: User | null) => void;

  products: Product[];
  setProducts: (products: Product[]) => void;

  categories: Category[];
  setCategories: (categories: Category[]) => void;

  heroBanners: HeroBanner[];
  setHeroBanners: (banners: HeroBanner[]) => void;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  loading: boolean;

  /** Call after any admin mutation to re-fetch all data */
  refreshData: () => Promise<void>;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Admin email — controls which Firebase user gets the 'admin' role
const ADMIN_EMAIL = 'junayedhossain.pro@gmail.com';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
      FETCH PUBLIC DATA
  ========================= */
  const fetchData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes, bannersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/banners'),
      ]);

      const [productsData, categoriesData, bannersData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        bannersRes.json(),
      ]);

      setProducts(productsData.products ?? []);
      setCategories(categoriesData.categories ?? []);
      setHeroBanners(bannersData.banners ?? []);
    } catch (err) {
      console.error('Failed to fetch data from MongoDB:', err);
    }
  }, []);

  // Load products / categories / banners on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================
      AUTH (Firebase Auth only)
  ========================= */
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        setLoading(true);

        if (!firebaseUser) {
          setUser(null);
          setWishlist([]);
          setLoading(false);
          return;
        }

        // Try to get the user from MongoDB
        const res = await fetch(`/api/users/${firebaseUser.uid}`);

        if (res.ok) {
          const data = await res.json();
          const userData = data.user as User;

          // Ensure admin email always has the admin role
          if (firebaseUser.email === ADMIN_EMAIL && userData.role !== 'admin') {
            userData.role = 'admin';
            // Persist the fix
            fetch(`/api/users/${firebaseUser.uid}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: 'admin' }),
            }).catch(console.error);
          }

          setUser(userData);
        } else if (res.status === 404) {
          // First time login — create the user document in MongoDB
          const newUser: User = {
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            phone: '',
            location: '',
            role: firebaseUser.email === ADMIN_EMAIL ? 'admin' : 'user',
          };

          await fetch(`/api/users/${firebaseUser.uid}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
          });

          setUser(newUser);
        }

        setLoading(false);
      } catch (err) {
        console.error('AUTH ERROR:', err);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  /* =========================
      WISHLIST (local only)
  ========================= */
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        products,
        setProducts,
        categories,
        setCategories,
        heroBanners,
        setHeroBanners,
        wishlist,
        toggleWishlist,
        loading,
        refreshData: fetchData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
