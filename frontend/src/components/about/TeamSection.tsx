// components/about/TeamSection.tsx
import { Linkedin, Mail, Twitter } from 'lucide-react';

interface AboutReadMorePayload {
  title: string;
  description: string;
  details?: string[];
}

interface TeamSectionProps {
  onReadMore?: (payload: AboutReadMorePayload) => void;
}

const team = [
  {
    name: 'Daniel IRYIVUZE',
    role: 'Founder & Lead Developer',
    bio: 'Software Engineering student at ALU with passion for circular economy and sustainable technology.',
    image: '/images/default-avatar.svg',
    linkedin: '#',
    twitter: '#',
    email: 'daniel@ecotrade.rw'
  },
  {
    name: 'Neza David Tuyishimire',
    role: 'Project Supervisor',
    bio: 'Expert in software development and circular economy initiatives across East Africa.',
    image: '/images/default-avatar.svg',
    linkedin: '#',
    twitter: '#',
    email: 'david.neza@ecotrade.rw'
  },
  {
    name: 'Marie Claire Uwase',
    role: 'Operations Lead',
    bio: 'Former sustainability manager at Marriott with deep HORECA sector expertise.',
    image: '/images/default-avatar.svg',
    linkedin: '#',
    twitter: '#',
    email: 'marie@ecotrade.rw'
  },
  {
    name: 'Jean Paul Habimana',
    role: 'Logistics Coordinator',
    bio: 'Supply chain expert focused on optimizing collection routes and driver management.',
    image: '/images/default-avatar.svg',
    linkedin: '#',
    twitter: '#',
    email: 'jp@ecotrade.rw'
  }
];

const TeamSection = ({ onReadMore }: TeamSectionProps) => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            Meet the Team
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
            Passionate People Driving <span className="text-cyan-600">Change</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A dedicated team committed to transforming waste management in Rwanda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-sm text-cyan-600 font-medium mb-3">{member.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{member.bio}</p>

                {/* Social Links */}
                <div className="flex space-x-3">
                  <a
                    href={member.linkedin}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={member.twitter}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onReadMore?.({
                      title: member.name,
                      description: member.role,
                      details: [member.bio, `Email: ${member.email}`]
                    })
                  }
                  className="mt-4 inline-flex items-center text-cyan-600 text-sm font-semibold hover:text-cyan-700 dark:text-cyan-400"
                >
                  Read bio
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;