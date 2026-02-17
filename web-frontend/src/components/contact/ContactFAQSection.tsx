import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search, ExternalLink } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  questions: FAQItem[];
}

interface ContactFAQSectionProps {
  filteredFaqs: FAQCategory[];
  openFaq: number | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFaqToggle: (id: number | null) => void;
}

const ContactFAQSection = ({
  filteredFaqs,
  openFaq,
  searchQuery,
  onSearchChange,
  onFaqToggle
}: ContactFAQSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="text-cyan-600" size={20} />
            Frequently Asked Questions
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(category => (
              <div key={category.category}>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{category.category}</h3>
                <div className="space-y-2">
                  {category.questions.map(faq => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => onFaqToggle(openFaq === faq.id ? null : faq.id)}
                        className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                        <ChevronDown
                          className={`transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180' : ''}`}
                          size={16}
                        />
                      </button>
                      <AnimatePresence>
                        {openFaq === faq.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 pt-0">
                              <div className="pl-3 border-l-2 border-cyan-500">
                                <p className="text-gray-600 text-sm">{faq.answer}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <HelpCircle className="mx-auto text-gray-300 mb-2" size={24} />
              <p className="text-gray-500">No FAQs match your search. Try different keywords.</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-3 text-sm">Still have questions?</p>
            <a
              href="mailto:support@EcoTrade.rw"
              className="inline-flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-700 transition-colors text-sm"
            >
              <ExternalLink size={14} />
              Email Support Team
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactFAQSection;
