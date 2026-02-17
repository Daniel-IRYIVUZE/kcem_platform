import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface ContactChatWidgetSectionProps {
  chatOpen: boolean;
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatToggle: () => void;
  onChatInputChange: (value: string) => void;
  onChatSubmit: (e: React.FormEvent) => void;
}

const ContactChatWidgetSection = ({
  chatOpen,
  chatMessages,
  chatInput,
  onChatToggle,
  onChatInputChange,
  onChatSubmit
}: ContactChatWidgetSectionProps) => {
  return (
    <>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="bg-cyan-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  <div>
                    <h3 className="font-bold text-sm">Live Chat Support</h3>
                    <p className="text-xs text-cyan-100">Typical response: 2-5 minutes</p>
                  </div>
                </div>
                <button
                  onClick={onChatToggle}
                  className="text-cyan-100 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={onChatSubmit} className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => onChatInputChange(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none text-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Offline? We'll respond via email within 24 hours
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onChatToggle}
        className="fixed bottom-4 right-4 w-12 h-12 bg-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        {chatOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </>
  );
};

export default ContactChatWidgetSection;
