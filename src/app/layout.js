import { Outfit } from "next/font/google";

import "../styles/variables.css";
import "../styles/base.css";
import "../styles/components.css";
import "../styles/animations.css";
import "../styles/pages.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Kaeluma — Turn Real Life Into a Game",
  description: "Kaeluma — Turn your kid's daily tasks into a magical game they actually enjoy. Earn XP, level up, and redeem rewards!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body style={{ fontFamily: 'var(--font-outfit, Outfit, system-ui, sans-serif)' }}>
        {children}
      </body>
    </html>
  );
}
