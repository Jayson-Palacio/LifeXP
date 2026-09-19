import Link from 'next/link';
import SiteAuth from '../components/SiteAuth';

export default function NotFound() {
  return (
    <SiteAuth
      title="This page isn’t here."
      subtitle="It may have moved, or the link is out of date."
    >
      <Link href="/" className="site-btn">
        Back to Kaeluma
      </Link>
    </SiteAuth>
  );
}
