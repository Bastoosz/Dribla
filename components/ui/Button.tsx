import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
  primary: 'bg-dribla-green text-gray-900 hover:bg-dribla-green-600 hover:scale-105 hover:shadow-xl hover:shadow-dribla-green-500/20',
        secondary: 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:scale-105',
        outline: 'border border-gray-700 bg-transparent text-white hover:bg-gray-800/80',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/80',
        success: 'bg-dribla-green text-gray-900 hover:bg-green-600 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20',
        warning: 'bg-yellow-500 text-gray-900 hover:bg-yellow-600 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20',
        danger: 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20',
        info: 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20',
      },
      size: {
        sm: 'h-9 px-4 py-2',
        md: 'h-11 px-6 py-2',
        lg: 'h-12 px-8 py-3',
        icon: 'h-9 w-9',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export { Button, buttonVariants };