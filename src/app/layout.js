import { Inter, Outfit } from "next/font/google";

import "../styles/variables.css";
import "../styles/base.css";
import "../styles/components.css";
import "../styles/animations.css";
import "../styles/pages.css";
import IdleProvider from "../components/IdleProvider";
import NavProgress from "../components/NavProgress";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const viewport = {
  themeColor: "#eceff3",
  viewportFit: "cover",
};

export const metadata = {
  title: "Kaeluma — Software for the whole family",
  description: "Kaeluma is a growing set of apps for the household: Quests for routines, Vital for health, one login for everyone. Free and ad-free.",
  applicationName: "Kaeluma",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  appleWebApp: {
    capable: true,
    title: "Kaeluma",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Kaeluma — Software for the whole family",
    description: "Kaeluma is a growing set of apps for the household: Quests for routines, Vital for health, one login for everyone. Free and ad-free.",
    siteName: "Kaeluma",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaeluma — Software for the whole family",
    description: "Kaeluma is a growing set of apps for the household: Quests for routines, Vital for health, one login for everyone. Free and ad-free.",
  },
};

export default function RootLayout({ children }) {
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kaeluma",
    "operatingSystem": "All (Web-Based)",
    "applicationCategory": "LifestyleApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Jayson Palacio"
    },
    "description": "Kaeluma is a family of free apps for the household — Quests for routines and Vital for household health.",
    "featureList": [
      "Family app hub after login",
      "Quests for household routines",
      "Parent PIN Verification System",
      "Vital household health: meals, weight, and plans for every person",
      "Voluntary donations, no subscriptions"
    ]
  };

  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body style={{ fontFamily: 'var(--font-outfit, Outfit, system-ui, sans-serif)' }}>
        <NavProgress />
        <IdleProvider>
          {children}
        </IdleProvider>
      </body>
    </html>
  );
}
