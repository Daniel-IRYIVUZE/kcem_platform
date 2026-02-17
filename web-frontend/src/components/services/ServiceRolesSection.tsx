import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Recycle, Truck, User, Shield, ChevronDown } from 'lucide-react';

interface ServiceFeature {
  icon: any;
  title: string;
  description: string;
  details?: string[];
}

interface ServiceRolesSectionProps {
  serviceFeatures: { [key: string]: ServiceFeature[] };
  expandedRole: string | null;
  onExpandRole: (role: string | null) => void;
}

const ServiceRolesSection = ({ serviceFeatures, expandedRole, onExpandRole }: ServiceRolesSectionProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'horeca': return <ShoppingBag size={24} />;
      case 'recyclers': return <Recycle size={24} />;
      case 'drivers': return <Truck size={24} />;
      case 'individual': return <User size={24} />;
      default: return <Shield size={24} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'horeca': return 'bg-gradient-to-br from-cyan-500 to-cyan-500';
      case 'recyclers': return 'bg-gradient-to-br from-green-500 to-cyan-500';
      default: return 'bg-gradient-to-br from-cyan-500 to-cyan-500';
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'horeca': return 'HORECA Businesses';
      case 'recyclers': return 'Recycling Companies';
      case 'drivers': return 'Logistics & Drivers';
      case 'individual': return 'Individual Collectors';
      default: return 'Platform Admins';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'horeca': return 'Transform waste into revenue';
      case 'recyclers': return 'Access reliable waste streams';
      case 'drivers': return 'Optimize collection operations';
      case 'individual': return 'Participate in circular economy';
      default: return 'Manage platform operations';
    }
  };

  const getFeatureBgColor = (role: string) => {
    switch (role) {
      case 'recyclers': return 'bg-green-50 text-green-600';
      default: return 'bg-cyan-50 text-cyan-600';
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Complete Service Packages</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive tools designed for each stakeholder in the circular economy
          </p>
        </motion.div>

        <div className="space-y-8">
          {Object.entries(serviceFeatures).map(([role, features], roleIndex) => (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: roleIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <button
                  onClick={() => onExpandRole(expandedRole === role ? null : role)}
                  className="flex items-center justify-between w-full p-6 bg-white rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getRoleColor(role)} text-white`}>
                      {getRoleIcon(role)}
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-slate-900">{getRoleTitle(role)}</h3>
                      <p className="text-slate-600">{getRoleDescription(role)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Login for more</div>
                    </div>
                    <ChevronDown className={`transition-transform ${expandedRole === role ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              </div>
              
              <AnimatePresence>
                {expandedRole === role && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {features.map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border border-slate-200">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFeatureBgColor(role)}`}>
                              {feature.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 mb-2">{feature.title}</h4>
                              <p className="text-slate-600 text-sm mb-3">{feature.description}</p>
                              <div className="space-y-2">
                                {feature.details?.map((detail, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                    {detail}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceRolesSection;
