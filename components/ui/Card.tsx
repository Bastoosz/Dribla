import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
const cardVariants = cva(
  'rounded-lg border bg-dribla-graphite/80 shadow-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-gray-700/50',
        outline: 'border-gray-700',
  highlight: 'border-dribla-green/50',
        success: 'border-dribla-green/50',
      },
      hover: {
        true: 'hover:scale-102 hover:shadow-xl hover:bg-gray-800/80',
        false: '',
      },
      withGradient: {
        true: 'bg-gradient-to-br from-gray-800/50 to-transparent backdrop-blur-sm',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hover: false,
      withGradient: false,
    },
  }
);
interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, withGradient, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, withGradient, className }))}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-white", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};