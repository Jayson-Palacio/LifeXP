import BrandLogo from './BrandLogo';

export default function SiteAuth({ title, subtitle, children, footer }) {
  return (
    <div className="site site-auth">
      <div className="site-auth-inner">
        <BrandLogo href="/" size="md" tone="ink" />
        <h1>{title}</h1>
        {subtitle ? <p className="site-auth-sub">{subtitle}</p> : null}
        {children}
        {footer ? <div className="site-auth-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
