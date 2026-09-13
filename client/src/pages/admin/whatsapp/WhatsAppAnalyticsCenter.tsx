import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign } from 'lucide-react';
import { WhatsAppAnalyticsContent } from './WhatsAppAnalytics';
import { WhatsAppCostsContent } from './WhatsAppCostsPage';

/** مركز موحد للبيانات الحية الخاصة بأداء واتساب وتكاليفه. */
export default function WhatsAppAnalyticsCenter() {
  return (
    <DashboardLayout
      pageTitle="تحليلات واتساب وتكاليفه"
      pageDescription="مؤشرات ورسوم وتكاليف قائمة على سجلات القناة الفعلية"
    >
      <div className="container mx-auto w-full max-w-[1440px] py-3 sm:py-5" dir="rtl">
        <Tabs defaultValue="analytics" className="w-full">
          <div className="-mx-4 mb-4 border-y border-border/70 bg-background/95 px-4 py-2 sm:mx-0 sm:mb-5 sm:rounded-xl sm:border sm:px-2">
            <TabsList className="flex h-10 w-full min-w-0 gap-1 bg-muted/60 p-1 sm:w-fit sm:min-w-[21rem]">
              <TabsTrigger
                value="analytics"
                className="h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                الأداء
              </TabsTrigger>
              <TabsTrigger
                value="costs"
                className="h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm"
              >
                <DollarSign className="h-4 w-4" />
                التكاليف
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="analytics" className="mt-0">
            <WhatsAppAnalyticsContent />
          </TabsContent>
          <TabsContent value="costs" className="mt-0">
            <WhatsAppCostsContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
