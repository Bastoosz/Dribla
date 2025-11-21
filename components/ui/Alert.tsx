import { cn } from "../../utils/cn";
import { AlertTriangle, InfoIcon, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}
const Alert = ({
  className,
  variant = 'default',
  title,
  icon,
  onClose,
  children,
  ...props
}: AlertProps) => {
  const variantStyles = {
    default: 'bg-gray-800/80 border-gray-700 text-gray-300',
    success: 'bg-dribla-green/10 border-dribla-green/20 text-dribla-green',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
  };
  const defaultIcons = {
    default: <InfoIcon className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
  };
  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {}
        <div className="flex-shrink-0">
          {icon || defaultIcons[variant]}
        </div>
        {}
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {}
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <span className="sr-only">Fechar</span>
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
export { Alert };