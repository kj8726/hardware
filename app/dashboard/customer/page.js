"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/requests?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const myRequests = (data.requests || []).filter(
          (r) => r.user?._id === session.user.id || r.user === session.user.id
        );
        setRequests(myRequests);
        setLoading(false);
      });
  }, [session]);

  if (status === "loading" || !session) return null;

  const open = requests.filter((r) => r.status === "open").length;
  const responded = requests.filter((r) => r.status === "responded").length;
  const closed = requests.filter((r) => r.status === "closed").length;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="section-tag">Customer Dashboard</span>
            <h1 className="font-display font-black text-4xl text-brand-light">
              HEY, {session.user?.name?.split(" ")[0]?.toUpperCase()} 👋
            </h1>
          </div>
          <Link href="/requests/new" className="btn-primary flex items-center gap-2">
            <span className="text-lg leading-none">+</span> New Request
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Open", value: open, color: "text-brand-orange" },
            { label: "Responded", value: responded, color: "text-green-400" },
            { label: "Closed", value: closed, color: "text-brand-muted" },
          ].map((s) => (
            <div key={s.label} className="bg-brand-card border border-brand-border rounded-xl p-5 text-center">
              <div className={`font-display font-black text-4xl ${s.color}`}>{s.value}</div>
              <div className="font-mono text-xs text-brand-muted uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Requests list */}
        <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-brand-light">MY REQUESTS</h2>
          </div>

          {loading ? (
            <div className="divide-y divide-brand-border">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 flex items-center gap-4">
                  <div className="shimmer w-14 h-14 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="shimmer h-4 rounded w-1/3" />
                    <div className="shimmer h-3 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-display font-bold text-xl text-brand-light mb-2">No requests yet</p>
              <p className="text-brand-muted text-sm mb-5">Post your first part request and get offers from shops.</p>
              <Link href="/requests/new" className="btn-primary">Post a Request</Link>
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {requests.map((req) => (
                <Link key={req._id} href={`/requests/${req._id}`}
                  className="flex items-center gap-4 p-5 hover:bg-brand-dark transition-colors group">
                  {req.image ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-brand-border">
                      <Image src={req.image} alt={req.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl shrink-0">🔩</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-brand-light group-hover:text-brand-orange transition-colors truncate">{req.title}</h3>
                    <p className="font-mono text-xs text-brand-muted mt-0.5">📍 {req.city} · {timeAgo(req.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`block font-mono text-xs font-medium mb-1 ${
                      req.responseCount > 0 ? "text-green-400" : "text-brand-muted"
                    }`}>
                      {req.responseCount} responses
                    </span>
                    <span className={`badge text-[10px] ${
                      req.status === "open" ? "badge-orange" : req.status === "responded" ? "badge-green" : "badge-steel"
                    }`}>{req.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
