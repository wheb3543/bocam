import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export interface ValidationErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

interface ValidationErrorAlertProps {
  message: string;
  details?: ValidationErrorDetail[];
  onClose?: () => void;
  variant?: 'default' | 'destructive';
  className?: string;
}

export function ValidationErrorAlert({
  message,
  details = [],
  onClose,
  variant = 'destructive',
  className = '',
}: ValidationErrorAlertProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Alert variant={variant} className={`relative ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle className="text-right">{message}</AlertTitle>
        {details.length > 0 && (
          <AlertDescription className="mt-2 text-right">
            <ul className="space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="text-sm">
                  <span className="font-semibold">{detail.field}:</span> {detail.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        )}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 left-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}

export function ValidationErrorMessage({
  message,
  onClose,
  className = '',
}: {
  message: string;
  onClose?: () => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Alert variant="destructive" className={`relative ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-right">{message}</AlertDescription>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 left-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}

export function ValidationErrorList({
  details,
  className = '',
}: {
  details: ValidationErrorDetail[];
  className?: string;
}) {
  if (details.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 rounded-md bg-red-50 p-4 ${className}`}>
      <p className="text-sm font-semibold text-red-900 text-right">يرجى تصحيح الأخطاء التالية:</p>
      <ul className="space-y-1">
        {details.map((detail, index) => (
          <li key={index} className="text-sm text-red-800 text-right">
            <span className="font-semibold">{detail.field}:</span> {detail.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
