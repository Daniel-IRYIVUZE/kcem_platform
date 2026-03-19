// components/contact/ContactForm.tsx
import { useState } from 'react';
import type { RefObject } from 'react';
import { supportAPI } from '../../services/api';
import { Send, Paperclip, X, CheckCircle, AlertCircle, Loader, FileText } from 'lucide-react';

interface ContactFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    userType: string;
    subject: string;
    message: string;
    attachments: File[];
  };
  setFormData: (data: any) => void;
  formStatus: 'idle' | 'submitting' | 'success' | 'error';
  setFormStatus: (status: any) => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

const ContactForm = ({ 
  formData, 
  setFormData, 
  formStatus, 
  setFormStatus, 
  fileInputRef 
}: ContactFormProps) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    if (name === 'message') {
      setCharCount(value.length);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
      setFormData((prev: any) => ({ ...prev, attachments: [...prev.attachments, ...newFiles] }));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setFormData((prev: any) => ({
      ...prev,
      attachments: prev.attachments.filter((_: File, i: number) => i !== index)
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setAttachments(prev => [...prev, ...newFiles]);
      setFormData((prev: any) => ({ ...prev, attachments: [...prev.attachments, ...newFiles] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');

    try {
      await supportAPI.createPublic({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        user_type: formData.userType || undefined,
        subject: formData.subject || 'General Inquiry',
        message: formData.message,
      });
      setFormStatus('success');
      setTimeout(() => {
        setFormStatus('idle');
        setFormData({
          name: '',
          email: '',
          phone: '',
          userType: '',
          subject: '',
          message: '',
          attachments: []
        });
        setAttachments([]);
        setCharCount(0);
      }, 3000);
    } catch {
      setFormStatus('error');
    }
  };

  const userTypes = [
    'Business/Restaurant',
    'Recycling Company',
    'Driver',
    'Partner',
    'Media',
    'Other'
  ];

  const subjects = [
    'General Inquiry',
    'Technical Support',
    'Partnership Opportunity',
    'Media Request',
    'Feedback',
    'Billing Question',
    'Other'
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="John Karambizi"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="username@ecotrade.rw"
            />
          </div>
        </div>

        {/* Phone and User Type Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="+250 780 162 164"
            />
          </div>

          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              I am a *
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select user type</option>
              {userTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            required
            minLength={20}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Tell us how we can help you..."
          />
          <div className="flex justify-between mt-2 text-xs">
            <span className={charCount < 20 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}>
              Minimum 20 characters
            </span>
            <span className="text-gray-400 dark:text-gray-500">{charCount}/500</span>
          </div>
        </div>

        {/* File Attachment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attachments (optional)
          </label>
          
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive 
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-cyan-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <Paperclip className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Drag & drop files here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-cyan-600 font-semibold hover:text-cyan-700 dark:text-cyan-400"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supported: JPG, PNG, PDF, DOC (Max 10MB each)
            </p>
          </div>

          {/* File List */}
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-2"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* reCAPTCHA Notice */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formStatus === 'submitting' || formStatus === 'success'}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center ${
            formStatus === 'submitting'
              ? 'bg-gray-400 cursor-not-allowed'
              : formStatus === 'success'
              ? 'bg-cyan-500'
              : 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          {formStatus === 'submitting' && (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          )}
          
          {formStatus === 'success' && (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Message Sent Successfully!
            </>
          )}
          
          {formStatus === 'error' && (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              Error Sending. Please Try Again.
            </>
          )}
          
          {formStatus === 'idle' && (
            <>
              Send Message
              <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </button>

        {/* Success Message */}
        {formStatus === 'success' && (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4 text-cyan-700 dark:text-cyan-400">
            <p className="text-sm font-medium">
              Thank you for reaching out! We'll respond within 24 hours.
            </p>
          </div>
        )}

        {/* Error Message */}
        {formStatus === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700">
            <p className="text-sm font-medium">
              Something went wrong. Please try again or contact us directly.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;