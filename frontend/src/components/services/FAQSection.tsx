// components/services/FAQSection.tsx
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    question: 'How do I sign up for hotel services?',
    answer: 'Click "Sign Up" and select "Hotel/Restaurant". You\'ll need your business registration and contact information. The process takes about 5 minutes.',
    category: 'hotels'
  },
  {
    question: 'What are the fees for recyclers?',
    answer: 'Recyclers pay a 5% transaction fee on successful collections. There are no monthly subscription fees or listing fees.',
    category: 'recyclers'
  },
  {
    question: 'How much can drivers earn?',
    answer: 'Drivers typically earn RWF 12,000-20,000 per day, including base pay, distance bonuses, and performance incentives.',
    category: 'drivers'
  },
  {
    question: 'Is there a minimum volume requirement?',
    answer: 'Yes, minimum collection volumes are: UCO (20kg), Glass (50kg), Cardboard (30kg). This ensures efficient logistics.',
    category: 'hotels'
  },
  {
    question: 'How do payments work?',
    answer: 'Payments are processed instantly via mobile money (MTN/Airtel) upon collection confirmation and verification.',
    category: 'all'
  },
  {
    question: 'What documents do I need as a driver?',
    answer: 'You need a valid driver\'s license, vehicle insurance, and a smartphone with internet capability.',
    category: 'drivers'
  },
  {
    question: 'Can I operate outside Kigali?',
    answer: 'Currently, services are available in Nyarugenge and Gasabo districts. Expansion planned for 2027.',
    category: 'all'
  },
  {
    question: 'How is waste quality verified?',
    answer: 'Drivers take photos at collection, which are verified by the system and can be reviewed by recyclers.',
    category: 'all'
  }
];

const FAQSection = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');

  const filteredFaqs = filter === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === filter || faq.category === 'all');

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked <span className="text-cyan-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Find answers to common questions about our services
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('hotels')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'hotels'
                ? 'bg-cyan-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800'
            }`}
          >
            Hotels
          </button>
          <button
            onClick={() => setFilter('recyclers')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'recyclers'
                ? 'bg-cyan-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800'
            }`}
          >
            Recyclers
          </button>
          <button
            onClick={() => setFilter('drivers')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'drivers'
                ? 'bg-cyan-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800'
            }`}
          >
            Drivers
          </button>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg divide-y divide-gray-200 dark:divide-gray-700">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="p-6">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Still have questions?</p>
          <button onClick={() => navigate('/contact')} className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors inline-flex items-center">
            <HelpCircle className="w-4 h-4 mr-2" />
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;