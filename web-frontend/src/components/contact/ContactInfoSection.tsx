import { motion } from 'framer-motion';

interface ContactInfoItem {
  icon: any;
  label: string;
  items: Array<any>;
}

interface ContactInfoSectionProps {
  contactInfo: ContactInfoItem[];
}

const ContactInfoSection = ({ contactInfo }: ContactInfoSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {contactInfo.map((info, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center">
              {info.icon}
            </div>
            <h3 className="font-bold text-gray-900">{info.label}</h3>
          </div>

          <div className="space-y-3">
            {info.items.map((item, itemIndex) => (
              <div key={itemIndex} className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                <div className="text-sm font-medium text-gray-900 mb-1">{item.type}</div>
                <div className="text-gray-800 font-medium break-words">
                  {info.label === 'Email' ? (
                    <a href={`mailto:${item.value}`} className="text-cyan-600 hover:underline">
                      {item.value}
                    </a>
                  ) : info.label === 'Phone' ? (
                    <a href={`tel:${item.value.replace(/\s/g, '')}`} className="text-cyan-600 hover:underline">
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </div>
                {'response' in item && item.response && (
                  <div className="text-xs text-gray-500 mt-1">Response: {item.response}</div>
                )}
                {'hours' in item && item.hours && (
                  <div className="text-xs text-gray-500 mt-1">{item.hours}</div>
                )}
                {'details' in item && item.details && (
                  <div className="text-xs text-gray-500 mt-1">{item.details}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default ContactInfoSection;
