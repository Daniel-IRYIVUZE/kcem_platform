// components/contact/LiveChatWidget.tsx
import { useState } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';

interface LiveChatWidgetProps {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

const LiveChatWidget = ({ chatOpen, setChatOpen }: LiveChatWidgetProps) => {
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can we help you today?', sender: 'bot', time: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    // Add user message
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: trimmed,
      sender: 'user',
      time: new Date()
    }]);

    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Thanks for your message! Our team will get back to you shortly. For immediate assistance, please call our emergency line.",
        sender: 'bot',
        time: new Date()
      }]);
    }, 2000);
  };

  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const commonQuestions = [
    "How do I sign up?",
    "What are your fees?",
    "Driver application",
    "Technical support"
  ];

  if (!chatOpen) {
    return (
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Open live chat"
        className="fixed bottom-23 right-6 bg-cyan-600 text-white p-4 rounded-full shadow-2xl hover:bg-cyan-700 transform hover:scale-110 transition-all duration-300 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-[calc(100vw-3rem)] max-w-sm sm:max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-50 transition-all duration-300 ${
        minimized ? 'h-16' : 'h-[520px] sm:h-[600px]'
      }`}
      role="dialog"
      aria-label="Live chat"
    >
      {/* Header */}
      <div className="bg-cyan-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          <span className="font-semibold">EcoTrade Support</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMinimized(!minimized)}
            className="hover:bg-white dark:bg-gray-800/10 p-1 rounded transition-colors"
          >
            {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="hover:bg-white dark:bg-gray-800/10 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Chat Messages */}
          <div className="h-[calc(100%-120px)] overflow-y-auto p-4 space-y-4" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Common questions:</p>
            <div className="flex flex-wrap gap-2">
              {commonQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickQuestion(q)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-cyan-100 hover:text-cyan-700 dark:text-cyan-400 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleSendMessage}
                type="button"
                aria-label="Send message"
                className="bg-cyan-600 text-white p-2 rounded-xl hover:bg-cyan-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveChatWidget;