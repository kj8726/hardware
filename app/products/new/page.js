"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["Fasteners", "Hydraulic", "Bearings", "Tools", "Pipes & Fittings", "Electrical", "Mechanical", "Other"];

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Fasteners", brand: "", model: "", stock: "", unit: "piece", tags: "" });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return null;
  if (!session || session.user.role !== "shop_owner") {
    router.push("/login");
    return null;
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    let uploadedUrls = [];

    if (imageFiles.length > 0) {
      setUploading(true);
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "hardwarehub/products");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setSubmitting(false); setUploading(false); return; }
        uploadedUrls.push(data.url);
      }
      setUploading(false);
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        images: uploadedUrls,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error); setSubmitting(false); return; }
    router.push(`/products/${data._id}`);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="mb-8">
          <Link href="/dashboard/shop" className="font-mono text-xs text-brand-muted hover:text-brand-orange flex items-center gap-1 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>
          <span className="section-tag">New Listing</span>
          <h1 className="font-display font-black text-4xl text-brand-light">LIST A PRODUCT</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg text-brand-light mb-4">🖼️ Product Images <span className="text-brand-muted font-body font-normal text-sm">(up to 4)</span></h2>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-brand-border">
                      <Image src={src} alt="" fill className="object-cover" />
                    </div>
                  ))}
                  {imagePreviews.length < 4 && (
                    <div className="aspect-square rounded-lg border-2 border-dashed border-brand-border flex items-center justify-center text-brand-muted hover:border-brand-orange/50 transition-colors">
                      <span className="text-2xl">+</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-36 border-2 border-dashed border-brand-border hover:border-brand-orange/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <svg className="w-8 h-8 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span className="font-display font-bold text-brand-light text-sm">Upload product photos</span>
                  <span className="font-mono text-xs text-brand-muted">JPEG, PNG · Max 5MB each</span>
                </div>
              )}
            </label>
          </div>

          {/* Product details */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-brand-light">📦 Product Details</h2>
            <div>
              <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Product Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g., Deep Groove Ball Bearing 6205" />
            </div>
            <div>
              <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" placeholder="Describe specs, material, dimensions, applications…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Brand</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" placeholder="SKF, Bosch, etc." />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Model / Part No.</label>
                <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="input-field" placeholder="6205-2RS" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Tags (comma-separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="bearing, deep groove, 6205" />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-brand-light">💰 Pricing & Stock</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Price (₹) *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="450" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field">
                  {["piece", "set", "kg", "meter", "liter", "pair", "box", "roll"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Stock Qty</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" placeholder="50" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
            {uploading ? "Uploading images…" : submitting ? "Listing product…" : "List Product →"}
          </button>
        </form>
      </div>
    </div>
  );
}
