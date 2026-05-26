'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, HeroBanner } from './data';
import { auth, db } from './firebase';

import {
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

import {
  doc,
  onSnapshot,
  collection,
  setDoc,
  updateDoc,
  query
} from 'firebase/firestore';

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
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  /* =========================
      AUTH (CLEAN + FAST)
  ========================= */

  useEffect(() => {
    let userDocUnsub: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        setLoading(true);

        // ❌ logout case
        if (!firebaseUser) {
          setUser(null);
          setWishlist([]);

          if (userDocUnsub) {
            userDocUnsub();
            userDocUnsub = null;
          }

          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', firebaseUser.uid);

        // ❌ cleanup old listener
        if (userDocUnsub) {
          userDocUnsub();
        }

        // ✅ stable Firestore listener
        userDocUnsub = onSnapshot(userRef, async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as User;

            // 🔥 auto admin fix (safe)
            if (
              firebaseUser.email === 'junayedhossain.pro@gmail.com' &&
              data.role !== 'admin'
            ) {
              updateDoc(userRef, { role: 'admin' }).catch(console.error);
              data.role = 'admin';
            }

            setUser(data);
            setLoading(false);
          } else {
            // ❌ create user only once
            const assignedRole =
              firebaseUser.email === 'junayedhossain.pro@gmail.com'
                ? 'admin'
                : 'user';

            const newUser: User = {
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              phone: '',
              location: '',
              role: assignedRole
            };

            try {
              await setDoc(userRef, newUser);
              setUser(newUser);
            } catch (err) {
              console.error('User create error:', err);
            }

            setLoading(false);
          }
        });

      } catch (err) {
        console.error('AUTH ERROR:', err);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (userDocUnsub) userDocUnsub();
    };
  }, []);

  /* =========================
      PRODUCTS (FAST)
  ========================= */

  useEffect(() => {
    const q = query(collection(db, 'products'));

    const unsub = onSnapshot(q, (snapshot) => {
      const items: Product[] = snapshot.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id,
          name: data.name || '',
          price: Number(data.price) || 0,
          image: data.image || '',
          category: data.category || '',
          description: data.description || '',
          isHero: !!data.isHero
        };
      });

      setProducts(items);
    });

    return () => unsub();
  }, []);

  /* =========================
      CATEGORIES
  ========================= */

  useEffect(() => {
    const q = query(collection(db, 'categories'));

    const unsub = onSnapshot(q, (snapshot) => {
      const items: Category[] = snapshot.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id,
          name: data.name || ''
        };
      });

      setCategories(items);
    });

    return () => unsub();
  }, []);

  /* =========================
      BANNERS
  ========================= */

  useEffect(() => {
    const q = query(collection(db, 'banners'));

    const unsub = onSnapshot(q, (snapshot) => {
      const items: HeroBanner[] = snapshot.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id,
          image: data.image || ''
        };
      });

      setHeroBanners(items);
    });

    return () => unsub();
  }, []);

  /* =========================
      WISHLIST (LOCAL ONLY)
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

        loading
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