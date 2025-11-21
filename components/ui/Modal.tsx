import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  maxWidth?: string;
}
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  footer,
  size = 'md',
  maxWidth,
  children,
  className,
  ...props
}) => {
  if (!isOpen) return null;
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };
  return (
    <>
      {}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full px-2 sm:px-4 max-h-[90vh] overflow-y-auto"
        {...props}
      >
        <div className={cn(
          "w-full bg-gray-900 rounded-xl border border-gray-800 shadow-xl",
          maxWidth || sizeClasses[size],
          "mx-auto",
          className
        )}>
          {}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {}
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            {children}
          </div>
          {}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-800">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export { Modal };