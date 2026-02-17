import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, HelpCircle, FileText, Upload, Loader, Check, AlertCircle, Paperclip, MessageCircle, Clock, X, Send, CheckCircle } from 'lucide-react';

interface ContactFormSectionProps {
  formData: {
    name: string;
    email: string;
    inquiryType: string;
    subject: string;
    message: string;
    file: File | null;
  };
  formStatus: 'idle' | 'loading' | 'success' | 'error';
  inquiryTypes: Array<{ id: string; label: string; icon: any }>;
  onFormDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (file: File | null) => void;
  onRemoveFile: () => void;
  onSubmit: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  getResponseTime: (type: string) => string;
}

const ContactFormSection = ({
  formData,
  formStatus,
  inquiryTypes,
  onFormDataChange,
  onFileChange,
  onRemoveFile,
  onSubmit,
  fileInputRef,
  getResponseTime
}: ContactFormSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
        <p className="text-gray-500 mb-4 text-sm">Fill out the form below and we'll get back to you as soon as possible</p>

        <form onSubmit={onSubmit} className="space-y-4">
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
                onChange={onFormDataChange}
                placeholder="Full Name"
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
                onChange={onFormDataChange}
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
                onChange={onFormDataChange}
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
                onChange={onFormDataChange}
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
              onChange={onFormDataChange}
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
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {formData.file && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={14} />
                  {formData.file.name}
                  <button
                    type="button"
                    onClick={onRemoveFile}
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
  );
};

export default ContactFormSection;
