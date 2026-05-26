'use client';

import { useStore } from '@/lib/store';
import { ShoppingBag, ArrowLeft, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { products, toggleWishlist, wishlist } = useStore();
  
  const product = products.find(p => p.id === id);
  const isWishlisted = wishlist.includes(id);

  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <button onClick={() => router.back()} className="text-black/60 hover:text-black">Go back</button>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto pt-4 pb-24 space-y-16">
      <div className="flex items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex flex-col justify-center">
          <div className="text-xs font-semibold tracking-widest text-black/50 uppercase mb-3">{product.category}</div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">{product.name}</h1>
          <div className="text-2xl font-medium text-black mb-8">৳{product.price}</div>
          
          <p className="text-black/70 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-black/70">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-medium transition-all ${
                      size === s 
                        ? 'bg-black text-white ring-2 ring-black ring-offset-2 ring-offset-white' 
                        : 'glass hover:bg-black/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-black/70">Quantity</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg hover:bg-black/10 transition-colors"
                >-</button>
                <div className="w-12 text-center font-medium">{quantity}</div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg hover:bg-black/10 transition-colors"
                >+</button>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-5 gap-4">
              <Link
                href={`/checkout/${product.id}?size=${size}&quantity=${quantity}`}
                className="col-span-4 bg-black text-white hover:bg-black/90 px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-transform hover:scale-[1.02]"
              >
                <ShoppingBag className="w-5 h-5" />
                Buy Now
              </Link>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`col-span-1 rounded-xl flex items-center justify-center transition-colors ${isWishlisted ? 'text-white bg-black shadow-lg shadow-black/20' : 'text-black glass hover:bg-black/20'}`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-black/10">
          <h2 className="text-2xl font-bold">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {relatedProducts.map(p => (
               <Link href={`/product/${p.id}`} key={p.id} className="group glass rounded-2xl overflow-hidden glass-hover transition-all relative flex flex-col h-full">
                  <div className="relative aspect-[3/4] overflow-hidden w-full bg-black/5">
                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  </div>
                  <div className="p-4 flex flex-col">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{p.name}</h3>
                    <span className="font-semibold text-black/70">৳{p.price}</span>
                  </div>
               </Link>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
