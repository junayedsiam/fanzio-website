'use client';

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const ADMIN_EMAIL = 'junayedhossain.pro@gmail.com';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Only allow the designated admin email
      if (email !== ADMIN_EMAIL) {
        setError("Access denied. Not an admin account.");
        return;
      }

      let userCredential;

      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch {
        // If login fails, try to auto-create the admin account (first-time setup)
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);

          // Create the admin user document in MongoDB
          await fetch(`/api/users/${userCredential.user.uid}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Admin',
              email: ADMIN_EMAIL,
              role: 'admin',
              phone: '',
              location: '',
            }),
          });
        } catch (createErr) {
          console.error("Admin setup failed:", createErr);
          throw new Error("Invalid email or password.");
        }
      }

      // Double-check admin role
      if (userCredential.user.email === ADMIN_EMAIL) {
        router.push('/admin');
      } else {
        await signOut(auth);
        setError("Access denied.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-8 pb-24 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo className="w-16 h-16 drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Portal</h1>
          <p className="text-black/50 text-sm">Authorized personnel only.</p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 border border-black/10">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-black/60 ml-1">Email</label>
              <input
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/30 transition-all placeholder:text-black/20 text-sm disabled:opacity-50"
              />
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-medium text-black/60 ml-1">Password</label>
              <input
                type="password"
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/30 transition-all placeholder:text-black/20 text-sm disabled:opacity-50"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
