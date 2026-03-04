// components/about/MissionSection.tsx
import { Target, Eye, Heart, Leaf } from 'lucide-react';

interface AboutReadMorePayload {
  title: string;
  description: string;
  details?: string[];
}

interface MissionSectionProps {
  onReadMore?: (payload: AboutReadMorePayload) => void;
}

const MissionSection = ({ onReadMore }: MissionSectionProps) => {
  const handleReadMore = () => {
    onReadMore?.({
      title: 'Our Mission and Vision',
      description:
        'EcoTrade exists to turn waste into value by connecting HORECA businesses with certified recyclers and reliable logistics.',
      details: [
        'Digitize reverse logistics across Kigali and expand regionally.',
        'Enable transparent pricing and measurable impact reporting.',
        'Empower communities with sustainable economic opportunities.'
      ]
    });
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            Our Purpose
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
            Driving Circular Economy in <span className="text-cyan-600">Rwanda</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We're on a mission to transform Kigali's waste management from a linear "take-make-dispose" 
            model to a circular "waste-to-value" economy that benefits businesses, communities, and the planet.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Mission Card */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To digitize and optimize reverse logistics in Kigali's HORECA sector, 
              making recycling economically viable while reducing landfill waste by 50% by 2030.
            </p>
          </div>

          {/* Vision Card */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              A future where no commercial waste goes to landfill—creating a regenerative 
              economy that serves as a blueprint for cities across Africa.
            </p>
          </div>

          {/* Values Card */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Sustainability, transparency, innovation, and community empowerment guide 
              everything we do at EcoTrade.
            </p>
          </div>
        </div>

        {/* Impact Quote */}
        <div className="mt-16 bg-cyan-600 rounded-2xl p-8 text-white">
          <div className="flex items-start space-x-4">
            <Leaf className="w-12 h-12 flex-shrink-0 opacity-80" />
            <div>
              <p className="text-xl text-cyan-300 italic font-light">
                "We believe that waste is simply a resource in the wrong place. By creating 
                transparent markets for recyclables, we're not just managing waste, we're 
                building a new economy."
              </p>
              <p className="mt-4 text-cyan-100 font-semibold"># Daniel IRYIVUZE, Founder</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleReadMore}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
          >
            Read our full story
          </button>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;