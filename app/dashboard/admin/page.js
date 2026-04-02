"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const TABS = ["overview", "shops", "users", "requests"];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/shops").then((r) => r.json()),
      fetch("/api/requests?limit=50&status=open").then((r) => r.json()),
    ]).then(([usersData, shopsData, reqData]) => {
      setUsers(Array.isArray(usersData) ? usersData : []);
      setShops(Array.isArray(shopsData) ? shopsData : []);
      setRequests(reqData.requests || []);
      setLoading(false);
    });
  }, [session]);

  const approveShop = async (shopId, approve) => {
    setActionLoading(shopId);
    const res = await fetch("/api/admin/shops", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId, isApproved: approve }),
    });
    const updated = await res.json();
    setShops((prev) => prev.map((s) => (s._id === shopId ? updated : s)));
    setActionLoading("");
  };

  const updateUserRole = async (userId, role) => {
    setActionLoading(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, updates: { role } }),
    });
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
    setActionLoading("");
  };

  if (status === "loading" || !session) return null;

  const pendingShops = shops.filter((s) => !s.isApproved);
  const approvedShops = shops.filter((s) => s.isApproved);
  const customers = users.filter((u) => u.role === "customer");
  const shopOwners = users.filter((u) => u.role === "shop_owner");

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="section-tag">Admin Panel</span>
          <h1 className="font-display font-black text-4xl text-brand-light">CONTROL CENTER</h1>
          <p className="text-brand-muted text-sm mt-1">Manage users, shops, and platform activity</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, icon: "👤", color: "text-blue-400" },
            { label: "Approved Shops", value: approvedShops.length, icon: "🏪", color: "text-green-400" },
            { label: "Pending Shops", value: pendingShops.length, icon: "⏳", color: "text-amber-400" },
            { label: "Open Requests", value: requests.length, icon: "📋", color: "text-brand-orange" },
          ].map((s) => (
            <div key={s.label} className="bg-brand-card border border-brand-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{s.icon}</span>
                {s.label === "Pending Shops" && pendingShops.length > 0 && (
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                )}
              </div>
              <div className={`font-display font-black text-3xl ${s.color}`}>{s.value}</div>
              <div className="font-mono text-xs text-brand-muted uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-brand-dark border border-brand-border rounded-xl p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`shrink-0 flex-1 py-2.5 px-4 rounded-lg font-display font-bold text-sm uppercase tracking-wide transition-all ${
                activeTab === tab ? "bg-brand-orange text-white" : "text-brand-muted hover:text-brand-light"
              }`}>
              {tab}
              {tab === "shops" && pendingShops.length > 0 && (
                <span className="ml-1.5 bg-amber-400 text-black text-[10px] font-mono rounded-full px-1.5 py-0.5">{pendingShops.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-border">
                <h3 className="font-display font-bold text-lg text-brand-light">RECENT USERS</h3>
              </div>
              <div className="divide-y divide-brand-border">
                {users.slice(0, 6).map((user) => (
                  <div key={user._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-display font-bold text-orange-400 text-sm shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-brand-light font-medium truncate">{user.name}</p>
                      <p className="font-mono text-xs text-brand-muted truncate">{user.email}</p>
                    </div>
                    <span className={`badge text-[10px] shrink-0 ${
                      user.role === "admin" ? "badge-red" :
                      user.role === "shop_owner" ? "badge-orange" : "badge-steel"
                    }`}>{user.role?.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-brand-light">PENDING APPROVALS</h3>
                {pendingShops.length > 0 && (
                  <span className="bg-amber-400/15 text-amber-400 border border-amber-400/20 font-mono text-xs px-2 py-0.5 rounded-full">{pendingShops.length} pending</span>
                )}
              </div>
              {pendingShops.length === 0 ? (
                <div className="py-10 text-center text-brand-muted text-sm">✅ No pending approvals</div>
              ) : (
                <div className="divide-y divide-brand-border">
                  {pendingShops.map((shop) => (
                    <div key={shop._id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-brand-light font-medium truncate">{shop.name}</p>
                        <p className="font-mono text-xs text-brand-muted">📍 {shop.city} · {shop.owner?.email}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => approveShop(shop._id, true)} disabled={actionLoading === shop._id}
                          className="bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/20 font-mono text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                          ✓ Approve
                        </button>
                        <button onClick={() => approveShop(shop._id, false)} disabled={actionLoading === shop._id}
                          className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 font-mono text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shops tab */}
        {activeTab === "shops" && (
          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border">
              <h3 className="font-display font-bold text-lg text-brand-light">ALL SHOPS ({shops.length})</h3>
            </div>
            {loading ? (
              <div className="divide-y divide-brand-border">
                {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-16 m-4 rounded-lg" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-border">
                      {["Shop", "Owner", "City", "Rating", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 font-mono text-xs text-brand-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {shops.map((shop) => (
                      <tr key={shop._id} className="hover:bg-brand-dark transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center font-display font-bold text-orange-400 text-sm">
                              {shop.name?.charAt(0)}
                            </div>
                            <span className="font-medium text-brand-light text-sm">{shop.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-brand-muted">{shop.owner?.name}<br/>{shop.owner?.email}</td>
                        <td className="px-5 py-3 font-mono text-xs text-brand-muted">{shop.city}</td>
                        <td className="px-5 py-3 font-mono text-xs text-amber-400">⭐ {shop.rating} ({shop.totalReviews})</td>
                        <td className="px-5 py-3">
                          <span className={`badge text-[10px] ${shop.isApproved ? "badge-green" : "badge badge-steel"}`}>
                            {shop.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            {!shop.isApproved ? (
                              <button onClick={() => approveShop(shop._id, true)} disabled={actionLoading === shop._id}
                                className="bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/20 font-mono text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                                Approve
                              </button>
                            ) : (
                              <button onClick={() => approveShop(shop._id, false)} disabled={actionLoading === shop._id}
                                className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 font-mono text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-brand-light">ALL USERS ({users.length})</h3>
              <div className="flex gap-3 font-mono text-xs text-brand-muted">
                <span>👤 {customers.length} customers</span>
                <span>🏪 {shopOwners.length} owners</span>
              </div>
            </div>
            {loading ? (
              <div className="divide-y divide-brand-border">{[...Array(6)].map((_, i) => <div key={i} className="shimmer h-14 m-4 rounded-lg" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-border">
                      {["User", "Email", "Provider", "Role", "Joined", "Change Role"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 font-mono text-xs text-brand-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-brand-dark transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-500/15 flex items-center justify-center font-bold text-orange-400 text-xs">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-brand-light">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-brand-muted">{user.email}</td>
                        <td className="px-5 py-3"><span className="badge-steel text-[10px]">{user.provider}</span></td>
                        <td className="px-5 py-3">
                          <span className={`badge text-[10px] ${
                            user.role === "admin" ? "badge-red" :
                            user.role === "shop_owner" ? "badge-orange" : "badge-steel"
                          }`}>{user.role?.replace("_", " ")}</span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-brand-muted">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                        </td>
                        <td className="px-5 py-3">
                          {user._id !== session.user.id && (
                            <select value={user.role} onChange={(e) => updateUserRole(user._id, e.target.value)}
                              disabled={actionLoading === user._id}
                              className="bg-brand-dark border border-brand-border text-brand-light font-mono text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-brand-orange disabled:opacity-50">
                              <option value="customer">customer</option>
                              <option value="shop_owner">shop_owner</option>
                              <option value="admin">admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Requests tab */}
        {activeTab === "requests" && (
          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border">
              <h3 className="font-display font-bold text-lg text-brand-light">OPEN REQUESTS ({requests.length})</h3>
            </div>
            {loading ? (
              <div className="divide-y divide-brand-border">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-16 m-4 rounded-lg" />)}</div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-brand-muted text-sm">No open requests.</div>
            ) : (
              <div className="divide-y divide-brand-border">
                {requests.map((req) => (
                  <div key={req._id} className="flex items-start gap-4 px-5 py-4 hover:bg-brand-dark transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display font-bold text-brand-light text-sm">{req.title}</h4>
                        <span className="badge-orange text-[10px]">{req.category}</span>
                      </div>
                      <p className="text-brand-muted text-xs line-clamp-1">{req.description}</p>
                      <p className="font-mono text-xs text-brand-muted mt-1">
                        by {req.user?.name} · 📍 {req.city} · {req.responseCount} responses
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`badge text-[10px] ${
                        req.status === "open" ? "badge-orange" :
                        req.status === "responded" ? "badge-green" : "badge-steel"
                      }`}>{req.status}</span>
                      <p className="font-mono text-xs text-brand-muted mt-1">
                        {new Date(req.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
