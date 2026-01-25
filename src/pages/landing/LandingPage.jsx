import { Navbar } from 'components/layout/Navbar';
import Hero from './Hero';
import CategoryGrid from './CategoryGrid';
import FeaturedServices from './FeaturedServices';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import CTA from './CTA';
import Footer from './Footer';

const LandingPage = () => {
    return (
        <div className="min-vh-100 d-flex flex-column bg-white" style={{ margin: 0, padding: 0 }}>
            <Navbar />
            <main className="flex-grow-1">
                <Hero />
                <CategoryGrid />
                <FeaturedServices />
                <HowItWorks />
                <Testimonials />
                <Pricing />
                <CTA />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
