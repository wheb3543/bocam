import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

interface FieldErrorProps {
  error?: string | null;
  errors?: string[];
  className?: string;
  showIcon?: boolean;
}

export function FieldError({ error, errors, className = '', showIcon = true }: FieldErrorProps) {
  const errorMessage = error || (errors && errors.length > 0 ? errors[0] : null);

  if (!errorMessage) {
    return null;
  }

  return (
    <div
      className={cn('flex items-center gap-1.5 text-sm text-red-600 mt-1 text-right', className)}
    >
      {showIcon && <AlertCircle className="h-4 w-4 flex-shrink-0" />}
      <span>{errorMessage}</span>
    </div>
  );
}

export function FieldErrors({ errors, className = '' }: { errors?: string[]; className?: string }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  if (errors.length === 1) {
    return <FieldError error={errors[0]} className={className} />;
  }

  return (
    <div className={cn('space-y-1 mt-1', className)}>
      {errors.map((err, index) => (
        <FieldError key={index} error={err} showIcon={index === 0} />
      ))}
    </div>
  );
}

interface InputWithErrorProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string | null;
  errors?: string[];
  helperText?: string;
  required?: boolean;
}

export function InputWithError({
  label,
  error,
  errors,
  helperText,
  required,
  className,
  ...props
}: InputWithErrorProps) {
  const hasError = error || (errors && errors.length > 0);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-right">
          {label}
          {required && <span className="text-red-600 mr-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right',
          hasError && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
      />
      <FieldError error={error} errors={errors} />
      {helperText && !hasError && (
        <p className="text-xs text-muted-foreground text-right">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaWithErrorProps extends ComponentPropsWithoutRef<'textarea'> {
  label?: string;
  error?: string | null;
  errors?: string[];
  helperText?: string;
  required?: boolean;
}

export function TextareaWithError({
  label,
  error,
  errors,
  helperText,
  required,
  className,
  ...props
}: TextareaWithErrorProps) {
  const hasError = error || (errors && errors.length > 0);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-right">
          {label}
          {required && <span className="text-red-600 mr-1">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none text-right',
          hasError && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
      />
      <FieldError error={error} errors={errors} />
      {helperText && !hasError && (
        <p className="text-xs text-muted-foreground text-right">{helperText}</p>
      )}
    </div>
  );
}

interface SelectWithErrorProps extends ComponentPropsWithoutRef<'select'> {
  label?: string;
  error?: string | null;
  errors?: string[];
  helperText?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function SelectWithError({
  label,
  error,
  errors,
  helperText,
  required,
  options,
  className,
  ...props
}: SelectWithErrorProps) {
  const hasError = error || (errors && errors.length > 0);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-right">
          {label}
          {required && <span className="text-red-600 mr-1">*</span>}
        </label>
      )}
      <select
        {...props}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right',
          hasError && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
      >
        <option value="">اختر...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError error={error} errors={errors} />
      {helperText && !hasError && (
        <p className="text-xs text-muted-foreground text-right">{helperText}</p>
      )}
    </div>
  );
}
