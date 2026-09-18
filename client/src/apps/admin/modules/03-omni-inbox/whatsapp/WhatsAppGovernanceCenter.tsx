import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Users } from 'lucide-react';
import { WhatsAppComplianceContent } from './WhatsAppCompliance';
import WhatsAppUserSubscriptionsPage from './WhatsAppUserSubscriptionsPage';

/** مركز الحوكمة: يقرن الامتثال والتدقيق بموافقات واتساب وانسحاباتها. */
export default function WhatsAppGovernanceCenter() {
  return (
    <DashboardLayout
      pageTitle="حوكمة واتساب"
      pageDescription="الامتثال والتدقيق والموافقات وإلغاء الاشتراك من مركز واحد"
    >
      <div className="container mx-auto w-full max-w-[1440px] py-3 sm:py-5" dir="rtl">
        <Tabs defaultValue="compliance" className="w-full">
          <div className="-mx-4 mb-4 border-y border-border/70 bg-background/95 px-4 py-2 sm:mx-0 sm:mb-5 sm:rounded-xl sm:border sm:px-2">
            <TabsList className="flex h-10 w-full min-w-0 gap-1 bg-muted/60 p-1 sm:w-fit sm:min-w-[25rem]">
              <TabsTrigger
                value="compliance"
                className="h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                الامتثال والتدقيق
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm"
              >
                <Users className="h-4 w-4" />
                الموافقات والانسحاب
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="compliance" className="mt-0">
            <WhatsAppComplianceContent />
          </TabsContent>
          <TabsContent value="subscriptions" className="mt-0">
            <WhatsAppUserSubscriptionsPage />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
