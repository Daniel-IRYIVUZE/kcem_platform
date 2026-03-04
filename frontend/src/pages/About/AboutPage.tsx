// pages/AboutPage.tsx
import { useState } from 'react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import MissionSection from '../../components/about/MissionSection';
import ProblemSolutionSection from '../../components/about/ProblemSolutionSection';
import TeamSection from '../../components/about/TeamSection';
import TimelineSection from '../../components/about/TimelineSection';
import ImpactMetrics from '../../components/about/ImpactMetrics';
import PartnersSection from '../../components/about/PartnersSection';
import AdvisoryBoard from '../../components/about/AdvisoryBoard';
import ValuesSection from '../../components/about/ValuesSection';
import Modal from '../../components/common/Modal/Modal';
import { Info } from 'lucide-react';

interface AboutModalContent {
  title: string;
  description: string;
  details?: string[];
}

const AboutPage = () => {
  const [aboutModal, setAboutModal] = useState<AboutModalContent | null>(null);

  const handleOpenModal = (content: AboutModalContent) => {
    setAboutModal(content);
  };

  const handleCloseModal = () => {
    setAboutModal(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main>
        {/* Hero Section with Video Background */}
        <section className="relative h-[60vh] min-h-[500px] bg-cyan-900 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=1600)',
              }}
            ></div>
          </div>
          <div className="relative z-20 h-full flex items-center  mt-5 justify-center text-center text-white px-4">
            <div className="max-w-4xl">
              <h1 className="text-5xl text-cyan-100 lg:text-7xl font-bold mb-6">
                Closing the Loop on
                <span className="text-cyan-300"> Commercial Waste</span>
              </h1>
              <p className="text-xl lg:text-2xl text-cyan-50 max-w-3xl mx-auto leading-relaxed">
                EcoTrade is revolutionizing waste management in Kigali by connecting hotels,
                restaurants, and cafés with recyclers through innovative technology.
              </p>
            </div>
          </div>
        </section>

        <MissionSection onReadMore={handleOpenModal} />
        <ImpactMetrics onReadMore={handleOpenModal} />
        <ProblemSolutionSection onReadMore={handleOpenModal} />
        <ValuesSection onReadMore={handleOpenModal} />
        <TimelineSection onReadMore={handleOpenModal} />
        <TeamSection onReadMore={handleOpenModal} />
        <AdvisoryBoard onReadMore={handleOpenModal} />
        <PartnersSection onReadMore={handleOpenModal} />
      </main>

      {/* Enhanced About Modal */}
      <Modal
        isOpen={Boolean(aboutModal)}
        onClose={handleCloseModal}
        title={aboutModal?.title}
        subtitle="EcoTrade Rwanda — Learn More"
        icon={<Info size={22} />}
        size="md"
        accentColor="bg-cyan-600"
      >
        {aboutModal && (
          <div className="space-y-6">
            {/* Description */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
              {aboutModal.description}
            </p>

            {/* Detail Points */}
            {aboutModal.details && aboutModal.details.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Key Highlights
                </h4>
                <ul className="space-y-3">
                  {aboutModal.details.map((detail, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg px-4 py-3"
                    >
                      <span className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 border border-cyan-100 dark:border-cyan-800/50">
              <p className="text-sm text-cyan-800 dark:text-cyan-300 font-medium">
                 Want to learn more or get involved? Visit our{' '}
                <a href="/contact" className="underline font-semibold hover:text-cyan-600 dark:hover:text-cyan-200">
                  Contact page
                </a>{' '}
                or explore our{' '}
                <a href="/services" className="underline font-semibold hover:text-cyan-600 dark:hover:text-cyan-200">
                  Services
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default AboutPage;