"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["Fasteners", "Hydraulic", "Bearings", "Tools", "Pipes & Fittings", "Electrical", "Mechanical", "Other"];

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing product data
  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { router.push("/dashboard/shop"); return; }
        setForm({
          name:        data.name        || "",
          description: data.description || "",
          category:    data.category    || "Fasteners",
          brand:       data.brand       || "",
          model:       data.model       || "",
          tags:        (data.tags || []).join(", "),
          price:       data.price?.toString() || "",
          unit:        data.unit        || "piece",
          stock:       data.stock?.toString() || "0",
        });
        setExistingImages(data.images || []);
        setLoading(false);
      });
  }, [id, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="shimmer h-8 rounded w-1/3" />
          <div className="shimmer h-64 rounded-xl" />
          <div className="shimmer h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "shop_owner") {
    router.push("/login");
    return null;
  }

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - existingImages.length);
    setNewImageFiles(files);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    let uploadedUrls = [...existingImages];

    // Upload any new images
    if (newImageFiles.length > 0) {
      setUploading(true);
      for (const file of newImageFiles) {
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

    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price:  parseFloat(form.price),
        stock:  parseInt(form.stock) || 0,
        images: uploadedUrls,
        tags:   form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Update failed"); setSubmitting(false); return; }
    router.push("/dashboard/shop");
  };

  const totalImages = existingImages.length + newImagePreviews.length;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="mb-8">
          <Link href="/dashboard/shop" className="font-mono text-xs text-brand-muted hover:text-brand-orange flex items-center gap-1 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>
          <span className="section-tag">Edit Listing</span>
          <h1 className="font-display font-black text-4xl text-brand-light">EDIT PRODUCT</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg text-brand-light mb-4">
              🖼️ Product Images
              <span className="text-brand-muted font-body font-normal text-sm ml-2">(up to 4)</span>
            </h2>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="font-mono text-xs text-brand-muted uppercase tracking-wider mb-2">Current Images</p>
                <div className="flex gap-2 flex-wrap">
                  {existingImages.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-brand-border group">
                      <Image src={src} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add more images */}
            {totalImages < 4 && (
              <label className="block cursor-pointer">
                <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
                {newImagePreviews.length > 0 ? (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {newImagePreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-orange-500/40">
                        <Image src={src} alt="" fill className="object-cover" />
                        <span className="absolute top-0.5 right-0.5 bg-orange-500 text-white text-[8px] px-1 rounded">NEW</span>
                      </div>
                    ))}
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-brand-border flex items-center justify-center text-brand-muted hover:border-brand-orange/50 transition-colors">
                      <span className="text-xl">+</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 border-2 border-dashed border-brand-border hover:border-brand-orange/50 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors mt-2">
                    <svg className="w-6 h-6 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span className="font-mono text-xs text-brand-muted">Add more photos</span>
                  </div>
                )}
              </label>
            )}

            {totalImages === 0 && (
              <p className="font-mono text-xs text-brand-muted mt-2">No images — product will show a placeholder icon.</p>
            )}
          </div>

          {/* Product details */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-brand-light">📦 Product Details</h2>
            <div>
              <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Product Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
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
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="bearing, deep groove" />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-brand-light">💰 Pricing & Stock</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Price (₹) *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field">
                  {["piece", "set", "kg", "meter", "liter", "pair", "box", "roll"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Stock Qty</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/shop" className="btn-secondary flex-1 py-3.5 text-center">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2">
              {uploading ? "Uploading images…" : submitting ? "Saving…" : "Save Changes →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}