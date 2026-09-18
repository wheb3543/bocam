/**
 * ActionButtons Component
 * مكون أزرار الإجراءات العام قابل لإعادة الاستخدام
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Eye, Copy, Download, Share2 } from 'lucide-react';
import type { ReactNode } from 'react';

export interface Action {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  showInDropdown?: boolean;
}

export interface ActionButtonsProps {
  actions: Action[];
  maxVisible?: number;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ActionButtons({ actions, maxVisible = 2, size = 'sm' }: ActionButtonsProps) {
  const visibleActions = actions.slice(0, maxVisible);
  const dropdownActions = actions.slice(maxVisible);

  return (
    <div className="flex items-center gap-2">
      {visibleActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'ghost'}
          size={size}
          onClick={action.onClick}
          disabled={action.disabled}
          className="h-8 w-8 p-0"
        >
          {action.icon}
        </Button>
      ))}

      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={size} className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {dropdownActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.variant === 'destructive' ? 'text-red-600' : ''}
              >
                {action.icon && <span className="ml-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// أزرار الإجراءات الشائعة الجاهزة
export const CommonActions = {
  edit: (onClick: () => void) => ({
    label: 'تعديل',
    icon: <Pencil className="w-4 h-4" />,
    onClick,
    variant: 'ghost' as const,
  }),

  delete: (onClick: () => void) => ({
    label: 'حذف',
    icon: <Trash2 className="w-4 h-4" />,
    onClick,
    variant: 'destructive' as const,
  }),

  view: (onClick: () => void) => ({
    label: 'عرض',
    icon: <Eye className="w-4 h-4" />,
    onClick,
    variant: 'ghost' as const,
  }),

  copy: (onClick: () => void) => ({
    label: 'نسخ',
    icon: <Copy className="w-4 h-4" />,
    onClick,
    variant: 'ghost' as const,
  }),

  download: (onClick: () => void) => ({
    label: 'تحميل',
    icon: <Download className="w-4 h-4" />,
    onClick,
    variant: 'ghost' as const,
  }),

  share: (onClick: () => void) => ({
    label: 'مشاركة',
    icon: <Share2 className="w-4 h-4" />,
    onClick,
    variant: 'ghost' as const,
  }),
};
