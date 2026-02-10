import { Navbar } from './Navbar';
import { Footer } from './Footer';
import MarketingFooter from './MarketingFooter';

export function Layout({
  children,
  showFooter = true,
  showNavbar = true,
  footerVariant = 'marketing', // 'marketing' (white) or 'dashboard' (dark)
}) {
  return (
    <div className="d-flex flex-column min-vh-100">
      {showNavbar && <Navbar />}

      <main
        className={`flex-grow-1 ${showNavbar ? "" : "vh-100 overflow-hidden"}`}
        style={!showNavbar ? { minHeight: 0 } : undefined}
      >
        {children}
      </main>

      {showFooter && (
        footerVariant === 'dashboard' ? <Footer /> : <MarketingFooter />
      )}
    </div>
  );
}
