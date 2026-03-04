// components/home/PartnersCarousel.tsx
import { useRef } from 'react';

const partners = [
  { name: 'REMA', initials: 'REMA', color: 'bg-cyan-600' },
  { name: 'GGGI', initials: 'GGGI', color: 'bg-cyan-600' },
  { name: 'COPED', initials: 'COPED', color: 'bg-blue-600' },
  { name: 'ALU', initials: 'ALU', color: 'bg-purple-600' },
  { name: 'Bank of Kigali', initials: 'BK', color: 'bg-amber-500' },
  { name: 'Rwanda Green Fund', initials: 'FONERWA', color: 'bg-green-600' },
];

const PartnersCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-16 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wider">
            Trusted by
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leading Organizations in Rwanda's Circular Economy
          </h3>
        </div>

        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10"></div>

          {/* Scrollable Carousel */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex space-x-12 px-8 min-w-max">
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center h-20 w-40 opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer"
                >
                  <div className={`h-16 w-36 rounded-xl ${partner.color} flex items-center justify-center shadow-md hover:shadow-lg transition-shadow`}>
                    <span className="text-white font-bold text-sm tracking-wider">{partner.initials}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;