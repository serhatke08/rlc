'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccountPageWrapperProps {
  children: React.ReactNode;
}

export function AccountPageWrapper({ children }: AccountPageWrapperProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="space-y-4">
          {/* Profile Header Skeleton */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="h-32 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 animate-pulse" />
            <div className="relative px-6 pb-6">
              <div className="mt-20 space-y-3">
                <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
                <div className="flex gap-6 mt-4">
                  <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse" />
            <div className="flex gap-2 border-b border-zinc-200">
              <div className="h-12 w-24 bg-zinc-200 rounded animate-pulse" />
              <div className="h-12 w-24 bg-zinc-200 rounded animate-pulse" />
              <div className="h-12 w-24 bg-zinc-200 rounded animate-pulse" />
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-zinc-200 bg-white">
                  <div className="aspect-square bg-zinc-200 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-full bg-zinc-200 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-zinc-200 rounded animate-pulse" />
                    <div className="h-5 w-1/2 bg-zinc-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

