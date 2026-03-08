
const partners = [
  { name: 'REMA', logo: '/images/partners/rema-logo.png', color: 'bg-cyan-600' },
  { name: 'GGGI', logo: '/images/partners/gggi-logo.png', color: 'bg-cyan-600' },
  { name: 'COPED', logo: '/images/partners/coped-logo.png', color: 'bg-blue-600' },
  { name: 'ALU', logo: '/images/partners/alu-logo.png', color: 'bg-purple-600' },
  { name: 'Bank of Kigali', logo: '/images/partners/bk-logo.png', color: 'bg-amber-500' },
  { name: 'Rwanda Green Fund', logo: '/images/partners/fonerwa-logo.png', color: 'bg-green-600' },
];

const PartnersCarousel = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300 overflow-hidden">
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
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none"></div>

          {/* Animated Carousel */}
          <div className="overflow-hidden">
            <div className="flex animate-slide space-x-12">
              {/* First set */}
              {partners.map((partner, index) => (
                <PartnerLogo key={`first-${index}`} partner={partner} />
              ))}
              {/* Duplicate set for seamless loop */}
              {partners.map((partner, index) => (
                <PartnerLogo key={`second-${index}`} partner={partner} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PartnerLogo = ({ partner }: { partner: typeof partners[0] }) => (
  <div className="flex-shrink-0 flex items-center justify-center h-20 w-40 opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer">
    <div className={`h-16 w-36 rounded-xl ${partner.color} flex items-center justify-center shadow-md hover:shadow-lg transition-shadow overflow-hidden`}>
      {partner.logo ? (
        <img 
          src={partner.logo} 
          alt={`${partner.name} logo`}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML += `<span class="text-white font-bold text-sm tracking-wider">${partner.name.split(' ').map(n => n[0]).join('')}</span>`;
          }}
        />
      ) : (
        <span className="text-white font-bold text-sm tracking-wider">
          {partner.name.split(' ').map(n => n[0]).join('')}
        </span>
      )}
    </div>
  </div>
);

export default PartnersCarousel;