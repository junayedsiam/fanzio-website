import React from 'react';
import { Logo } from '@/components/Logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 min-h-screen bg-black/95 backdrop-blur-3xl flex items-center justify-center z-50">
      <div className="animate-pulse flex flex-col items-center">
        <Logo className="w-16 h-16 drop-shadow-2xl" />
      </div>
    </div>
  );
}
