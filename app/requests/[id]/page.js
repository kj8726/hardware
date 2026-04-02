"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [request, setRequest] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseForm, setResponseForm] = useState({ price: "", message: "", deliveryTime: "", inStock: true });
  const [submitting, setSubmitting] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    fetch(`/api/requests/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRequest(data.request);
        setResponses(data.responses || []);
        setLoading(false);
      });
  }, [id]);

  const handleRespond = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResponseError("");

    const res = await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, ...responseForm }),
    });
    const data = await res.json();

    if (!res.ok) {
      setResponseError(data.error);
      setSubmitting(false);
      return;
    }

    setResponses((prev) => [data, ...prev]);
    setResponseSuccess(true);
    setShowResponseForm(false);
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this request?")) return;
    const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/requests");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="shimmer h-64 rounded-2xl" />
          <div className="shimmer h-8 rounded w-2/3" />
          <div className="shimmer h-4 rounded w-full" />
          <div className="shimmer h-4 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">❌</div>
          <h2 className="font-display font-bold text-2xl text-brand-light mb-2">Request Not Found</h2>
          <Link href="/requests" className="btn-secondary text-sm mt-4 inline-flex">← Back to Requests</Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === (request.user?._id || request.user);
  const isShopOwner = session?.user?.role === "shop_owner";
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link href="/requests" className="inline-flex items-center gap-1.5 font-mono text-xs text-brand-muted hover:text-brand-orange mb-6 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 19l-7-7 7-7"/></svg>
          Back to Requests
        </Link>

        {/* Request card */}
        <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden mb-6 animate-fade-up">
          {request.image && (
            <div className="relative h-72 overflow-hidden">
              <Image src={request.image} alt={request.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-card/90 via-brand-card/20 to-transparent" />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-orange">{request.category}</span>
                  <span className={`badge text-xs ${
                    request.status === "open" ? "badge-orange" :
                    request.status === "responded" ? "badge-green" : "badge-steel"
                  }`}>{request.status}</span>
                </div>
                <h1 className="font-display font-black text-3xl text-brand-light leading-tight">{request.title}</h1>
              </div>
              {(isOwner || isAdmin) && (
                <button onClick={handleDelete} className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              )}
            </div>

            <p className="text-brand-muted leading-relaxed mb-5">{request.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Quantity", value: request.quantity },
                { label: "Size", value: request.size || "Not specified" },
                { label: "Brand", value: request.brand || "Any" },
                { label: "Location", value: request.city },
              ].map((d) => (
                <div key={d.label} className="bg-brand-dark rounded-lg p-3 border border-brand-border">
                  <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-0.5">{d.label}</div>
                  <div className="font-display font-bold text-sm text-brand-light">{d.value}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                  {request.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-brand-light font-medium">{request.user?.name}</p>
                  <p className="font-mono text-xs text-brand-muted">{timeAgo(request.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-brand-muted">
                <span>👁 {request.views} views</span>
                <span className={responses.length > 0 ? "text-green-400" : ""}>{responses.length} responses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Response form for shop owners */}
        {isShopOwner && !responseSuccess && (
          <div className="mb-6">
            {!showResponseForm ? (
              <button onClick={() => setShowResponseForm(true)} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                Send Price Quote
              </button>
            ) : (
              <div className="bg-brand-card border border-brand-orange/30 rounded-2xl p-6 animate-fade-up">
                <h3 className="font-display font-bold text-xl text-brand-light mb-4">💬 YOUR RESPONSE</h3>
                {responseError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">{responseError}</div>
                )}
                <form onSubmit={handleRespond} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Price (₹) *</label>
                      <input required value={responseForm.price} onChange={(e) => setResponseForm({ ...responseForm, price: e.target.value })}
                        className="input-field" placeholder="e.g., 450 or 400–500" />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Delivery Time</label>
                      <input value={responseForm.deliveryTime} onChange={(e) => setResponseForm({ ...responseForm, deliveryTime: e.target.value })}
                        className="input-field" placeholder="e.g., 1–2 days, Same day" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea required rows={3} value={responseForm.message} onChange={(e) => setResponseForm({ ...responseForm, message: e.target.value })}
                      className="input-field resize-none" placeholder="Describe the part you have, condition, brand, etc." />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setResponseForm({ ...responseForm, inStock: !responseForm.inStock })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm transition-all ${
                        responseForm.inStock ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-brand-dark border-brand-border text-brand-muted"
                      }`}>
                      <div className={`w-3 h-3 rounded-full ${responseForm.inStock ? "bg-green-400" : "bg-brand-muted"}`} />
                      {responseForm.inStock ? "In Stock" : "Out of Stock"}
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary py-2.5 px-8">
                      {submitting ? "Sending…" : "Send Quote →"}
                    </button>
                    <button type="button" onClick={() => setShowResponseForm(false)} className="btn-secondary py-2.5 px-4 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {responseSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="text-green-400 font-medium">Your quote was sent successfully!</p>
          </div>
        )}

        {/* Responses */}
        <div>
          <h2 className="font-display font-black text-2xl text-brand-light mb-4">
            SHOP RESPONSES
            {responses.length > 0 && (
              <span className="ml-2 font-mono text-sm text-green-400">({responses.length})</span>
            )}
          </h2>

          {responses.length === 0 ? (
            <div className="bg-brand-card border border-brand-border rounded-xl py-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-display font-bold text-lg text-brand-light mb-1">No responses yet</p>
              <p className="text-brand-muted text-sm">Shop owners will respond with price quotes soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((resp) => (
                <div key={resp._id} className={`bg-brand-card border rounded-xl p-5 card-hover ${
                  resp.isAccepted ? "border-green-500/40 glow-orange-sm" : "border-brand-border"
                }`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-display font-black text-orange-400">
                        {resp.shop?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-display font-bold text-brand-light">{resp.shop?.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-brand-muted">📍 {resp.shop?.city}</span>
                          {resp.shop?.rating > 0 && (
                            <span className="font-mono text-xs text-amber-400">⭐ {resp.shop?.rating}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-black text-2xl text-brand-orange">₹{resp.price}</div>
                      {resp.deliveryTime && (
                        <p className="font-mono text-xs text-brand-muted">{resp.deliveryTime}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-brand-muted text-sm leading-relaxed mb-4">{resp.message}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`badge text-[10px] ${resp.inStock ? "badge-green" : "badge-red"}`}>
                        {resp.inStock ? "✓ In Stock" : "Out of Stock"}
                      </span>
                      <span className="font-mono text-xs text-brand-muted">{timeAgo(resp.createdAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      {resp.shop?.whatsapp && (
                        <a href={`https://wa.me/${resp.shop.whatsapp.replace(/\D/g, "")}?text=Hi, I saw your response on HardwareHub for: ${request.title}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/20 font-mono text-xs px-3 py-1.5 rounded-lg transition-all">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 0C5.365 0 0 5.366 0 11.99a11.94 11.94 0 001.636 6.034L0 24l6.134-1.607A11.985 11.985 0 0011.99 24C18.635 24 24 18.634 24 11.99 24 5.367 18.635 0 11.99 0zm0 21.814a9.813 9.813 0 01-5.016-1.374l-.36-.214-3.722.977.994-3.632-.237-.374A9.796 9.796 0 012.2 11.99c0-5.404 4.396-9.8 9.8-9.8 5.406 0 9.8 4.396 9.8 9.8 0 5.406-4.394 9.824-9.81 9.824z"/></svg>
                          WhatsApp
                        </a>
                      )}
                      {resp.shop?.phone && (
                        <a href={`tel:${resp.shop.phone}`}
                          className="flex items-center gap-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 font-mono text-xs px-3 py-1.5 rounded-lg transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.62 19.79 19.79 0 01.01 1 2 2 0 012 .02h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z"/></svg>
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
