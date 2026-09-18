/**
 * useConfirmDialog Hook
 * Custom hook لإدارة حوار التأكيد
 */

import { useState } from 'react';

export interface UseConfirmDialogOptions {
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export interface UseConfirmDialogReturn {
  isOpen: boolean;
  isLoading: boolean;
  open: () => void;
  close: () => void;
  confirm: () => Promise<void>;
}

export function useConfirmDialog({
  onConfirm,
  title: _title,
  description: _description,
  confirmText: _confirmText = 'تأكيد',
  cancelText: _cancelText = 'إلغاء',
  variant: _variant = 'default',
}: UseConfirmDialogOptions): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const confirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      close();
    } catch (error) {
      console.error('Confirm dialog error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    isLoading,
    open,
    close,
    confirm,
  };
}
