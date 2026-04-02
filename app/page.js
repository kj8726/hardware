import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/mongodb";
import Request from "@/models/Request";
import Shop from "@/models/Shop";
import Product from "@/models/Product";

const CATEGORIES = [
  { name: "Fasteners", icon: "🔩", desc: "Nuts, bolts, screws" },
  { name: "Hydraulic", icon: "🔧", desc: "Hoses, pumps, fittings" },
  { name: "Bearings", icon: "⚙️", desc: "Ball & roller bearings" },
  { name: "Tools", icon: "🛠️", desc: "Hand & power tools" },
  { name: "Pipes & Fittings", icon: "🔌", desc: "Industrial pipes" },
  { name: "Electrical", icon: "⚡", desc: "Wiring, switches" },
  { name: "Mechanical", icon: "🏗️", desc: "Gears, pulleys, shafts" },
  { name: "Other", icon: "📦", desc: "All other hardware" },
];

async function getHomeData() {
  try {
    await connectDB();
    const [requests, shops, productCount] = await Promise.all([
      Request.find({ status: "open" }).populate("user", "name avatar").sort({ createdAt: -1 }).limit(6).lean(),
      Shop.find({ isApproved: true }).sort({ rating: -1 }).limit(4).lean(),
      Product.countDocuments({ isActive: true }),
    ]);
    return { requests, shops, productCount };
  } catch {
    return { requests: [], shops: [], productCount: 0 };
  }
}

export default async function HomePage() {
  const { requests, shops, productCount } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-orange-glow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-up">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="font-mono text-xs text-orange-400 uppercase tracking-widest">India's Hardware Marketplace</span>
          </div>

          <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-8xl text-brand-light leading-none tracking-tight mb-6 animate-fade-up stagger-1">
            FIND ANY
            <br />
            <span className="text-brand-orange">HARDWARE</span>
            <br />
            PART — FAST
          </h1>

          <p className="font-body text-lg text-brand-muted max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
            Don't know the part name? Upload a photo. Local hardware shops will
            respond with price and availability — usually within hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-3">
            <Link href="/requests/new" className="btn-primary text-base py-3.5 px-8 flex items-center gap-2 animate-pulse-orange">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
              Post a Part Request
            </Link>
            <Link href="/marketplace" className="btn-secondary text-base py-3.5 px-8 flex items-center gap-2">
              Browse Marketplace
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 animate-fade-up stagger-4">
            {[
              { value: requests.length + "+" , label: "Open Requests" },
              { value: shops.length + "+", label: "Verified Shops" },
              { value: productCount + "+", label: "Products Listed" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display font-black text-3xl text-brand-orange">{s.value}</div>
                <div className="font-mono text-xs text-brand-muted uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-tag">How It Works</span>
            <h2 className="font-display font-black text-4xl text-brand-light">3 SIMPLE STEPS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: "📸", title: "Upload Photo", desc: "Take a photo of the part you need. Add a description, size, and location." },
              { step: "02", icon: "💬", title: "Get Responses", desc: "Local shop owners send you offers with price and delivery time." },
              { step: "03", icon: "✅", title: "Choose Best Offer", desc: "Compare prices, read shop reviews, and contact the best seller." },
            ].map((item) => (
              <div key={item.step} className="relative bg-brand-card border border-brand-border rounded-xl p-6 card-hover">
                <div className="absolute -top-3 -left-3 font-mono text-xs text-orange-500/50 font-bold">{item.step}</div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-display font-bold text-xl text-brand-light mb-2">{item.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 border-t border-brand-border bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="section-tag">Browse by Category</span>
              <h2 className="font-display font-black text-4xl text-brand-light">HARDWARE CATEGORIES</h2>
            </div>
            <Link href="/marketplace" className="btn-secondary text-sm hidden md:flex items-center gap-2">
              View All <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/marketplace?category=${cat.name}`}
                className="flex flex-col items-center gap-2 p-4 bg-brand-card border border-brand-border rounded-xl card-hover text-center group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-display font-semibold text-xs text-brand-light uppercase tracking-wide">{cat.name}</span>
                <span className="font-mono text-[10px] text-brand-muted hidden sm:block">{cat.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Requests */}
      {requests.length > 0 && (
        <section className="py-20 border-t border-brand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="section-tag">Live Board</span>
                <h2 className="font-display font-black text-4xl text-brand-light">LATEST REQUESTS</h2>
              </div>
              <Link href="/requests" className="btn-secondary text-sm hidden md:flex items-center gap-2">
                All Requests <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((req) => (
                <Link key={req._id} href={`/requests/${req._id}`} className="bg-brand-card border border-brand-border rounded-xl overflow-hidden card-hover group">
                  {req.image && (
                    <div className="relative h-40 overflow-hidden">
                      <Image src={req.image} alt={req.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-card/80 to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-brand-light text-lg leading-tight">{req.title}</h3>
                      <span className="badge-orange shrink-0">{req.category}</span>
                    </div>
                    <p className="text-brand-muted text-sm line-clamp-2 mb-3">{req.description}</p>
                    <div className="flex items-center justify-between text-xs text-brand-muted font-mono">
                      <span>📍 {req.city}</span>
                      <span>{req.responseCount} responses</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Shops */}
      {shops.length > 0 && (
        <section className="py-20 border-t border-brand-border bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="section-tag">Trusted Sellers</span>
              <h2 className="font-display font-black text-4xl text-brand-light">TOP RATED SHOPS</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {shops.map((shop) => (
                <div key={shop._id} className="bg-brand-card border border-brand-border rounded-xl p-5 card-hover">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-display font-black text-orange-400 text-lg">
                      {shop.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-brand-light">{shop.name}</h3>
                      <p className="font-mono text-xs text-brand-muted">📍 {shop.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={s <= Math.round(shop.rating) ? "star" : "star-empty"}>★</span>
                    ))}
                    <span className="font-mono text-xs text-brand-muted ml-1">({shop.totalReviews})</span>
                  </div>
                  {shop.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {shop.categories.slice(0, 2).map((c) => (
                        <span key={c} className="badge-steel text-[10px]">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 border-t border-brand-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display font-black text-5xl text-brand-light mb-4">
            OWN A HARDWARE SHOP?
          </h2>
          <p className="text-brand-muted text-lg mb-8">
            Join HardwareHub and reach thousands of customers looking for parts every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register?role=shop_owner" className="btn-primary text-base py-3.5 px-8">
              Register Your Shop →
            </Link>
            <Link href="/marketplace" className="btn-secondary text-base py-3.5 px-8">
              Explore First
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
