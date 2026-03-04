// components/about/TechnologyStack.tsx
import { Database, Map, Smartphone, Globe, Zap, Shield, Code, Cloud } from 'lucide-react';

interface AboutReadMorePayload {
  title: string;
  description: string;
  details?: string[];
}

interface TechnologyStackProps {
  onReadMore?: (payload: AboutReadMorePayload) => void;
}

const technologies = [
  {
    category: 'Geospatial Engine',
    icon: Map,
    items: [
      { name: 'PostGIS', description: 'Spatial database for clustering and routing' },
      { name: 'Leaflet.js', description: 'Interactive map visualization' },
      { name: 'PostgreSQL', description: 'Relational data storage' }
    ],
    color: 'bg-cyan-600'
  },
  {
    category: 'Mobile First',
    icon: Smartphone,
    items: [
      { name: 'Flutter', description: 'Cross-platform mobile apps' },
      { name: 'Offline Sync', description: 'Works without internet' },
      { name: 'Hive', description: 'Local data storage' }
    ],
    color: 'bg-blue-600'
  },
  {
    category: 'Web Platform',
    icon: Globe,
    items: [
      { name: 'React', description: 'Responsive dashboards' },
      { name: 'TypeScript', description: 'Type-safe code' },
      { name: 'Tailwind CSS', description: 'Modern styling' }
    ],
    color: 'bg-purple-600'
  },
  {
    category: 'Backend Infrastructure',
    icon: Code,
    items: [
      { name: 'FastAPI', description: 'High-performance API' },
      { name: 'Python', description: 'Business logic' },
      { name: 'JWT', description: 'Secure authentication' }
    ],
    color: 'bg-yellow-700'
  },
  {
    category: 'Cloud Services',
    icon: Cloud,
    items: [
      { name: 'VPS Hosting', description: 'Scalable infrastructure' },
      { name: 'Docker', description: 'Containerization' },
      { name: 'Nginx', description: 'Load balancing' }
    ],
    color: 'bg-cyan-600'
  },
  {
    category: 'Security & Compliance',
    icon: Shield,
    items: [
      { name: 'GDPR Compliant', description: 'Data protection' },
      { name: 'Encryption', description: 'End-to-end security' },
      { name: 'Audit Logs', description: 'Full traceability' }
    ],
    color: 'bg-cyan-600'
  }
];

const TechnologyStack = ({ onReadMore }: TechnologyStackProps) => {
  const handleReadMore = () => {
    onReadMore?.({
      title: 'EcoTrade Architecture',
      description:
        'Our platform combines geospatial intelligence, mobile-first tooling, and secure APIs to keep materials moving efficiently.',
      details: [
        'PostGIS powers clustering, route planning, and material tracking.',
        'FastAPI services orchestrate pickups, payments, and compliance data.',
        'React and Flutter dashboards keep stakeholders aligned in real time.'
      ]
    });
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            Powered By
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
            Our <span className="text-cyan-600">Technology</span> Stack
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Built with modern, open-source technologies for reliability and scalability
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl ${tech.color} text-white mr-4`}>
                  <tech.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tech.category}</h3>
              </div>

              <div className="space-y-4">
                {tech.items.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 hover:border-cyan-500 transition-colors">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Diagram Placeholder */}
        <div className="mt-16 bg-cyan-900 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Three-Tier Architecture</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <Globe className="w-8 h-8 mb-2 text-cyan-300" />
              <h4 className="font-semibold mb-2">Presentation Tier</h4>
              <p className="text-sm text-cyan-100">React Web + Flutter Mobile</p>
            </div>
            <div className="bg-white dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <Zap className="w-8 h-8 mb-2 text-cyan-300" />
              <h4 className="font-semibold mb-2">Application Tier</h4>
              <p className="text-sm text-cyan-100">FastAPI + Business Logic</p>
            </div>
            <div className="bg-white dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <Database className="w-8 h-8 mb-2 text-cyan-300" />
              <h4 className="font-semibold mb-2">Data Tier</h4>
              <p className="text-sm text-cyan-100">PostgreSQL + PostGIS</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleReadMore}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
          >
            Explore the architecture
          </button>
        </div>
      </div>
    </section>
  );
};

export default TechnologyStack;