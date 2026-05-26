import { Product } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist } = useStore();

  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const isWishlisted = safeWishlist.includes(product?.id || "");

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product?.id) return;
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group glass rounded-2xl overflow-hidden transition-all duration-500 relative flex flex-col h-full"
    >
      <Link
        href={`/product/${product?.id || ""}`}
        className="flex-grow flex flex-col cursor-pointer"
      >
        <div className="relative aspect-[3/4] overflow-hidden w-full bg-black/5">
          {product?.image && (
            <Image
              src={product.image}
              alt={product.name || "Product"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
              View Product
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-medium text-sm md:text-base leading-tight mb-2 line-clamp-2">
            {product?.name || "Untitled Product"}
          </h3>

          <div className="mt-auto pt-2">
            <span className="font-semibold text-black">
              ৳{product?.price || 0}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleWishlist}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isWishlisted
              ? "text-white bg-black shadow-lg"
              : "text-black glass hover:bg-black/20"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
          />
        </button>
      </div>
    </motion.div>
  );
}