"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="shimmer h-96 rounded-2xl" />
          <div className="space-y-4">
            <div className="shimmer h-6 rounded w-1/4" />
            <div className="shimmer h-8 rounded w-3/4" />
            <div className="shimmer h-4 rounded w-full" />
            <div className="shimmer h-10 rounded w-1/3 mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">❌</div>
          <h2 className="font-display font-bold text-2xl text-brand-light mb-2">Product Not Found</h2>
          <Link href="/marketplace" className="btn-secondary text-sm mt-4 inline-flex">← Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 font-mono text-xs text-brand-muted hover:text-brand-orange mb-6 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 19l-7-7 7-7"/></svg>
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-up">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-card border border-brand-border mb-3">
              {product.images?.[activeImage] ? (
                <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-8xl">🔩</div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-display font-black text-2xl text-red-400 bg-red-500/20 border border-red-500/30 px-6 py-3 rounded-xl">OUT OF STOCK</span>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? "border-brand-orange" : "border-brand-border"}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-orange">{product.category}</span>
              {product.brand && <span className="badge-steel">{product.brand}</span>}
            </div>
            <h1 className="font-display font-black text-4xl text-brand-light leading-tight mb-2">{product.name}</h1>
            {product.model && <p className="font-mono text-sm text-brand-muted mb-4">Model: {product.model}</p>}

            <div className="flex items-end gap-2 mb-5">
              <span className="font-display font-black text-5xl text-brand-orange">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="font-mono text-sm text-brand-muted mb-1">/ {product.unit}</span>
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={`text-lg ${s <= Math.round(product.rating) ? "star" : "star-empty"}`}>★</span>
                  ))}
                </div>
                <span className="font-mono text-sm text-brand-muted">({product.totalReviews} reviews)</span>
              </div>
            )}

            <p className="text-brand-muted leading-relaxed mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Stock", value: product.stock > 0 ? `${product.stock} available` : "Out of stock", ok: product.stock > 0 },
                { label: "Unit", value: product.unit },
                { label: "Views", value: `${product.views} views` },
                { label: "City", value: product.shop?.city || "N/A" },
              ].map((d) => (
                <div key={d.label} className="bg-brand-dark rounded-lg p-3 border border-brand-border">
                  <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-0.5">{d.label}</div>
                  <div className={`font-display font-bold text-sm ${d.ok === false ? "text-red-400" : d.ok === true ? "text-green-400" : "text-brand-light"}`}>{d.value}</div>
                </div>
              ))}
            </div>

            {/* Shop info */}
            {product.shop && (
              <div className="bg-brand-card border border-brand-border rounded-xl p-4 mb-5">
                <p className="font-mono text-xs text-brand-muted uppercase tracking-wider mb-2">Sold by</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-display font-black text-orange-400">
                    {product.shop.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display font-bold text-brand-light">{product.shop.name}</p>
                    <p className="font-mono text-xs text-brand-muted">📍 {product.shop.city}</p>
                  </div>
                  {product.shop.rating > 0 && (
                    <div className="ml-auto text-right">
                      <span className="font-mono text-sm text-amber-400">⭐ {product.shop.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {product.shop.whatsapp && (
                    <a href={`https://wa.me/${product.shop.whatsapp.replace(/\D/g, "")}?text=Hi, I'm interested in: ${product.name} (₹${product.price})`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/20 font-mono text-sm px-4 py-2.5 rounded-lg transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 0C5.365 0 0 5.366 0 11.99a11.94 11.94 0 001.636 6.034L0 24l6.134-1.607A11.985 11.985 0 0011.99 24C18.635 24 24 18.634 24 11.99 24 5.367 18.635 0 11.99 0zm0 21.814a9.813 9.813 0 01-5.016-1.374l-.36-.214-3.722.977.994-3.632-.237-.374A9.796 9.796 0 012.2 11.99c0-5.404 4.396-9.8 9.8-9.8 5.406 0 9.8 4.396 9.8 9.8 0 5.406-4.394 9.824-9.81 9.824z"/></svg>
                      WhatsApp
                    </a>
                  )}
                  {product.shop.phone && (
                    <a href={`tel:${product.shop.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 font-mono text-sm px-4 py-2.5 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.62 19.79 19.79 0 01.01 1 2 2 0 012 .02h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z"/></svg>
                      Call
                    </a>
                  )}
                </div>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge-steel text-xs">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
