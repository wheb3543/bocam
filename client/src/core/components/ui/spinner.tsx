import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Spinner({
  className,
  'aria-busy': ariaBusy = 'true',
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="جاري التحميل"
      aria-busy={ariaBusy}
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
