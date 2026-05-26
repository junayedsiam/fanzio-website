'use client';

import { UserCircle, MapPin, Phone, Edit2, LogOut, Save, Loader2, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";

function ProfileContent({ user }: { user: any }) {
  const router = useRouter();
  const { setUser } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(user);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const confirmSignOut = async () => {
    try {
      await signOut(auth);
      setIsSignOutModalOpen(false);
      router.replace("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${auth.currentUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      // Update local state
      setUser({ ...user, name: formData.name, phone: formData.phone, location: formData.location });
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pt-4 pb-24">

      {/* HEADER */}
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold">Profile</h1>
        <button
          onClick={() => setIsSignOutModalOpen(true)}
          className="text-sm text-black/50 hover:text-red-400 flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-black/10 flex items-center justify-center border border-black/20">
          <UserCircle className="w-12 h-12 text-black/50" />
        </div>

        {isEditing ? (
          <div className="flex-1 w-full space-y-3">
            <input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full glass px-4 py-2 rounded-xl text-sm"
              placeholder="Name"
            />
            <input
              disabled
              value={formData.email}
              className="w-full glass px-4 py-2 rounded-xl text-black/30 text-sm"
            />
            <input
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full glass px-4 py-2 rounded-xl text-sm"
              placeholder="Phone"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setFormData(user); }}
                className="glass px-6 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-black/50">{user.email}</p>
              <div className="flex items-center gap-2 text-sm text-black/40 mt-2 justify-center md:justify-start">
                <Phone className="w-4 h-4" />
                {user.phone || "No phone"}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="glass px-6 py-3 rounded-2xl text-sm font-bold"
            >
              <Edit2 className="w-4 h-4 inline mr-2" />
              Edit
            </button>
          </>
        )}
      </div>

      {/* ADMIN PANEL */}
      {user.role === "admin" && (
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-yellow-500" />
            <h3 className="font-bold text-xl">Admin Controls</h3>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-black text-white px-6 py-3 rounded-2xl w-full font-bold"
          >
            Check Out Admin Panel
          </button>
        </div>
      )}

      {/* DELIVERY ADDRESS */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-xl flex items-center gap-2">
          <MapPin className="w-5 h-5 text-black/60" /> Delivery Address
        </h3>
        {isEditing ? (
          <textarea
            value={formData.location || ""}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full glass px-4 py-3 rounded-2xl text-sm resize-none bg-transparent outline-none focus:ring-1 focus:ring-black/30"
            rows={3}
            placeholder="Enter your full delivery address..."
          />
        ) : (
          <div className="bg-black/5 border border-black/10 p-5 rounded-2xl flex flex-col items-start gap-3">
            {user.location ? (
              <p className="text-sm text-black/60 leading-relaxed">{user.location}</p>
            ) : (
              <>
                <p className="text-sm text-black/40 leading-relaxed">
                  You haven&apos;t added a delivery address yet.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="glass px-4 py-2 rounded-xl text-xs font-bold hover:bg-black hover:text-white transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  + Add Address
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* SIGN OUT MODAL */}
      <AnimatePresence>
        {isSignOutModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass p-6 rounded-3xl max-w-sm w-full text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-xl font-bold mb-2">Sign out?</h3>
              <p className="text-black/50 text-sm mb-6">You will need to login again.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsSignOutModalOpen(false)}
                  className="flex-1 glass py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 bg-red-500 text-black py-2 rounded-xl"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading } = useStore();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Not logged in</h1>
        <button
          onClick={() => router.push("/login")}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return <ProfileContent user={user} />;
}
