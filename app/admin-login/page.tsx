'use client';

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
      if (email !== 'junayedhossain.pro@gmail.com') {
         setError("Not Admin");
         setIsSubmitting(false);
         return;
      }

      let userCredential;

      // Automatically create or support the admin login
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        // If login fails (e.g. account doesn't exist), create the admin account
        try {
          const { createUserWithEmailAndPassword } = await import("firebase/auth");
          const { setDoc } = await import("firebase/firestore");
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: "Admin",
            email: "junayedhossain.pro@gmail.com",
            role: "admin",
            phone: "",
            location: ""
          });
        } catch (createErr) {
          console.error("Admin auto-creation failed", createErr);
          throw err; // throw original login error if creation also fails
        }
      }

      const user = userCredential.user;

      // Check if user is admin
      if (user.email === 'junayedhossain.pro@gmail.com') {
        router.push('/admin');
        return;
      } else {
        await signOut(auth);
        setError("Not Admin");
      }

    } catch (err: any) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
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
          <p className="text-white/50 text-sm">Authorized personnel only.</p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 border border-white/10">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 ml-1">Email</label>
              <input 
                type="email" 
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-white/20 text-sm disabled:opacity-50"
              />
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-medium text-white/60 ml-1">Password</label>
              <input 
                type="password" 
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-white/20 text-sm disabled:opacity-50"
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
