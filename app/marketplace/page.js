"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["all", "Fasteners", "Hydraulic", "Bearings", "Tools", "Pipes & Fittings", "Electrical", "Mechanical", "Other"];
const SORTS = [
  { value: "createdAt", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ category: "all", search: "", sortBy: "createdAt", minPrice: "", maxPrice: "" });
  const [searchInput, setSearchInput] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: "12", sortBy: filters.sortBy });
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotalPages(data.pages || 1);
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput }));
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="border-b border-brand-border bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="section-tag">Marketplace</span>
              <h1 className="font-display font-black text-4xl text-brand-light">HARDWARE STORE</h1>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search bearings, hoses, bolts…"
                className="input-field w-full md:w-72"
              />
              <button type="submit" className="btn-primary px-4 py-3 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-56 shrink-0">
            <div className="bg-brand-card border border-brand-border rounded-xl p-5 sticky top-20">
              <h3 className="font-display font-bold text-sm text-brand-light uppercase tracking-wider mb-4">Filters</h3>

              <div className="mb-5">
                <label className="font-mono text-xs text-brand-muted uppercase tracking-wider block mb-2">Category</label>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => { setFilters((f) => ({ ...f, category: cat })); setPage(1); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all capitalize ${filters.category === cat ? "bg-orange-500/15 text-orange-400 font-medium" : "text-brand-muted hover:text-brand-light hover:bg-brand-dark"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="font-mono text-xs text-brand-muted uppercase tracking-wider block mb-2">Price Range (₹)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                    className="input-field text-xs py-2" />
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                    className="input-field text-xs py-2" />
                </div>
                <button onClick={() => { fetchProducts(); setPage(1); }} className="btn-secondary text-xs py-1.5 px-3 w-full mt-2">Apply</button>
              </div>

              <div>
                <label className="font-mono text-xs text-brand-muted uppercase tracking-wider block mb-2">Sort By</label>
                <select value={filters.sortBy} onChange={(e) => { setFilters((f) => ({ ...f, sortBy: e.target.value })); setPage(1); }}
                  className="input-field text-sm">
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
                    <div className="shimmer h-44" />
                    <div className="p-4 space-y-2">
                      <div className="shimmer h-4 rounded w-3/4" />
                      <div className="shimmer h-3 rounded w-1/2" />
                      <div className="shimmer h-6 rounded w-1/3 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-2xl text-brand-light mb-2">No Products Found</h3>
                <p className="text-brand-muted">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-brand-muted">{products.length} products shown</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Link key={product._id} href={`/products/${product._id}`} className="bg-brand-card border border-brand-border rounded-xl overflow-hidden card-hover group">
                      <div className="relative h-44 bg-brand-dark overflow-hidden">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-5xl">🔩</div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="badge-orange text-[10px]">{product.category}</span>
                        </div>
                        {product.stock === 0 && (
                          <div className="absolute top-2 right-2">
                            <span className="badge-red text-[10px]">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-bold text-brand-light text-base leading-tight mb-1 truncate">{product.name}</h3>
                        {product.shop && (
                          <p className="font-mono text-xs text-brand-muted mb-2 truncate">🏪 {product.shop.name} · {product.shop.city}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-xl text-brand-orange">₹{product.price.toLocaleString("en-IN")}</span>
                          <span className="font-mono text-xs text-brand-muted">per {product.unit}</span>
                        </div>
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {[1,2,3,4,5].map((s) => (
                              <span key={s} className={`text-xs ${s <= Math.round(product.rating) ? "star" : "star-empty"}`}>★</span>
                            ))}
                            <span className="font-mono text-xs text-brand-muted">({product.totalReviews})</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
                    <span className="font-mono text-sm text-brand-muted px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
