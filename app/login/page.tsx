'use client';

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      await signInWithPopup(auth, provider);
      // Redirect will be handled by the useEffect above once the StoreProvider updates context

    } catch (err: any) {

      console.error("GOOGLE LOGIN ERROR:", err);

      setError(err.message || "Google login failed");

      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">

      <div className="w-full max-w-sm text-center">

        <div className="mb-8">
          <Logo className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-white/50">
            Continue with Google
          </p>
        </div>

        {error && (
          <p className="text-red-400 mb-4 text-sm break-all">
            {error}
          </p>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isSubmitting || (loading && !!auth.currentUser)}
          className="w-full bg-white text-black py-3 rounded flex items-center justify-center gap-2 font-medium"
        >

          {isSubmitting || (loading && !!auth.currentUser) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Continue with Google
            </>
          )}

        </button>

      </div>

    </div>
  );
}