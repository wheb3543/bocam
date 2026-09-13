import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, HeartPulse, RadioTower, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { WhatsAppConnectionContent } from './WhatsAppConnectionPage';
import WhatsAppAccountHealthPage from './WhatsAppAccountHealthPage';
import WhatsAppPhoneQualityPage from './WhatsAppPhoneQualityPage';
import WhatsAppWebhookInspectorPage from './WhatsAppWebhookInspectorPage';
import { WhatsAppOperationsSSEProvider } from '@/hooks/useWhatsAppOperationsSSE';
import { WhatsAppSSEMonitor } from '@/components/WhatsAppSSEMonitor';

/** مركز العمليات الفنية؛ يجمع الجاهزية والتنبيهات والجودة والتشخيص في سياق واحد. */
export default function WhatsAppOperationsCenter() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const getTabFromSearch = (searchValue: string) => {
    const tab = new URLSearchParams(searchValue).get('tab');
    return ['connection', 'health', 'quality', 'webhooks'].includes(tab || '')
      ? tab!
      : 'connection';
  };
  const [activeTab, setActiveTab] = useState(() => getTabFromSearch(search));

  useEffect(() => {
    setActiveTab(getTabFromSearch(search));
  }, [search]);

  const handleTabChange = (nextTab: string) => {
    const category = new URLSearchParams(search).get('category');
    setActiveTab(nextTab);
    navigate(
      nextTab === 'webhooks' && category
        ? `/admin/whatsapp/operations?tab=webhooks&category=${encodeURIComponent(category)}`
        : `/admin/whatsapp/operations?tab=${nextTab}`
    );
  };

  return (
    <DashboardLayout
      pageTitle="عمليات واتساب الفنية"
      pageDescription="اتصال Cloud API وصحة الحساب وجودة الرقم وأحداث Webhook"
    >
      <WhatsAppOperationsSSEProvider>
        <div className="container mx-auto w-full max-w-[1440px] py-3 sm:py-5" dir="rtl">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div
              className="-mx-4 mb-3 border-y border-border/70 bg-background/95 px-4 py-2 sm:mx-0 sm:mb-5 sm:rounded-xl sm:border sm:px-2"
              aria-label="تبويبات عمليات واتساب"
            >
              <TabsList className="flex h-10 w-full min-w-0 gap-1 bg-muted/60 p-1 sm:w-max sm:min-w-max">
                <TabsTrigger
                  value="connection"
                  className="h-8 min-w-0 flex-1 gap-1 px-1.5 text-[11px] sm:min-w-36 sm:flex-none sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  الاتصال
                </TabsTrigger>
                <TabsTrigger
                  value="health"
                  className="h-8 min-w-0 flex-1 gap-1 px-1.5 text-[11px] sm:min-w-36 sm:flex-none sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <HeartPulse className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  صحة الحساب
                </TabsTrigger>
                <TabsTrigger
                  value="quality"
                  className="h-8 min-w-0 flex-1 gap-1 px-1.5 text-[11px] sm:min-w-36 sm:flex-none sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  جودة الرقم
                </TabsTrigger>
                <TabsTrigger
                  value="webhooks"
                  className="h-8 min-w-0 flex-1 gap-1 px-1.5 text-[11px] sm:min-w-36 sm:flex-none sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <RadioTower className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  التشخيص
                </TabsTrigger>
              </TabsList>
            </div>
            <WhatsAppSSEMonitor />
            <TabsContent value="connection" className="mt-0">
              <WhatsAppConnectionContent />
            </TabsContent>
            <TabsContent value="health" className="mt-0">
              <WhatsAppAccountHealthPage />
            </TabsContent>
            <TabsContent value="quality" className="mt-0">
              <WhatsAppPhoneQualityPage />
            </TabsContent>
            <TabsContent value="webhooks" className="mt-0">
              <WhatsAppWebhookInspectorPage />
            </TabsContent>
          </Tabs>
        </div>
      </WhatsAppOperationsSSEProvider>
    </DashboardLayout>
  );
}
