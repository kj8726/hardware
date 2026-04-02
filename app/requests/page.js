"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

const CATEGORIES = ["all", "Fasteners", "Hydraulic", "Bearings", "Tools", "Pipes & Fittings", "Electrical", "Mechanical", "Other"];

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: "12", status: "open" });
    if (category !== "all") params.set("category", category);
    if (city) params.set("city", city);

    const res = await fetch(`/api/requests?${params}`);
    const data = await res.json();
    setRequests(data.requests || []);
    setTotalPages(data.pages || 1);
    setLoading(false);
  }, [page, category, city]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="border-b border-brand-border bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="section-tag">Live Board</span>
              <h1 className="font-display font-black text-4xl text-brand-light">PART REQUESTS</h1>
              <p className="text-brand-muted text-sm mt-1">Browse what customers need — respond if you have it</p>
            </div>
            {session && (
              <Link href="/requests/new" className="btn-primary flex items-center gap-2 self-start md:self-auto">
                <span className="text-lg leading-none">+</span> Post Request
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                className={`shrink-0 px-3 py-1.5 rounded-full font-mono text-xs uppercase tracking-wide transition-all border ${
                  category === cat ? "bg-orange-500/15 border-orange-500/40 text-orange-400" : "bg-brand-card border-brand-border text-brand-muted hover:text-brand-light"
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <input type="text" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}
            placeholder="Filter by city…" className="input-field sm:w-48 shrink-0" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
                <div className="shimmer h-40" />
                <div className="p-4 space-y-2">
                  <div className="shimmer h-4 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-full" />
                  <div className="shimmer h-3 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-display font-bold text-2xl text-brand-light mb-2">No Open Requests</h3>
            <p className="text-brand-muted mb-6">Be the first to post a part request!</p>
            {session && <Link href="/requests/new" className="btn-primary">Post a Request</Link>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((req) => (
                <Link key={req._id} href={`/requests/${req._id}`}
                  className="bg-brand-card border border-brand-border rounded-xl overflow-hidden card-hover group">
                  {req.image ? (
                    <div className="relative h-44 overflow-hidden">
                      <Image src={req.image} alt={req.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className="badge-orange text-[10px]">{req.category}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 bg-brand-dark border-b border-brand-border flex items-center px-4 gap-3">
                      <div className="text-3xl">🔩</div>
                      <span className="badge-orange text-[10px]">{req.category}</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display font-bold text-brand-light text-lg leading-tight mb-1">{req.title}</h3>
                    <p className="text-brand-muted text-sm line-clamp-2 mb-3">{req.description}</p>
                    <div className="flex items-center justify-between text-xs font-mono text-brand-muted">
                      <div className="flex items-center gap-2">
                        <span>📍 {req.city}</span>
                        {req.quantity && req.quantity !== "1" && <span>· Qty: {req.quantity}</span>}
                      </div>
                      <span>{timeAgo(req.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">
                          {req.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-brand-muted">{req.user?.name?.split(" ")[0]}</span>
                      </div>
                      <span className={`font-mono text-xs font-medium ${req.responseCount > 0 ? "text-green-400" : "text-brand-muted"}`}>
                        {req.responseCount} {req.responseCount === 1 ? "response" : "responses"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
                <span className="font-mono text-sm text-brand-muted px-4">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
