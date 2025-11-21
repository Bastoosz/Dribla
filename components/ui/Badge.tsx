import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { RealtimeStatus } from '../../utils/statusUtils';
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
        success: 'bg-green-100 dark:bg-dribla-green/20 text-green-800 dark:text-dribla-green',
        warning: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400',
        danger: 'bg-red-100 dark:bg-dribla-orange/20 text-red-800 dark:text-dribla-orange',
        pending: 'bg-gray-100 dark:bg-gray-600/50 text-gray-800 dark:text-gray-300',
      },
      withIcon: {
        true: 'pl-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      withIcon: false,
    },
  }
);
const statusVariantMap: Record<RealtimeStatus, 'success' | 'warning' | 'danger' | 'pending'> = {
  paga: 'success',
  proximo: 'warning',
  vencida: 'danger',
  pendente: 'pending',
};
interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: RealtimeStatus;
  icon?: React.ReactNode;
}
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, status, icon, children, ...props }, ref) => {
    const finalVariant = status ? statusVariantMap[status] : variant;
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({
            variant: finalVariant,
            withIcon: !!icon,
            className,
          })
        )}
        {...props}
      >
        {icon && <span className="mr-1 flex items-center">{React.cloneElement(icon as React.ReactElement, { className: 'h-3 w-3' })}</span>}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';
export { Badge, badgeVariants };