'use client';

import { WHATSAPP_NUMBER } from '@/lib/data';
import { Send, ArrowLeft, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { useStore } from '@/lib/store';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { products, user } = useStore();
  
  const product = products.find(p => p.id === id);
  const size = searchParams.get('size') || 'M';
  const quantity = parseInt(searchParams.get('quantity') || '1');

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <button onClick={() => router.back()} className="text-black/60 hover:text-black">Go back</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Please log in to continue</h1>
        <p className="text-black/50 text-center max-w-sm">You need an account so we know where to deliver your order.</p>
        <div className="flex gap-4 mt-4 justify-center">
          <Link href="/login" className="px-8 py-3 bg-black text-white font-bold rounded-full hover:scale-105 transition-transform">Login to Continue</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalPrice = product.price * quantity;
    
    // Create WhatsApp message text
    const message = `Name: ${user.name}\nNumber: ${user.phone}\nLocation: ${user.location}\nProduct: ${product.name}\nSize: ${size}\nPrice: ৳${totalPrice}`;
    
    // Generate WhatsApp URI
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto pt-4 pb-24">
      <Link href={`/product/${product.id}`} className="inline-flex items-center gap-2 text-black/50 hover:text-black mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Product
      </Link>
      
      <div className="glass rounded-3xl overflow-hidden p-1">
        <div className="flex flex-col md:flex-row gap-6 p-5">
          {/* Product Summary */}
          <div className="w-full md:w-1/3 shrink-0 relative aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden bg-black/5">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl font-bold leading-tight mb-2">{product.name}</h1>
            <div className="text-xl font-medium text-black/80 mb-6">৳{product.price}</div>

            <div className="space-y-4 mb-6 text-sm text-black/70">
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span>Size:</span>
                <span className="font-bold text-black">{size}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span>Quantity:</span>
                <span className="font-bold text-black">{quantity}</span>
              </div>
            </div>
            
            <div className="glass rounded-2xl p-4 mb-6 space-y-2 border border-black/10">
               <div className="flex items-center gap-2 text-sm font-semibold text-black/90 mb-2">
                 <Info className="w-4 h-4" /> Delivery details
               </div>
               <p className="text-sm text-black/60"><span className="text-black/40">Name:</span> {user.name}</p>
               <p className="text-sm text-black/60"><span className="text-black/40">Phone:</span> {user.phone}</p>
               <p className="text-sm text-black/60"><span className="text-black/40">Location:</span> {user.location}</p>
               <Link href="/profile" className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-block mt-2">Edit delivery details in Profile</Link>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pt-2 border-t border-black/10 mt-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-black/70">Total to pay</span>
                  <span className="text-2xl font-bold">৳{product.price * quantity}</span>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-[#25D366] text-black hover:bg-[#128C7E] px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-transform shadow-lg shadow-[#25D366]/20 hover:scale-[1.02]"
                >
                  <Send className="w-5 h-5" />
                  Confirm Order
                </button>
                <p className="text-center text-xs text-black/40 mt-3">You will be redirected to WhatsApp to confirm your order.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
