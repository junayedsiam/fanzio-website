'use client';

import { useStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin-login');
      } else if (user.role === 'admin' || user.email === 'junayedhossain.pro@gmail.com') {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white/50 mb-4" />
        <p className="text-white/50 font-medium tracking-wide">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
