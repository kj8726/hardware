"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/requests", label: "Requests" },
  ];

  const dashboardHref =
    session?.user?.role === "admin"
      ? "/dashboard/admin"
      : session?.user?.role === "shop_owner"
      ? "/dashboard/shop"
      : "/dashboard/customer";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-border bg-brand-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center glow-orange-sm group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <span className="font-display font-black text-xl text-brand-light tracking-tight">
              HARDWARE<span className="text-brand-orange">HUB</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md font-body font-medium text-sm transition-all duration-150 ${
                  pathname === link.href
                    ? "text-brand-orange bg-orange-500/10"
                    : "text-brand-muted hover:text-brand-light hover:bg-brand-card"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/requests/new"
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  <span className="text-lg leading-none">+</span> Post Request
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-card border border-transparent hover:border-brand-border transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-display font-bold text-sm">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-brand-light font-medium max-w-[100px] truncate">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-brand-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-brand-border">
                        <p className="text-xs text-brand-muted">Signed in as</p>
                        <p className="text-sm font-medium text-brand-light truncate">{session.user?.email}</p>
                        <span className="badge-orange text-[10px] mt-1">{session.user?.role?.replace("_", " ")}</span>
                      </div>
                      <Link href={dashboardHref} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-light hover:bg-brand-dark hover:text-brand-orange transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                        Dashboard
                      </Link>
                      <button onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Join Free</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-brand-card text-brand-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-brand-border py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg font-medium text-sm ${pathname === link.href ? "text-brand-orange bg-orange-500/10" : "text-brand-muted hover:text-brand-light"}`}>
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/requests/new" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-brand-orange font-medium">+ Post Request</Link>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-brand-light hover:text-brand-orange">Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2.5 text-sm text-red-400">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-brand-light">Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-brand-orange font-medium">Join Free →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
