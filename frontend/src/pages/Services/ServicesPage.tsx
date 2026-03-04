// pages/ServicesPage.tsx
import { useState } from 'react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import ServicesHero from '../../components/services/ServicesHero';
import ServiceTabs from '../../components/services/ServiceTabs';
import HotelServices from '../../components/services/HotelServices';
import RecyclerServices from '../../components/services/RecyclerServices';
import DriverServices from '../../components/services/DriverServices';
import PricingCalculator from '../../components/services/PricingCalculator';
import ServiceComparison from '../../components/services/ServiceComparison';
import FAQSection from '../../components/services/FAQSection';
import TestimonialsSection from '../../components/services/TestimonialsSection';
import CTASection from '../../components/services/CTASection';

const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState<'hotels' | 'recyclers' | 'drivers'>('hotels');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <main>
        <ServicesHero />
        
        {/* Service Tabs */}
        <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
          <ServiceTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Service Content based on active tab */}
        <div className="py-16">
          {activeTab === 'hotels' && <HotelServices />}
          {activeTab === 'recyclers' && <RecyclerServices />}
          {activeTab === 'drivers' && <DriverServices />}
        </div>

        {/* Pricing Calculator */}
        <PricingCalculator />

        {/* Service Comparison Table */}
        <ServiceComparison />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;