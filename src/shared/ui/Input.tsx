import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/shared/lib/format';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const auto = useId();
    const inputId = id ?? auto;
    return (
      <div className={className}>
        <label htmlFor={inputId} className="label">{label}</label>
        <input ref={ref} id={inputId} className={cn('input', error && 'border-accent')} aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : undefined} {...rest} />
        {error ? <p id={`${inputId}-err`} className="mt-1 text-xs text-accent">{error}</p>
          : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  ({ label, error, className, id, children, ...rest }, ref) => {
    const auto = useId();
    const selectId = id ?? auto;
    return (
      <div className={className}>
        <label htmlFor={selectId} className="label">{label}</label>
        <select ref={ref} id={selectId} className={cn('input', error && 'border-accent')} {...rest}>{children}</select>
        {error && <p className="mt-1 text-xs text-accent">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const auto = useId();
    const taId = id ?? auto;
    return (
      <div className={className}>
        <label htmlFor={taId} className="label">{label}</label>
        <textarea ref={ref} id={taId} className={cn('input min-h-[96px]', error && 'border-accent')} {...rest} />
        {error && <p className="mt-1 text-xs text-accent">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
