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

export const metadata = {
  title: "Kaeluma — Turn Real Life Into a Game",
  description: "Kaeluma — Turn your kid's daily tasks into a magical game they actually enjoy. Earn XP, level up, and redeem rewards!",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Kaeluma — Turn Real Life Into a Game",
    description: "Kaeluma — Turn your kid's daily tasks into a magical game they actually enjoy. Earn XP, level up, and redeem rewards!",
    siteName: "Kaeluma",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaeluma — Turn Real Life Into a Game",
    description: "Kaeluma — Turn your kid's daily tasks into a magical game they actually enjoy. Earn XP, level up, and redeem rewards!",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body style={{ fontFamily: 'var(--font-outfit, Outfit, system-ui, sans-serif)' }}>
        <NavProgress />
        <IdleProvider>
          {children}
        </IdleProvider>
      </body>
    </html>
  );
}
