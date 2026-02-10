import { Navbar } from 'components/layout/Navbar';
import Hero from 'components/landing/Hero';
import StatsSection from 'components/landing/StatsSection';
import CategoryGrid from 'components/landing/CategoryGrid';
import FeaturedServices from 'components/landing/FeaturedServices';
import HowItWorks from './HowItWorks';
import Pricing from 'components/landing/PricingSection';
import ReviewsSection from 'components/landing/ReviewsSection';
import CTA from 'components/landing/CTA';
import Footer from 'components/layout/MarketingFooter';

const LandingPage = () => {
    return (
        <div className="min-vh-100 d-flex flex-column bg-white" style={{ margin: 0, padding: 0 }}>
            <Navbar />
            <main className="flex-grow-1">
                <Hero />
                <div className="bg-white py-4 border-bottom">
                    <StatsSection />
                </div>
                <CategoryGrid />
                <FeaturedServices />
                <HowItWorks />
                <ReviewsSection />
                <Pricing />
                <CTA />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
