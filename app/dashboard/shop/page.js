"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ShopDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [loading, setLoading] = useState(true);
  const [shopForm, setShopForm] = useState({ name: "", description: "", location: "", city: "", phone: "", whatsapp: "", categories: [] });
  const [shopSubmitting, setShopSubmitting] = useState(false);
  const [shopError, setShopError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user?.role !== "shop_owner" && status === "authenticated") router.push("/dashboard/customer");
  }, [status, session, router]);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      fetch("/api/shops").then((r) => r.json()),
      fetch("/api/requests?status=open&limit=20").then((r) => r.json()),
      fetch("/api/products?limit=20").then((r) => r.json()),
    ]).then(([shopsData, reqData, prodData]) => {
      const myShop = shopsData.find?.((s) => s.owner?._id === session.user.id || s.owner === session.user.id);
      setShop(myShop || null);
      setRequests(reqData.requests || []);
      setProducts((prodData.products || []).filter((p) => p.shop?.owner === session.user.id || typeof p.shop === "string"));
      setLoading(false);
    });
  }, [session]);

  const handleCreateShop = async (e) => {
    e.preventDefault();
    setShopSubmitting(true);
    setShopError("");
    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shopForm),
    });
    const data = await res.json();
    if (!res.ok) { setShopError(data.error); setShopSubmitting(false); return; }
    setShop(data);
    setShopSubmitting(false);
  };

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="section-tag">Shop Owner</span>
          <h1 className="font-display font-black text-4xl text-brand-light">SHOP DASHBOARD</h1>
        </div>

        {/* No shop yet */}
        {!loading && !shop && (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-8 mb-8">
            <h2 className="font-display font-bold text-2xl text-brand-light mb-2">Register Your Shop</h2>
            <p className="text-brand-muted text-sm mb-6">Fill in your shop details. An admin will review and approve your shop.</p>
            {shopError && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">{shopError}</div>}
            <form onSubmit={handleCreateShop} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Shop Name *</label>
                <input required value={shopForm.name} onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })} className="input-field" placeholder="ABC Hardware Store" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">City *</label>
                <input required value={shopForm.city} onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })} className="input-field" placeholder="Mumbai" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Location / Address *</label>
                <input required value={shopForm.location} onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })} className="input-field" placeholder="Shop 12, Main Market, Andheri West" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Phone</label>
                <input value={shopForm.phone} onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">WhatsApp</label>
                <input value={shopForm.whatsapp} onChange={(e) => setShopForm({ ...shopForm, whatsapp: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows={2} value={shopForm.description} onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })} className="input-field resize-none" placeholder="Specializing in hydraulic parts, bearings and industrial hardware…" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={shopSubmitting} className="btn-primary py-3 px-8">
                  {shopSubmitting ? "Registering…" : "Register Shop →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Shop status banner */}
        {shop && !shop.isApproved && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <p className="font-display font-bold text-amber-400">Shop Pending Approval</p>
              <p className="text-brand-muted text-sm">An admin will review your shop shortly. You can still explore requests.</p>
            </div>
          </div>
        )}

        {shop && (
          <>
            {/* Shop card */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-display font-black text-orange-400 text-xl">
                {shop.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="font-display font-bold text-xl text-brand-light">{shop.name}</h2>
                <p className="font-mono text-xs text-brand-muted">📍 {shop.city} · ⭐ {shop.rating} ({shop.totalReviews} reviews)</p>
              </div>
              <span className={shop.isApproved ? "badge-green" : "badge badge-steel"}>
                {shop.isApproved ? "✓ Approved" : "Pending"}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-brand-dark border border-brand-border rounded-xl p-1">
              {["requests", "products"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-lg font-display font-bold text-sm uppercase tracking-wide transition-all ${
                    activeTab === tab ? "bg-brand-orange text-white" : "text-brand-muted hover:text-brand-light"
                  }`}>
                  {tab === "requests" ? `Open Requests (${requests.length})` : `My Products (${products.length})`}
                </button>
              ))}
            </div>

            {activeTab === "requests" && (
              <div className="space-y-3">
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="shimmer h-24 rounded-xl" />)
                ) : requests.length === 0 ? (
                  <div className="text-center py-12 text-brand-muted">No open requests right now.</div>
                ) : requests.map((req) => (
                  <Link key={req._id} href={`/requests/${req._id}`}
                    className="flex items-start gap-4 bg-brand-card border border-brand-border rounded-xl p-4 card-hover group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-brand-light group-hover:text-brand-orange transition-colors">{req.title}</h3>
                        <span className="badge-orange text-[10px]">{req.category}</span>
                      </div>
                      <p className="text-brand-muted text-sm line-clamp-1">{req.description}</p>
                      <p className="font-mono text-xs text-brand-muted mt-1">📍 {req.city} · Qty: {req.quantity}</p>
                    </div>
                    <span className="btn-primary text-xs py-1.5 px-3 shrink-0">Respond →</span>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs text-brand-muted">{products.length} products</span>
                  <Link href="/products/new" className="btn-primary text-sm py-2 px-4">+ Add Product</Link>
                </div>
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => <div key={i} className="shimmer h-32 rounded-xl" />)}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 text-brand-muted">
                    <p className="mb-4">No products listed yet.</p>
                    <Link href="/products/new" className="btn-primary text-sm">List Your First Product</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {products.map((p) => (
                      <div key={p._id} className="bg-brand-card border border-brand-border rounded-xl p-4 card-hover">
                        <h4 className="font-display font-bold text-brand-light text-sm truncate mb-1">{p.name}</h4>
                        <p className="font-display font-black text-brand-orange">₹{p.price}</p>
                        <p className="font-mono text-xs text-brand-muted mt-1">Stock: {p.stock}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
