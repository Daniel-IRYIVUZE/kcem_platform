import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import HeroSection from '../../components/home/HeroSection';
import StatsSection from '../../components/home/StatsSection';
import HowItWorksSection from '../../components/home/HowItWorksSection';
import FeaturedMaterialsSection from '../../components/home/FeaturedMaterialsSection';
import SuccessStoriesSection from '../../components/home/SuccessStoriesSection';
import CTASection from '../../components/home/CTASection';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturedMaterialsSection />
        <SuccessStoriesSection />
        <CTASection />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;