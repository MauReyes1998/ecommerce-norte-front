import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/format';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  full?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', loading, full, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(`btn-${variant}`, full && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
