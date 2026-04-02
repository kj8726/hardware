"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center animate-fade-up max-w-md">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
          ⚠️
        </div>

        <h1 className="font-display font-black text-3xl text-brand-light mb-3">
          SOMETHING BROKE
        </h1>
        <p className="text-brand-muted mb-2 leading-relaxed">
          An unexpected error occurred. This has been logged and we'll look into it.
        </p>
        <p className="font-mono text-xs text-red-400/60 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2 mb-8 break-all">
          {error?.message || "Unknown error"}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary px-8 py-3">
            Try Again
          </button>
          <Link href="/" className="btn-secondary px-8 py-3">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
