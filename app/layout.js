import "./globals.css";
import Providers from "../components/Providers";
import Navbar from "../components/Navbar";

const baseUrl = process.env.NEXTAUTH_URL || "https://hardwarehub.vercel.app";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "HardwareHub — Find Any Hardware Part in India",
    template: "%s | HardwareHub",
  },
  description:
    "India's hardware marketplace. Upload a photo of any part — nuts, bolts, bearings, hydraulic hoses — and get price quotes from local hardware shops instantly.",
  keywords: [
    "hardware parts india",
    "industrial hardware",
    "nuts bolts bearings",
    "hydraulic hose",
    "hardware shop near me",
    "buy hardware parts online",
    "spare parts marketplace india",
  ],
  authors: [{ name: "HardwareHub" }],
  creator: "HardwareHub",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "HardwareHub",
    title: "HardwareHub — Find Any Hardware Part in India",
    description:
      "Upload a photo of the part you need. Local hardware shops respond with price and availability.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HardwareHub — India's Hardware Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HardwareHub — Find Any Hardware Part",
    description: "Upload a photo of the part you need. Get quotes from local shops.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "-fnnFQwtI-Wh2AIiwWC-dweNTMlNZGIlTPtbcm_7RCg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Karla:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-brand-black text-brand-light font-body antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
