// pages/ContactPage.tsx
import { useState, useRef } from 'react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import ContactHero from '../../components/contact/ContactHero';
import ContactForm from '../../components/contact/ContactForm';
import ContactInfo from '../../components/contact/ContactInfo';
import LiveChatWidget from '../../components/contact/LiveChatWidget';
import OfficeLocation from '../../components/contact/OfficeLocation';
import FAQAccordion from '../../components/contact/FAQAccordion';
import ContactMethods from '../../components/contact/ContactMethods';
import Modal from '../../components/common/Modal/Modal';

interface ContactModalContent {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: '',
    subject: '',
    message: '',
    attachments: []
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [chatOpen, setChatOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ContactModalContent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const handleOpenChat = () => {
    setChatOpen(true);
  };

  const handleOpenModal = (content: ContactModalContent) => {
    setModalContent(content);
  };

  const handleCloseModal = () => {
    setModalContent(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <ContactHero />

        <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Contact Section */}
          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            {/* Contact Form - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <ContactForm 
                formData={formData}
                setFormData={setFormData}
                formStatus={formStatus}
                setFormStatus={setFormStatus}
                fileInputRef={fileInputRef}
              />
            </div>

            {/* Contact Information - Takes 1 column */}
            <div className="lg:col-span-1 space-y-6">
              <ContactInfo onOpenChat={handleOpenChat} />
              <ContactMethods
                onOpenChat={handleOpenChat}
                onOpenModal={handleOpenModal}
              />
            </div>
          </div>

          {/* Office Location Map */}
          <OfficeLocation />

          {/* FAQ Section */}
          <FAQAccordion onOpenChat={handleOpenChat} />

        </div>
      </main>

      {/* Live Chat Widget */}
      <LiveChatWidget 
        chatOpen={chatOpen} 
        setChatOpen={setChatOpen} 
      />

      <Modal
        isOpen={Boolean(modalContent)}
        onClose={handleCloseModal}
        title={modalContent?.title}
        size="sm"
      >
        {modalContent && (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">{modalContent.description}</p>
            <div className="flex flex-wrap gap-3">
              {modalContent.primaryHref && modalContent.primaryLabel && (
                <a
                  href={modalContent.primaryHref}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
                >
                  {modalContent.primaryLabel}
                </a>
              )}
              {modalContent.secondaryHref && modalContent.secondaryLabel && (
                <a
                  href={modalContent.secondaryHref}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {modalContent.secondaryLabel}
                </a>
              )}
              {!modalContent.primaryHref && (
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default ContactPage;