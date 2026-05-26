'use client';

import {
  Plus, Package, FolderTree, Image as ImageIcon,
  Edit2, Trash2, X, Loader2, LogOut
} from "lucide-react";

import { useStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { Product, Category, HeroBanner } from "@/lib/data";
import { db, auth } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, deleteDoc, doc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

// Utility to prevent infinite hanging on Firestore operations
const withTimeout = <T,>(promise: Promise<T>, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error("Network timeout: Could not reach Firestore. Please check your connection or restart the dev server.")), ms)
    )
  ]);
};

/* =========================
   Image Upload Field
========================= */
function ImageUploadField({
  value,
  onChange,
  label
}: {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      if (!uploadPreset || !cloudName) {
        throw new Error("Cloudinary configuration is missing from environment variables.");
      }
      
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Upload failed from Cloudinary");
      }

      const data = await res.json();

      if (data?.secure_url) {
        onChange(data.secure_url);
      } else {
        throw new Error("Upload failed, secure_url not returned");
      }
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      alert(err.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-medium text-white/60 ml-1">
          {label}
        </label>
      )}

      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 px-4 rounded-xl"
        >
          {isUploading ? "Uploading..." : "Choose Image"}
        </button>

        {value && (
          <img
           src={value}
           className="w-16 h-16 rounded-xl object-cover"
          />
        )}
      </div>
    </div>
  );
}

/* =========================
   MAIN ADMIN PAGE
========================= */
export default function AdminPage() {
  const router = useRouter();
  const { user, products, categories, heroBanners, loading } = useStore();

  const [activeTab, setActiveTab] =
    useState<"products" | "categories" | "banners">("products");

  const [editingProduct, setEditingProduct] =
    useState<Partial<Product> | null>(null);

  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null);

  const [editingBanner, setEditingBanner] =
    useState<Partial<HeroBanner> | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Error state for better UX
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  /* =====================================
     PRODUCTS
  ===================================== */
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setIsSaving(true);
    setErrorMsg("");

    try {
      const data = {
        name: editingProduct.name ?? "",
        price: Number(editingProduct.price) || 0,
        image: editingProduct.image ?? "",
        category: editingProduct.category ?? "",
        description: editingProduct.description ?? "",
        isHero: !!editingProduct.isHero,
      };

      if (editingProduct.id) {
        await withTimeout(updateDoc(doc(db, "products", editingProduct.id), data));
      } else {
        await withTimeout(addDoc(collection(db, "products"), data));
      }
      
      // Close modal on success
      setEditingProduct(null);
    } catch (err: any) {
      console.error("Save product error:", err);
      setErrorMsg(err.message || "Failed to save product");
    } finally {
      // ALWAYS stop loading state
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this product?")) return;
    setIsDeleting(id);
    try {
      await withTimeout(deleteDoc(doc(db, "products", id)));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(null);
    }
  };

  /* =====================================
     CATEGORIES
  ===================================== */
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    setIsSaving(true);
    setErrorMsg("");

    try {
      const data = {
        name: editingCategory.name ?? "",
      };

      if (editingCategory.id) {
        await withTimeout(updateDoc(doc(db, "categories", editingCategory.id), data));
      } else {
        await withTimeout(addDoc(collection(db, "categories"), data));
      }
      
      // Close modal on success
      setEditingCategory(null);
    } catch (err: any) {
      console.error("Save category error:", err);
      setErrorMsg(err.message || "Failed to save category");
    } finally {
      // ALWAYS stop loading state
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this category?")) return;
    setIsDeleting(id);
    try {
      await withTimeout(deleteDoc(doc(db, "categories", id)));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete category");
    } finally {
      setIsDeleting(null);
    }
  };

  /* =====================================
     BANNERS
  ===================================== */
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    
    setIsSaving(true);
    setErrorMsg("");

    try {
      const data = {
        image: editingBanner.image ?? "",
      };

      if (editingBanner.id) {
        await withTimeout(updateDoc(doc(db, "banners", editingBanner.id), data));
      } else {
        await withTimeout(addDoc(collection(db, "banners"), data));
      }
      
      // Close modal on success
      setEditingBanner(null);
    } catch (err: any) {
      console.error("Save banner error:", err);
      setErrorMsg(err.message || "Failed to save banner");
    } finally {
      // ALWAYS stop loading state
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this banner?")) return;
    setIsDeleting(id);
    try {
      await withTimeout(deleteDoc(doc(db, "banners", id)));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete banner");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="glass p-4 rounded-3xl sticky top-8 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "products"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Package className="w-5 h-5" />
              Products
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "categories"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FolderTree className="w-5 h-5" />
              Categories
            </button>
            <button
              onClick={() => setActiveTab("banners")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "banners"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              Banners
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="glass p-6 rounded-3xl">
            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Products</h2>
                  <button
                    onClick={() => setEditingProduct({})}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="bg-white/5 p-4 rounded-2xl flex flex-col gap-4">
                      <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white truncate">{p.name}</h3>
                        <p className="text-white/60">৳{p.price}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/10">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          disabled={isDeleting === p.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40">
                      No products added yet. Click "Add Product" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Categories</h2>
                  <button
                    onClick={() => setEditingCategory({})}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((c) => (
                    <div key={c.id} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                      <span className="font-medium text-white">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCategory(c)}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          disabled={isDeleting === c.id}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40">
                      No categories added yet. Click "Add Category" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Banners Tab */}
            {activeTab === "banners" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Hero Banners</h2>
                  <button
                    onClick={() => setEditingBanner({})}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Banner
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {heroBanners.map((b) => (
                    <div key={b.id} className="bg-white/5 p-4 rounded-2xl flex flex-col gap-4">
                      <div className="aspect-[21/9] rounded-xl overflow-hidden bg-white/5">
                        {b.image ? (
                          <img src={b.image} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/10">
                        <button
                          onClick={() => setEditingBanner(b)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          disabled={isDeleting === b.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {heroBanners.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40">
                      No banners added yet. Click "Add Banner" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      
      {/* Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingProduct.id ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="e.g. Argentina Home Jersey"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Price (৳)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="e.g. 1500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Category</label>
                  <select
                    required
                    value={editingProduct.category || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 [&>option]:bg-zinc-800"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Description</label>
                <textarea
                  rows={4}
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                  placeholder="Product description..."
                />
              </div>

              <ImageUploadField
                label="Product Image"
                value={editingProduct.image || ""}
                onChange={(url) => setEditingProduct({ ...editingProduct, image: url })}
              />

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingCategory.id ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="e.g. National Teams"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingBanner.id ? "Edit Banner" : "Add Banner"}
              </h3>
              <button
                onClick={() => setEditingBanner(null)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-6">
              <ImageUploadField
                label="Banner Image"
                value={editingBanner.image || ""}
                onChange={(url) => setEditingBanner({ ...editingBanner, image: url })}
              />

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}