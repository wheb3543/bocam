import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * رأس موحد لمساحات العمل الإدارية.
 * يحافظ على تسلسل ثابت: سياق اختياري، عنوان، وصف، حالة، ثم إجراءات.
 */
export default function AdminPageHeader({
  title,
  description,
  eyebrow,
  status,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/80 bg-surface-raised px-4 py-5 shadow-sm sm:px-6 sm:py-6',
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && (
            <p className="text-sm font-semibold text-brand" aria-label="سياق الصفحة">
              {eyebrow}
            </p>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {(status || actions) && (
          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            {status}
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
