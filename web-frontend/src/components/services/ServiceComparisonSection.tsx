import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Zap } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  traditional: string;
  EcoTrade: string;
  savings: string;
  icon: any;
}

interface ComparisonData {
  title: string;
  rows: ComparisonRow[];
}

interface ServiceComparisonSectionProps {
  comparisons: { [key: string]: ComparisonData };
  activeComparison: string;
  onChangeComparison: (comparison: string) => void;
}

const ServiceComparisonSection = ({ 
  comparisons, 
  activeComparison, 
  onChangeComparison 
}: ServiceComparisonSectionProps) => {
  const currentComparison = comparisons[activeComparison];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="lg:w-11/12 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Traditional vs EcoTrade  Comparison</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See how our platform transforms waste management economics
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex gap-4 justify-center mb-8">
            {Object.keys(comparisons).map((key) => (
              <button
                key={key}
                onClick={() => onChangeComparison(key)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  activeComparison === key
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {comparisons[key].title}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeComparison}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                <tr>
                  <th className="text-left p-6 font-bold text-slate-900">Feature / Metric</th>
                  <th className="text-left p-6 font-bold text-slate-900">Traditional Method</th>
                  <th className="text-left p-6 font-bold text-slate-900">EcoTrade Rwanda Platform</th>
                  <th className="text-left p-6 font-bold text-slate-900">Advantage</th>
                </tr>
              </thead>
              <tbody>
                {currentComparison.rows.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-t border-slate-100 ${
                      index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                          {row.icon}
                        </div>
                        <span className="font-medium text-slate-900">{row.feature}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-2 ${
                        row.traditional.includes('✗') ? 'text-slate-500' : 'text-slate-700'
                      }`}>
                        {row.traditional}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-2 ${
                        row.EcoTrade.includes('✓') ? 'text-cyan-500' : 'text-slate-700'
                      }`}>
                        {row.EcoTrade}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-100 text-cyan-800 px-4 py-2 rounded-lg font-medium">
                        <TrendingUp size={16} />
                        {row.savings}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Benefits Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 p-6 rounded-2xl border border-cyan-200">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
              <DollarSign size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Cost cyanuction</h4>
            <p className="text-slate-600">Average 65% cyanuction in waste management costs for HORECA businesses</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 p-6 rounded-2xl border border-cyan-200">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Revenue Generation</h4>
            <p className="text-slate-600">New income streams from waste previously treated as disposal expense</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 p-6 rounded-2xl border border-cyan-200">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Operational Efficiency</h4>
            <p className="text-slate-600">40% improvement in collection logistics and route optimization</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceComparisonSection;
