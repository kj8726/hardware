import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center grid-bg px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center animate-fade-up">
        <div className="font-display font-black text-[160px] leading-none text-brand-border select-none mb-2">
          4<span className="text-brand-orange">0</span>4
        </div>

        <h1 className="font-display font-black text-3xl text-brand-light mb-3">
          PART NOT FOUND
        </h1>
        <p className="text-brand-muted max-w-sm mx-auto mb-8 leading-relaxed">
          Looks like this part went missing from our inventory. Let's get you back to the warehouse.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary px-8 py-3">
            Back to Home
          </Link>
          <Link href="/marketplace" className="btn-secondary px-8 py-3">
            Browse Marketplace
          </Link>
        </div>

        <div className="mt-12 font-mono text-xs text-brand-border">
          ERROR_CODE: COMPONENT_NOT_FOUND · HARDWAREHUB_404
        </div>
      </div>
    </div>
  );
}
