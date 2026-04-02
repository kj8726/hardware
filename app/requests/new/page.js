"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["Fasteners", "Hydraulic", "Bearings", "Tools", "Pipes & Fittings", "Electrical", "Mechanical", "Other"];

export default function NewRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ title: "", description: "", quantity: "1", size: "", brand: "", category: "Other", location: "", city: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return null;
  if (!session) {
    router.push("/login?callbackUrl=/requests/new");
    return null;
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    let imageUrl = "";
    let imagePublicId = "";

    if (imageFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("folder", "hardwarehub/requests");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      setUploading(false);

      if (!uploadRes.ok) {
        setError(uploadData.error || "Image upload failed");
        setSubmitting(false);
        return;
      }
      imageUrl = uploadData.url;
      imagePublicId = uploadData.publicId;
    }

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image: imageUrl, imagePublicId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setSubmitting(false);
      return;
    }

    router.push(`/requests/${data._id}`);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="mb-8">
          <Link href="/requests" className="font-mono text-xs text-brand-muted hover:text-brand-orange flex items-center gap-1 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 19l-7-7 7-7"/></svg>
            Back to Requests
          </Link>
          <span className="section-tag">New Request</span>
          <h1 className="font-display font-black text-4xl text-brand-light">POST A PART REQUEST</h1>
          <p className="text-brand-muted text-sm mt-1">Upload a photo and describe what you need — shop owners will respond.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg text-brand-light mb-4">📸 Part Photo <span className="text-brand-muted font-body font-normal text-sm">(Optional but recommended)</span></h2>

            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <div className="relative h-56 rounded-xl overflow-hidden border border-brand-orange/30">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="font-display font-bold text-white">Change Photo</span>
                  </div>
                </div>
              ) : (
                <div className="h-44 border-2 border-dashed border-brand-border hover:border-brand-orange/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                  </div>
                  <span className="font-display font-bold text-brand-light">Click to upload photo</span>
                  <span className="font-mono text-xs text-brand-muted">JPEG, PNG, WebP · Max 5MB</span>
                </div>
              )}
            </label>
          </div>

          {/* Details */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-5">
            <h2 className="font-display font-bold text-lg text-brand-light mb-1">📋 Part Details</h2>

            <div>
              <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Part Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field" placeholder="e.g., Hydraulic Hose 1 inch, Deep Groove Ball Bearing…" />
            </div>

            <div>
              <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field resize-none" placeholder="Describe the part. Include any specs, condition, where it's from, etc." />
            </div>

            <div>
              <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Quantity</label>
                <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="input-field" placeholder="1" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Size/Spec</label>
                <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className="input-field" placeholder="e.g., 1 inch, M12…" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Brand</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="input-field" placeholder="Optional" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-brand-light mb-1">📍 Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">City *</label>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-field" placeholder="Mumbai, Pune, Delhi…" />
              </div>
              <div>
                <label className="block font-mono text-xs text-brand-muted uppercase tracking-wider mb-1.5">Full Location *</label>
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input-field" placeholder="Area, locality…" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
            {uploading ? "Uploading image…" : submitting ? "Posting request…" : (
              <><span className="text-xl leading-none">+</span> Post Request</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
