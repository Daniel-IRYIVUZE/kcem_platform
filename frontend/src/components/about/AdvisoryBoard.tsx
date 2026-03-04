// components/about/AdvisoryBoard.tsx
import { Award, Building2, Leaf, Globe } from 'lucide-react';

interface AboutReadMorePayload {
  title: string;
  description: string;
  details?: string[];
}

interface AdvisoryBoardProps {
  onReadMore?: (payload: AboutReadMorePayload) => void;
}

const advisors = [
  {
    name: 'Dr. Jeanne d\'Arc Uwera',
    role: 'Environmental Policy Advisor',
    organization: 'REMA',
    expertise: 'Waste management policy and regulation',
    icon: Building2,
    color: 'bg-blue-600'
  },
  {
    name: 'Fidele Nkurunziza',
    role: 'Circular Economy Specialist',
    organization: 'GGGI',
    expertise: 'Sustainable waste systems and green growth',
    icon: Leaf,
    color: 'bg-cyan-600'
  },
  {
    name: 'Ineza Mukamurenzi',
    role: 'Hospitality Industry Expert',
    organization: 'Rwanda Hotels Association',
    expertise: 'HORECA operations and sustainability',
    icon: Award,
    color: 'bg-purple-600'
  },
  {
    name: 'Dr. Jean Bosco Harelimana',
    role: 'Technology Advisor',
    organization: 'ALU',
    expertise: 'Software architecture and innovation',
    icon: Globe,
    color: 'bg-yellow-700'
  }
];

const AdvisoryBoard = ({ onReadMore }: AdvisoryBoardProps) => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            Guidance & Expertise
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
            Advisory <span className="text-cyan-600">Board</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Industry experts guiding our mission and strategy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advisors.map((advisor, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-xl ${advisor.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <advisor.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{advisor.name}</h3>
              <p className="text-sm text-cyan-600 font-medium mb-2">{advisor.role}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{advisor.organization}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{advisor.expertise}</p>

              <button
                type="button"
                onClick={() =>
                  onReadMore?.({
                    title: advisor.name,
                    description: advisor.role,
                    details: [advisor.organization, advisor.expertise]
                  })
                }
                className="mt-4 inline-flex items-center text-cyan-600 text-sm font-semibold hover:text-cyan-700 dark:text-cyan-400"
              >
                View profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvisoryBoard;