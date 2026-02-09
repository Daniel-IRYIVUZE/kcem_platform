import { useState, useRef } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageCircle, 
  HelpCircle, 
  ChevronDown,
  Clock,
  User,
  FileText,
  Upload,
  Shield,
  Zap,
  CheckCircle,
  Search,
  X,
  Paperclip,
  Loader,
  Check,
  AlertCircle,
  Users,
  Briefcase,
  MailOpen,
  Home,
  ExternalLink
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'general',
    subject: '',
    message: '',
    file: null as File | null
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! How can I help you today?', time: '10:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const contactInfo = [
    {
      icon: <Mail size={20} />,
      label: 'Email',
      items: [
        { type: 'General Support', value: 'support@kcem.rw', response: '24 hours' },
        { type: 'Sales & Partnerships', value: 'partnerships@kcem.rw', response: '2 business days' },
        { type: 'Technical Issues', value: 'tech@kcem.rw', response: '12 hours' }
      ]
    },
    {
      icon: <Phone size={20} />,
      label: 'Phone',
      items: [
        { type: 'Support Line', value: '+250 780 162 164', hours: 'Mon-Fri, 8AM-6PM' },
        { type: 'Emergency', value: '+250 788 999 999', hours: '24/7' }
      ]
    },
    {
      icon: <MapPin size={20} />,
      label: 'Office',
      items: [
        { type: 'Headquarters', value: 'Kigali Innovation City, KG 7 Ave', details: 'Main Building, 3rd Floor' },
        { type: 'Operations Center', value: 'Nyarugenge District', details: 'Waste Collection Hub' }
      ]
    },
    {
      icon: <Clock size={20} />,
      label: 'Hours',
      items: [
        { type: 'Customer Support', value: 'Mon-Fri: 8:00 AM - 6:00 PM' },
        { type: 'Weekend Support', value: 'Sat: 9:00 AM - 1:00 PM' }
      ]
    }
  ];

  const inquiryTypes = [
    { id: 'general', label: 'General Inquiry', icon: <HelpCircle size={16} /> },
    { id: 'technical', label: 'Technical Support', icon: <Zap size={16} /> },
    { id: 'partnership', label: 'Partnership Request', icon: <Briefcase size={16} /> },
    { id: 'billing', label: 'Billing & Payments', icon: <Shield size={16} /> },
    { id: 'media', label: 'Media & Press', icon: <Users size={16} /> },
    { id: 'feedback', label: 'Feedback & Suggestions', icon: <MailOpen size={16} /> }
  ];

  const faqs = [
    {
      category: 'Account & Registration',
      questions: [
        {
          id: 1,
          question: 'How do I get my Green Score?',
          answer: 'Your Green Score is automatically calculated based on multiple factors including waste listing consistency, material quality, transaction reliability, and sustainability metrics. It updates in real-time as you complete transactions on the platform.'
        },
        {
          id: 2,
          question: 'Is there a fee for listing waste materials?',
          answer: 'Individual listings are completely free for both HORECA businesses and recyclers. We charge a small 5% commission on successful transactions to maintain and improve the platform infrastructure and services.'
        },
        {
          id: 3,
          question: 'How long does account verification take?',
          answer: 'Standard business account verification takes 1-2 business days. During high volume periods, it may take up to 3 days. You will receive email notifications at each verification stage.'
        }
      ]
    },
    {
      category: 'Transactions & Payments',
      questions: [
        {
          id: 4,
          question: 'How are payments processed?',
          answer: 'Payments are processed securely through MTN Mobile Money and Airtel Money integration. Funds are held in escrow until both parties confirm transaction completion, then released to the seller.'
        },
        {
          id: 5,
          question: 'What is your dispute resolution process?',
          answer: 'In case of disputes, contact our support team within 24 hours of transaction completion. Our team will review the case, request evidence from both parties, and mediate a resolution within 3 business days.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          id: 6,
          question: 'How does the offline-first mobile app work?',
          answer: 'Our mobile app saves data locally when offline and automatically syncs when internet connection is restored. This ensures drivers can continue operations in low-connectivity areas without interruption.'
        },
        {
          id: 7,
          question: 'Can I access the platform on multiple devices?',
          answer: 'Yes, you can access your account on multiple devices. For security, we recommend logging out from public devices and enabling two-factor authentication in your account settings.'
        }
      ]
    },
    {
      category: 'Partnerships & Business',
      questions: [
        {
          id: 8,
          question: 'How can my business partner with KCEM?',
          answer: 'We offer various partnership opportunities including waste collection collaborations, technology integrations, and corporate sustainability programs. Contact our partnerships team at partnerships@kcem.rw for more information.'
        },
        {
          id: 9,
          question: 'Do you offer enterprise solutions?',
          answer: 'Yes, we provide custom enterprise solutions for large hotel chains and industrial facilities. These include API access, custom reporting, dedicated support, and on-site training.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setFormData(prev => ({ ...prev, file }));
    } else {
      alert('File size must be less than 10MB');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 3000);
      return;
    }

    setFormStatus('loading');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setFormStatus('success');
    setFormData({
      name: '',
      email: '',
      inquiryType: 'general',
      subject: '',
      message: '',
      file: null
    });
    
    setTimeout(() => setFormStatus('idle'), 3000);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        sender: 'bot',
        text: 'Thanks for your message! Our support team will get back to you shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getResponseTime = (inquiryType: string) => {
    switch (inquiryType) {
      case 'technical': return '4-6 hours';
      case 'emergency': return '1-2 hours';
      case 'partnership': return '2 business days';
      case 'billing': return '24 hours';
      default: return '12-24 hours';
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 font-medium transition-colors"
            >
              <Home size={16} />
              Back to Home
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
            >
              <MessageCircle size={16} />
              We're Here to Help
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get in <span className="text-cyan-600">Touch</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Have questions about listings, registration, or partnerships? Our team is here to help transform waste into value.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="lg:col-span-1">
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
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                  <p className="text-gray-500 mb-4 text-sm">Fill out the form below and we'll get back to you as soon as possible</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User size={14} className="inline mr-2" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail size={14} className="inline mr-2" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="contact@business.rw"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <HelpCircle size={14} className="inline mr-2" />
                          Inquiry Type *
                        </label>
                        <select
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm bg-white"
                        >
                          {inquiryTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText size={14} className="inline mr-2" />
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="Brief description of your inquiry"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageCircle size={14} className="inline mr-2" />
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please provide details about your inquiry..."
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm min-h-[120px] resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Upload size={14} className="inline mr-2" />
                        Attachments (Optional)
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-cyan-400 hover:text-cyan-600 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Paperclip size={16} />
                          Choose File
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {formData.file && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText size={14} />
                            {formData.file.name}
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Maximum file size: 10MB. Supported formats: PDF, DOC, JPG, PNG
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          Estimated response time: <span className="font-medium text-cyan-600">{getResponseTime(formData.inquiryType)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          We respond to all inquiries within the stated time frame
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={formStatus === 'loading'}
                        className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                      >
                        {formStatus === 'loading' ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Sending...
                          </>
                        ) : formStatus === 'success' ? (
                          <>
                            <Check size={16} />
                            Message Sent!
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Send Message
                          </>
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {formStatus === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2"
                        >
                          <AlertCircle size={16} />
                          Please fill in all required fields marked with *
                        </motion.div>
                      )}
                      
                      {formStatus === 'success' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-600 text-sm flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Thank you! Your message has been sent. We'll respond within {getResponseTime(formData.inquiryType)}.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </motion.div>

              {/* FAQ Section */}
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
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
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
                        href="mailto:support@kcem.rw"
                        className="inline-flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-700 transition-colors text-sm"
                      >
                        <ExternalLink size={14} />
                        Email Support Team
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Widget */}
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
                  onClick={() => setChatOpen(false)}
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
            
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
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

      {/* Chat Toggle Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        {chatOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      
      <Footer />
    </div>
  );
};

export default ContactPage;