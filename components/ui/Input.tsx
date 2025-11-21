import React from 'react';
import { cn } from '../../utils/cn';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg bg-gray-800/50 border border-gray-700",
              "text-gray-100 placeholder:text-gray-500",
              "focus:ring-2 focus:ring-dribla-green/20 focus:border-dribla-green/30",
              "transition duration-200",
              icon ? "pl-10" : "pl-4",
              "pr-4 py-2",
              error && "border-red-500/50 focus:ring-red-500/20 focus:border-red-500/30",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
export { Input };