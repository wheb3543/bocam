interface AdminContentSkeletonProps {
  variant?: 'dashboard' | 'workspace';
}

/** هيكل تحميل محافظ على سياق لوحة الإدارة أثناء تحميل المسارات الكسولة. */
export default function AdminContentSkeleton({ variant = 'dashboard' }: AdminContentSkeletonProps) {
  const workspace = variant === 'workspace';

  return (
    <div
      className="min-h-screen bg-muted/40"
      dir="rtl"
      role="status"
      aria-label="جاري تحميل الصفحة"
    >
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-56 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card" />
        {workspace ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="h-96 animate-pulse rounded-2xl border border-border/70 bg-card" />
            <div className="space-y-4">
              <div className="h-16 animate-pulse rounded-2xl border border-border/70 bg-card" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-2xl border border-border/70 bg-card"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-border/70 bg-card"
              />
            ))}
          </div>
        )}
      </main>
      <span className="sr-only">جاري تحميل الصفحة</span>
    </div>
  );
}
