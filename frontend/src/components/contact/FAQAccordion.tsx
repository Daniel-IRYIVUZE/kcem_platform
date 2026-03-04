// components/contact/FAQAccordion.tsx
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "How do I sign up as a hotel?",
    answer: "Click on 'Sign Up' and select 'Hotel/Restaurant'. You'll need your business registration number, tax ID, and contact information. The process takes about 5 minutes."
  },
  {
    question: "What are the platform fees?",
    answer: "EcoTrade charges a 5% transaction fee on all successful waste trades. There are no listing fees or monthly subscription costs."
  },
  {
    question: "How do payments work?",
    answer: "Payments are processed instantly via mobile money (MTN/Airtel) upon collection confirmation. Funds are released within minutes of successful verification."
  },
  {
    question: "What types of waste do you accept?",
    answer: "Currently, we accept Used Cooking Oil (UCO), Glass Bottles, and Cardboard/Paper. We're expanding to include plastics and e-waste in 2026."
  },
  {
    question: "Is there a minimum volume requirement?",
    answer: "Yes, the minimum collection volume is 20kg for UCO, 50kg for glass, and 30kg for cardboard. This ensures efficient logistics."
  },
  {
    question: "How do I become a driver?",
    answer: "Register as a driver with your license, vehicle details, and insurance documents. Drivers must pass a verification process and training."
  },
  {
    question: "What is the Green Score?",
    answer: "The Green Score is a sustainability metric that measures your environmental impact. Higher scores lead to better visibility and premium features."
  },
  {
    question: "Do you operate outside Kigali?",
    answer: "Currently, we operate in Nyarugenge and Gasabo districts. Regional expansion to other districts and cities is planned for 2027."
  }
];

interface FAQAccordionProps {
  onOpenChat?: () => void;
}

const FAQAccordion = ({ onOpenChat }: FAQAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-12">
      <div className="flex items-center mb-6">
        <HelpCircle className="w-6 h-6 text-cyan-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl divide-y divide-gray-200 dark:divide-gray-700">
        {faqs.map((faq, index) => (
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
        <button
          type="button"
          onClick={onOpenChat}
          className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors inline-flex items-center"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Contact Support
        </button>
      </div>
    </section>
  );
};

export default FAQAccordion;