// pages/HomePage.tsx
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import HeroSection from '../../components/home/HeroSection';
import HowItWorks from '../../components/home/HowItWorks';
import KeyFeatures from '../../components/home/KeyFeatures';
// import LiveImpactTicker from '../../components/home/LiveImpactTicker';
// import InteractiveMap from '../../components/home/InteractiveMap';
// import SuccessStories from '../../components/home/SuccessStories';
// import StatsCounter from '../../components/home/StatsCounter';
// import MarketplacePreview from '../../components/home/MarketplacePreview';
import CTASection from '../../components/home/CTASection';
import NewsletterSection from '../../components/home/NewsletterSection';
// import PartnersCarousel from '../../components/home/PartnersCarousel';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        {/* <StatsCounter /> */}
        <HowItWorks />
        <KeyFeatures />
        {/* <LiveImpactTicker /> */}
        {/* <InteractiveMap /> */}
        {/* <SuccessStories /> */}
        {/* <MarketplacePreview /> */}
        {/* <PartnersCarousel /> */}
        <CTASection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;