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
  title: "LifeXP — Turn Real Life Into a Game",
  description: "LifeXP — Turn your kid's daily tasks into a game they actually enjoy. Earn XP, level up, and redeem rewards!",
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
