// components/about/TimelineSection.tsx
import { Calendar, CheckCircle, Rocket, Target, Users, Award } from 'lucide-react';

interface AboutReadMorePayload {
  title: string;
  description: string;
  details?: string[];
}

interface TimelineSectionProps {
  onReadMore?: (payload: AboutReadMorePayload) => void;
}

const milestones = [
  {
    date: 'Q1 January 2026',
    title: 'Research & Design',
    description: 'Stakeholder interviews, system architecture, UI/UX design',
    icon: Target,
    status: 'completed'
  },
  {
    date: 'Q1 February 2026',
    title: 'MVP Development',
    description: 'Database setup, API development, mobile and web dashboards',
    icon: Rocket,
    status: 'in-progress'
  },
  {
    date: 'Q2 April 2026',
    title: 'Pilot Launch',
    description: '15 hotels in Nyarugenge and Gasabo districts',
    icon: Users,
    status: 'upcoming'
  },
  {
    date: 'Q3 June 2026',
    title: 'Public Release',
    description: 'Full launch across Kigali',
    icon: CheckCircle,
    status: 'upcoming'
  },
  {
    date: 'Q4 December 2026',
    title: 'Regional Expansion',
    description: 'Scale to other Rwandan cities and East Africa',
    icon: Award,
    status: 'upcoming'
  }
];

const TimelineSection = ({ onReadMore }: TimelineSectionProps) => {
  const handleReadMore = () => {
    onReadMore?.({
      title: 'EcoTrade Roadmap',
      description:
        'Our timeline details the milestones required to scale circular economy infrastructure across Rwanda.',
      details: milestones.map((milestone) => `${milestone.date}: ${milestone.title} - ${milestone.description}`)
    });
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            Our Journey
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
            Project <span className="text-cyan-600">Timeline</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            From concept to reality: our roadmap for transforming waste management
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 lg:left-1/2 transform lg:-translate-x-1/2 h-full w-0.5 bg-cyan-300 dark:bg-cyan-700"></div>

          {/* Timeline Items */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`relative flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-start lg:items-center`}
              >
                {/* Date Badge */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:pl-12'}`}>
                  <div className="inline-flex items-center bg-white dark:bg-gray-900 rounded-full px-4 py-2 shadow-md">
                    <Calendar className="w-4 h-4 text-cyan-600 mr-2" />
                    <span className="font-semibold text-gray-900 dark:text-white">{milestone.date}</span>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="absolute left-8 lg:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-900 rounded-full border-4 border-cyan-600 flex items-center justify-center z-10">
                  <div className={`w-3 h-3 rounded-full ${
                    milestone.status === 'completed' ? 'bg-cyan-600' :
                    milestone.status === 'in-progress' ? 'bg-yellow-700 animate-pulse' :
                    'bg-gray-300'
                  }`}></div>
                </div>

                {/* Content Card */}
                <div className={`lg:w-1/2 mt-4 lg:mt-0 ${
                  index % 2 === 0 ? 'lg:pl-12' : 'lg:pr-12'
                }`}>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow ml-16 lg:ml-0">
                    <div className="flex items-center mb-3">
                      <milestone.icon className={`w-5 h-5 mr-2 ${
                        milestone.status === 'completed' ? 'text-cyan-600' :
                        milestone.status === 'in-progress' ? 'text-yellow-700 dark:text-yellow-700' :
                        'text-gray-400 dark:text-gray-500'
                      }`} />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{milestone.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                    
                    {/* Status Badge */}
                    <div className="mt-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        milestone.status === 'completed' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' :
                        milestone.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {milestone.status === 'completed' ? '✓ Completed' :
                         milestone.status === 'in-progress' ? '⟳ In Progress' :
                         '○ Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-16 bg-cyan-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Currently in Pilot Phase</h3>
          <p className="text-cyan-100 mb-4">Testing with 15 hotels across Nyarugenge and Gasabo</p>
          <div className="inline-flex items-center bg-white text-cyan-600 dark:text-cyan-400 bg-gray-800/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            <span>Join our waitlist for public launch</span>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleReadMore}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white dark:bg-gray-900 text-cyan-700 dark:text-cyan-400 font-semibold hover:bg-cyan-50 dark:bg-cyan-900/20 transition-colors"
            >
              View roadmap details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;