import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import AboutHeroSection from '../../components/about/AboutHeroSection';
import AboutMissionSection from '../../components/about/AboutMissionSection';
import AboutImpactSection from '../../components/about/AboutImpactSection';
import AboutPartnersSection from '../../components/about/AboutPartnersSection';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <AboutHeroSection />
        <AboutMissionSection />
        <AboutImpactSection />
        <AboutPartnersSection />
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;