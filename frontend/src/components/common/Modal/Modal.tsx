import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  accentColor?: string;
  children: React.ReactNode;
}

const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size = 'md',
  accentColor = 'bg-cyan-600',
  children,
}: ModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Reset scroll on open
    if (contentRef.current) contentRef.current.scrollTop = 0;

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-10">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal Panel */}
      <div
        className={`relative w-full ${sizeMap[size]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Gradient Header */}
        <div className={`${accentColor} px-6 py-5 flex items-start justify-between gap-4`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 bg-white/20 dark:bg-gray-800/30 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg sm:text-xl font-bold text-white leading-tight"
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-white/75 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-gray-800/20 dark:hover:bg-gray-800/40 text-white transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-6 py-6 text-gray-700 dark:text-gray-300 prose-sm prose-headings:text-gray-900 dark:prose-headings:text-white"
        >
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

