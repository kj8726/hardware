import connectDB from "@/lib/mongodb";
import Request from "@/models/Request";
import Product from "@/models/Product";

export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://hardwarehub.vercel.app";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/marketplace`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/requests`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    await connectDB();

    const [requests, products] = await Promise.all([
      Request.find({ status: "open" }).select("_id updatedAt").limit(100).lean(),
      Product.find({ isActive: true }).select("_id updatedAt").limit(100).lean(),
    ]);

    const requestPages = requests.map((r) => ({
      url: `${baseUrl}/requests/${r._id}`,
      lastModified: r.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    const productPages = products.map((p) => ({
      url: `${baseUrl}/products/${p._id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...requestPages, ...productPages];
  } catch {
    return staticPages;
  }
}
