'use client';

import { Heart } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/lib/store";

export default function WishlistPage() {
  const { wishlist, products } = useStore();
  const wishlistItems = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="space-y-6 pt-4 pb-20">
      <div className="flex flex-col gap-2 px-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="w-8 h-8 text-white" /> Wishlist
        </h1>
        <p className="text-white/50">Products you&apos;ve saved for later.</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-wrap">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-white/10 p-8 glass">
          <Heart className="w-16 h-16 text-white/20 mb-4" />
          <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-white/50 max-w-sm">Tap the heart icon on any product to save it to your wishlist here.</p>
          <Link href="/" className="mt-4 px-6 py-2 bg-white text-black font-medium rounded-full hover:scale-[1.02] transition-transform">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
