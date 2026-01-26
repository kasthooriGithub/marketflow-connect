import { Navbar } from 'components/layout/Navbar';
import Hero from 'components/landing/Hero';
import CategoryGrid from 'components/landing/CategoryGrid';
import FeaturedServices from 'components/landing/FeaturedServices';
import HowItWorks from 'components/landing/HowItWorks';
import Pricing from 'components/landing/PricingSection';
import Testimonials from 'components/landing/Testimonials';
import CTA from 'components/landing/CTA';
import Footer from 'components/layout/MarketingFooter';

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
