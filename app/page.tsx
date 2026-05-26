'use client';

import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { ArrowRight, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/lib/store";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function HomeContent() {
  const { products, categories, heroBanners } = useStore();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  const selectedCategory = categoryParam;
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const minPrice = useMemo(() => products.length ? Math.min(...products.map(p => p.price)) : 0, [products]);
  const maxPrice = useMemo(() => products.length ? Math.max(...products.map(p => p.price)) : 10000, [products]);
  const [priceRange, setPriceRange] = useState<number>(maxPrice);

  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (p.price > priceRange) return false;
    return true;
  });

  return (
    <div className="pb-8 pt-4 space-y-12">
      


      {/* TOP ROW: Sidebar + Hero */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[500px]">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full overflow-y-auto no-scrollbar pr-2 pb-4">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Filter className="w-4 h-4"/> Categories</h3>
          
          <div className="space-y-3 mb-8">
            <button 
              onClick={() => { router.replace('/', { scroll: false }); }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === null ? 'bg-white text-black shadow-lg scale-[1.02]' : 'bg-white/5 hover:bg-white hover:text-black hover:scale-[1.02]'}`}
            >
              All Products
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                onClick={() => { router.replace(`/?category=${encodeURIComponent(c.name)}`, { scroll: false }); }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === c.name ? 'bg-white text-black shadow-lg scale-[1.02]' : 'bg-white/5 hover:bg-white hover:text-black hover:scale-[1.02]'}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Max Price</h4>
            <div className="space-y-3">
              <input 
                type="range" 
                min={minPrice} 
                max={maxPrice} 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-xs text-white/50 font-medium">
                <span>৳{minPrice}</span>
                <span className="text-white">৳{priceRange}</span>
                <span>৳{maxPrice}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* HERO SECTION */}
        <section className="flex-1 relative rounded-[2rem] overflow-hidden h-[400px] lg:h-full bg-black/20 border border-white/10 group">
          <AnimatePresence mode="wait">
            {heroBanners.length > 0 ? (
              <motion.img
                key={currentSlide}
                src={heroBanners[currentSlide].image}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full h-full object-cover"
                alt="Banner"
              />
            ) : (
              <div key="empty" className="w-full h-full flex items-center justify-center text-white/40">No banners added</div>
            )}
          </AnimatePresence>
          
          {/* Carousel Controls */}
          {heroBanners.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)} 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <ChevronLeft className="w-5 h-5"/>
              </button>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroBanners.length)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <ChevronRight className="w-5 h-5"/>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {heroBanners.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Mobile Price Filter (below hero on mobile) */}
      <div className="lg:hidden mx-2 mt-4 mb-2">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Max Price: ৳{priceRange}</label>
        <input 
          type="range" 
          min={minPrice} 
          max={maxPrice} 
          value={priceRange} 
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-white"
        />
      </div>

      {/* PRODUCTS GRID SECTION */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-bold tracking-tight">
            {selectedCategory ? `${selectedCategory}` : 'Latest Arrivals'}
          </h2>
          <span className="text-sm text-white/50">{filteredProducts.length} items</span>
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass p-12 rounded-3xl text-center text-white/50">
            No products found for the selected filters.
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
