import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout({ children, showFooter = true }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
