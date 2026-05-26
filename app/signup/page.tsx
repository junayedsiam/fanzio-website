'use client';

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      const assignedRole = user.email === "junayedhossain.pro@gmail.com" ? "admin" : "user";

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        phone: formData.phone,
        email: user.email,
        photo: user.photoURL,
        role: assignedRole,
        createdAt: new Date().toISOString()
      });

      // Redirect will be handled by the useEffect above once StoreProvider updates

    } catch (err: any) {

      console.error("SIGNUP ERROR:", err);

      setError(err.message || "Google signup failed");

      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-8 pb-24 px-4">

      <div className="w-full max-w-sm">

        <div className="text-center mb-8">

          <Logo className="w-16 h-16 mx-auto mb-4" />

          <h1 className="text-3xl font-bold">
            Create Account
          </h1>

        </div>

        <div className="glass p-6 rounded-2xl">

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <p className="text-red-400 text-sm break-all">
                {error}
              </p>
            )}

            <input
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
              }
              className="w-full p-3 rounded bg-white/5"
              required
            />

            <input
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value
                })
              }
              className="w-full p-3 rounded bg-white/5"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black py-3 rounded flex items-center justify-center gap-2 font-medium"
            >

              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Continuing...
                </>
              ) : (
                <>
                  Continue with Google
                  <ArrowRight className="w-4 h-4" />
                </>
              )}

            </button>

          </form>

          <div className="mt-4 text-center text-sm">
            Already have account?{" "}
            <Link href="/login">
              Login
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}