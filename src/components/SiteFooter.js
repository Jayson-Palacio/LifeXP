import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <BrandLogo variant="icon" size="sm" href="/" tone="ink" />
          <span>Copyright © {new Date().getFullYear()} Kaeluma. All rights reserved.</span>
        </div>
        <nav aria-label="Footer">
          <Link href="/login">Log in</Link>
          <Link href="/signup">Get started</Link>
          <a
            href="https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support Kaeluma
          </a>
        </nav>
      </div>
    </footer>
  );
}
