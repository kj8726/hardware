export default function robots() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://hardwarehub.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/marketplace", "/requests", "/products"],
        disallow: ["/dashboard", "/api", "/onboarding"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
