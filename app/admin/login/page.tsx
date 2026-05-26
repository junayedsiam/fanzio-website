'use client';

import Link from "next/link";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const fbUser = credential.user;

      const snap = await getDoc(doc(db, "users", fbUser.uid));

      if (snap.exists() && snap.data().role === "admin") {
        router.replace("/admin");
      } else {
        await signOut(auth);
        setError("Access denied");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />

        <button disabled={isSubmitting}>
          {isSubmitting ? "Loading..." : "Login"}
        </button>

        {error && <p>{error}</p>}
      </form>
    </div>
  );
}