import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import { trpc } from '@/lib/api/trpc';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OffersManagement from '@/components/offer/OffersManagement';
import CampsManagement from '@/components/camp/CampsManagement';
import DoctorsManagement from '@/components/DoctorsManagement';

export default function ManagementPage() {
  const { user, loading, error } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('offers');

  const _logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم تسجيل الخروج بنجاح',
        description: 'تمت إعادة توجيهك إلى الصفحة الرئيسية.',
        redirect: '/',
      });
      setLocation('/');
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !user || user.role !== 'admin') {
    setLocation('/unauthorized');
    return null;
  }

  return (
    <DashboardLayout pageTitle="الإدارة" pageDescription="إدارة العروض والمخيمات والأطباء">
      {/* Main Content */}
      <main className="container h-[calc(100dvh-4.25rem)] min-h-0 overflow-hidden py-3 sm:py-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex h-full min-h-0 flex-col gap-3"
        >
          <TabsList className="mx-auto grid w-full max-w-2xl shrink-0 grid-cols-3">
            <TabsTrigger value="offers">إدارة العروض</TabsTrigger>
            <TabsTrigger value="camps">إدارة المخيمات</TabsTrigger>
            <TabsTrigger value="doctors">إدارة الأطباء</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="mt-0 min-h-0 flex-1">
            <OffersManagement />
          </TabsContent>

          <TabsContent value="camps" className="mt-0 min-h-0 flex-1">
            <CampsManagement />
          </TabsContent>

          <TabsContent value="doctors" className="mt-0 min-h-0 flex-1">
            <DoctorsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
