import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-emerald-500/5">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" className="rounded-2xl" priority />
        </div>
        {children}
      </div>
    </div>
  );
}
