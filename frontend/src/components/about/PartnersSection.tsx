// components/about/PartnersSection.tsx
import { ExternalLink } from 'lucide-react';

interface AboutReadMorePayload {
  title: string;
  description: string;
  details?: string[];
}

interface PartnersSectionProps {
  onReadMore?: (payload: AboutReadMorePayload) => void;
}

const partners = [
  {
    name: 'REMA',
    logo: 'https://www.rema.gov.rw/fileadmin/user_upload/REMA/Icons_logos/Rema_logo.png',
    description: 'The Rwanda Environment Management Authority supports environmental protection, sustainability policies, and regulatory guidance for circular economy and waste management initiatives in Rwanda.',
    type: 'Government Partner'
  },
  {
    name: 'GGGI',
    logo: 'https://unepccc.org/wp-content/uploads/2022/11/gggi-logo-new-horizontal-green.png',
    description: 'The Global Green Growth Institute provides technical expertise, research support, and sustainable development strategies to promote green growth and climate-resilient business solutions.',
    type: 'Technical Partner'
  },
  {
    name: 'COPED',
    logo: 'https://framerusercontent.com/images/fvp6YoZKV9EMN8O0lVotx3A8LZ4.png?width=2142&height=1181',
    description: 'COPED delivers professional waste collection, recycling, and environmental services, helping businesses manage waste efficiently and supporting reverse logistics operations.',
    type: 'Industry Partner'
  },
  {
    name: 'ALU',
    logo: 'https://start.alueducation.com/resource/1568810909000/AluLogoForAdmissions',
    description: 'African Leadership University contributes research, innovation, and student-driven solutions that support digital transformation and sustainable business development.',
    type: 'Academic Partner'
  },
  {
    name: 'Bank of Kigali',
    logo: 'https://images.africanfinancials.com/rw-bok-logo-min.png',
    description: 'Bank of Kigali provides financial services, digital payment solutions, and potential green financing opportunities to support businesses participating in the circular economy marketplace.',
    type: 'Banking Partner'
  },
  {
    name: 'Rwanda Green Fund',
    logo: 'https://yt3.googleusercontent.com/GVE26Yxa8D3VOwC32oaFzvR4UThTrFMn5r9uMLBm5_zoblUxvGVG7klviGBnmHfOslH-I3GDkwE=s900-c-k-c0x00ffffff-no-rj',
    description: 'The Rwanda Green Fund (FONERWA) supports climate-friendly projects by providing funding and investment opportunities for innovative environmental and sustainability initiatives.',
    type: 'Funding Partner'
  }
];

const PartnersSection = ({ onReadMore }: PartnersSectionProps) => {
  const handlePartnerReadMore = (partner: (typeof partners)[number]) => {
    onReadMore?.({
      title: partner.name,
      description: partner.description,
      details: [`Partner type: ${partner.type}`]
    });
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            Our Network
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
            Trusted <span className="text-cyan-600">Partners</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Collaborating with leading organizations to drive circular economy in Rwanda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-cyan-200 dark:border-cyan-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-24 h-16 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center p-2">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <span className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-2 py-1 rounded-full">
                  {partner.type}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{partner.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{partner.description}</p>
              
              <button
                type="button"
                onClick={() => handlePartnerReadMore(partner)}
                className="inline-flex items-center text-cyan-600 text-sm font-semibold hover:text-cyan-700 dark:text-cyan-400 group"
              >
                Learn more
                <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Become a Partner CTA */}
        <div className="mt-16 text-center">
          <div className="bg-cyan-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Interested in Partnering?</h3>
            <p className="text-cyan-100 mb-6 max-w-2xl mx-auto">
              Join our network of organizations committed to building a circular economy in Rwanda
            </p>
            <button
              type="button"
              onClick={() =>
                onReadMore?.({
                  title: 'Partner with EcoTrade',
                  description:
                    'Join our network to expand circular economy impact across Rwanda.',
                  details: ['Access verified recycler networks.', 'Co-design pilot programs.', 'Share impact metrics.']
                })
              }
              className="bg-white dark:bg-gray-900 text-cyan-600 px-8 py-3 rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Become a Partner
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;