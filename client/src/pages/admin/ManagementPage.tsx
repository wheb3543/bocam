import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emitToastHash } from '@/lib/toastHashRouter';
import { trpc } from '@/lib/api/trpc';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { OffersManagement } from '@/components/offer';
import CampsManagement from '@/components/camp/CampsManagement';
import DoctorsManagement from '@/components/DoctorsManagement';
import DepartmentsTab from '@/components/departments/DepartmentsTab';

export default function ManagementPage() {
  const { user, loading, error } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('departments');

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
    <DashboardLayout
      pageTitle="الإدارة"
      pageDescription="إدارة الأقسام والعيادات والأطباء والعروض والمخيمات"
    >
      {/* Main Content */}
      <main className="container h-[calc(100dvh-4.25rem)] min-h-0 overflow-hidden py-3 sm:py-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex h-full min-h-0 flex-col gap-3"
        >
          <TabsList className="mx-auto grid w-full max-w-4xl shrink-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="departments">الأقسام الطبية</TabsTrigger>
            <TabsTrigger value="doctors">إدارة الأطباء</TabsTrigger>
            <TabsTrigger value="visitingDoctors">الأطباء الزائرين</TabsTrigger>
            <TabsTrigger value="offers">إدارة العروض</TabsTrigger>
            <TabsTrigger value="camps">إدارة المخيمات</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="mt-0 min-h-0 flex-1">
            <DepartmentsTab />
          </TabsContent>

          <TabsContent value="doctors" className="mt-0 min-h-0 flex-1">
            <DoctorsManagement doctorType="regular" />
          </TabsContent>

          <TabsContent value="visitingDoctors" className="mt-0 min-h-0 flex-1">
            <DoctorsManagement doctorType="visiting" />
          </TabsContent>

          <TabsContent value="offers" className="mt-0 min-h-0 flex-1">
            <OffersManagement />
          </TabsContent>

          <TabsContent value="camps" className="mt-0 min-h-0 flex-1">
            <CampsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
