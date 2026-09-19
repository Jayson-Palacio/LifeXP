import { Outfit } from "next/font/google";

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

export const viewport = {
  themeColor: "#1E1B4B",
};

export const metadata = {
  title: "Kaeluma — Turn Real Life Into a Game",
  description: "Kaeluma is a family of apps that help households live their best lives — Quests for chores, Vital for nutrition and fitness.",
  applicationName: "Kaeluma",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  appleWebApp: {
    capable: true,
    title: "Kaeluma",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Kaeluma — Turn Real Life Into a Game",
    description: "Kaeluma is a family of apps that help households live their best lives — Quests for chores, Vital for nutrition and fitness.",
    siteName: "Kaeluma",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaeluma — Turn Real Life Into a Game",
    description: "Kaeluma is a family of apps that help households live their best lives — Quests for chores, Vital for nutrition and fitness.",
  },
};

export default function RootLayout({ children }) {
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kaeluma",
    "operatingSystem": "All (Web-Based)",
    "applicationCategory": "ParentingApplication, GameApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Jayson Palacio"
    },
    "description": "Kaeluma is a family of free apps that help households live their best lives — Quests for chores and Vital for nutrition and fitness.",
    "featureList": [
      "Family app hub after login",
      "RPG Quest Dashboard for chores",
      "Experience Points (XP) and Level Up themes",
      "Parent PIN Verification System",
      "Custom Reward Loot Shop",
      "Vital nutrition, calorie, and weight-loss tracking",
      "Stripe Value-for-Value Donations"
    ]
  };

  return (
    <html lang="en" className={outfit.variable}>
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
