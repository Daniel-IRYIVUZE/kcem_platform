// pages/HomePage.tsx
import { lazy, Suspense } from 'react';
import Navbar from '../../components/common/Navbar/Navbar';
import HeroSection from '../../components/home/HeroSection';

// Below-fold sections — lazy loaded so they don't block initial render
const HowItWorks = lazy(() => import('../../components/home/HowItWorks'));
const KeyFeatures = lazy(() => import('../../components/home/KeyFeatures'));
const CTASection = lazy(() => import('../../components/home/CTASection'));
const NewsletterSection = lazy(() => import('../../components/home/NewsletterSection'));
const Footer = lazy(() => import('../../components/common/Footer/Footer'));

const SectionFallback = () => (
  <div className="h-40 bg-white dark:bg-gray-950" aria-hidden="true" />
);

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main className="pt-16 sm:pt-[72px] md:pt-20">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <KeyFeatures />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CTASection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <NewsletterSection />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-64 bg-gray-900" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default HomePage;
