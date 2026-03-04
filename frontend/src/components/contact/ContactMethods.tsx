// components/contact/ContactMethods.tsx
import { MessageSquare, Headphones, Users, Calendar, ArrowRight } from 'lucide-react';

const methods = [
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    availability: 'Available 24/7',
    action: 'Start Chat',
    color: 'bg-blue-600',
    actionType: 'chat'
  },
  {
    icon: Headphones,
    title: 'Phone Support',
    description: 'Speak directly with us',
    availability: 'Mon-Fri, 8am-6pm',
    action: 'Call Now',
    color: 'bg-cyan-600',
    actionType: 'call'
  },
  {
    icon: Users,
    title: 'Partnerships',
    description: 'Become a partner',
    availability: 'Business hours',
    action: 'Partner Inquiry',
    color: 'bg-purple-600',
    actionType: 'partner'
  },
  {
    icon: Calendar,
    title: 'Schedule Meeting',
    description: 'Book a call with our team',
    availability: 'Next available: Tomorrow',
    action: 'Book Now',
    color: 'bg-yellow-700',
    actionType: 'schedule'
  }
];

interface ContactMethodsProps {
  onOpenChat: () => void;
  onOpenModal: (content: {
    title: string;
    description: string;
    primaryLabel?: string;
    primaryHref?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  }) => void;
}

const ContactMethods = ({ onOpenChat, onOpenModal }: ContactMethodsProps) => {
  const handleMethodAction = (method: (typeof methods)[number]) => {
    if (method.actionType === 'chat') {
      onOpenChat();
      return;
    }

    if (method.actionType === 'call') {
      onOpenModal({
        title: 'Phone Support',
        description: 'Call our support team during business hours for immediate help.',
        primaryLabel: 'Call +250 780 162 164',
        primaryHref: 'tel:+250780162164',
        secondaryLabel: 'Call Emergency Line',
        secondaryHref: 'tel:+250780162164'
      });
      return;
    }

    if (method.actionType === 'partner') {
      onOpenModal({
        title: 'Partnership Inquiry',
        description: 'Tell us about your organization and we will follow up with next steps.',
        primaryLabel: 'Email Partnerships',
        primaryHref: 'mailto:partnerships@ecotrade.rw?subject=Partnership%20Inquiry'
      });
      return;
    }

    if (method.actionType === 'schedule') {
      onOpenModal({
        title: 'Schedule a Meeting',
        description: 'Pick a time and we will set up a video call with the team.',
        primaryLabel: 'Open Calendar',
        primaryHref: 'https://calendly.com/ecotrade'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Contact Methods</h3>
      
      <div className="space-y-4">
        {methods.map((method, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleMethodAction(method)}
            className="w-full text-left group p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-lg ${method.color} text-white mr-4`}>
                <method.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{method.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{method.availability}</p>
              </div>
              
              <span className="text-cyan-600 text-sm font-semibold hover:text-cyan-700 dark:text-cyan-400 inline-flex items-center">
                {method.action}
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContactMethods;