import React, { useEffect, useMemo, useRef } from 'react';
import { TRPCClientError } from '@trpc/client';
import { ValidationErrorAlert } from './ValidationErrorAlert';
import { FieldError } from './FieldError';

export interface FormErrorHandlerProps {
  error: TRPCClientError<any> | null;
  isLoading?: boolean;
  onErrorsChange?: (errors: Record<string, string[]> | null) => void;
  focusFirstError?: boolean;
}

export interface FormErrors {
  [key: string]: string[];
}

export function extractTRPCErrors(error: TRPCClientError<any> | null): FormErrors | null {
  if (!error) {
    return null;
  }

  try {
    const data = error.data as any;

    if (data?.code === 'BAD_REQUEST' && data?.zodError) {
      const errors: FormErrors = {};
      data.zodError.forEach((err: any) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return errors;
    }

    if (error.message) {
      return {
        general: [error.message],
      };
    }

    return null;
  } catch {
    return null;
  }
}

export const FormErrorHandler: React.FC<FormErrorHandlerProps> = ({
  error,
  onErrorsChange,
  focusFirstError = true,
}) => {
  const errors = useMemo(() => extractTRPCErrors(error), [error]);
  const firstErrorFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onErrorsChange?.(errors);
  }, [errors, onErrorsChange]);

  useEffect(() => {
    if (focusFirstError && errors && firstErrorFieldRef.current) {
      setTimeout(() => {
        firstErrorFieldRef.current?.focus();
        firstErrorFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [errors, focusFirstError]);

  if (!errors) {
    return null;
  }

  if (errors.general) {
    return (
      <ValidationErrorAlert
        message={errors.general?.[0] ?? 'حدث خطأ في النموذج'}
        details={Object.entries(errors)
          .filter(([field]) => field !== 'general')
          .flatMap(([field, messages]) =>
            messages.map((message) => ({ field, message, code: 'validation' }))
          )}
      />
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(errors).map(([field, messages]) => (
        <FieldError key={field} errors={messages} />
      ))}
    </div>
  );
};

export function useFormErrorHandler(
  error: TRPCClientError<any> | null,
  options?: {
    onErrorsChange?: (errors: FormErrors | null) => void;
    focusFirstError?: boolean;
  }
) {
  const errors = useMemo(() => extractTRPCErrors(error), [error]);

  useEffect(() => {
    options?.onErrorsChange?.(errors);
  }, [errors, options]);

  return {
    errors,
    hasErrors: !!errors && Object.keys(errors).length > 0,
    getFieldError: (fieldName: string): string | undefined => {
      return errors?.[fieldName]?.[0];
    },
    getFieldErrors: (fieldName: string): string[] => {
      return errors?.[fieldName] ?? [];
    },
  };
}

export interface FormWrapperProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: TRPCClientError<any> | null;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  focusFirstError?: boolean;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  onSubmit,
  error,
  isLoading = false,
  children,
  className = '',
  focusFirstError = true,
}) => {
  const [, setFormErrors] = React.useState<FormErrors | null>(null);

  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <FormErrorHandler
          error={error}
          isLoading={isLoading}
          onErrorsChange={setFormErrors}
          focusFirstError={focusFirstError}
        />
      )}
      {children}
    </form>
  );
};

export default FormErrorHandler;
