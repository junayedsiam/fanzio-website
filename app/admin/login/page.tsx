'use client';

import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useStore } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = credential.user;

      // Check admin role from MongoDB
      const res = await fetch(`/api/users/${fbUser.uid}`);

      if (res.ok) {
        const data = await res.json();
        if (data.user?.role === "admin") {
          router.replace("/admin");
          return;
        }
      }

      await signOut(auth);
      setError("Access denied. Not an admin account.");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm glass p-6 rounded-2xl">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          required
          className="w-full p-3 rounded bg-black/5 text-black"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-3 rounded bg-black/5 text-black"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
          ) : (
            <>Login <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>
    </div>
  );
}
