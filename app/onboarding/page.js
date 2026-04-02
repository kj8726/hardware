"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: selectedRole }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // Refresh the session so role updates immediately
    await update({ role: selectedRole });

    router.push(
      selectedRole === "shop_owner" ? "/dashboard/shop" : "/dashboard/customer"
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-12 px-4 grid-bg">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg animate-fade-up">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-orange rounded-sm flex items-center justify-center glow-orange-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2.5}>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <span className="font-display font-black text-2xl text-brand-light">
              HARDWARE<span className="text-brand-orange">HUB</span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-5">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="font-mono text-xs text-green-400">Google account connected</span>
          </div>

          <h1 className="font-display font-black text-4xl text-brand-light mb-2">
            ONE LAST STEP
          </h1>
          <p className="text-brand-muted">
            Welcome{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}! How will you use HardwareHub?
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            {
              value: "customer",
              icon: "🔍",
              title: "I Need Parts",
              subtitle: "Customer",
              desc: "Post photo requests and get price quotes from local hardware shops.",
              features: ["Post part requests", "Compare shop prices", "Contact sellers directly", "Review shops"],
            },
            {
              value: "shop_owner",
              icon: "🏪",
              title: "I Sell Parts",
              subtitle: "Shop Owner",
              desc: "Respond to customer requests and list your inventory on the marketplace.",
              features: ["Respond to requests", "List products", "Receive customer leads", "Build shop reputation"],
            },
          ].map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 group ${
                selectedRole === role.value
                  ? "bg-orange-500/10 border-orange-500 glow-orange-sm"
                  : "bg-brand-card border-brand-border hover:border-orange-500/40 hover:bg-brand-card/80"
              }`}
            >
              {selectedRole === role.value && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="text-4xl mb-3">{role.icon}</div>
              <div className="font-mono text-xs text-brand-orange uppercase tracking-wider mb-1">{role.subtitle}</div>
              <h3 className="font-display font-black text-xl text-brand-light mb-2">{role.title}</h3>
              <p className="text-brand-muted text-sm mb-4 leading-relaxed">{role.desc}</p>

              <ul className="space-y-1.5">
                {role.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-brand-muted">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedRole === role.value ? "bg-orange-400" : "bg-brand-border"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className="btn-primary w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
              </svg>
              Setting up your account…
            </>
          ) : selectedRole ? (
            `Continue as ${selectedRole === "shop_owner" ? "Shop Owner" : "Customer"} →`
          ) : (
            "Select your role to continue"
          )}
        </button>

        <p className="text-center font-mono text-xs text-brand-muted mt-4">
          You can change this later from your profile settings
        </p>
      </div>
    </div>
  );
}
