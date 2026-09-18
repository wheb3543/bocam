import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, FileText } from 'lucide-react';
import WhatsAppBroadcast from './WhatsAppBroadcast';
import { WhatsAppTemplatesContent } from './WhatsAppTemplatesPage';

/** مركز الحملات: يجمع البث ومكتبة القوالب في نقطة دخول واحدة من دون تغيير عقود الإرسال. */
export default function WhatsAppCampaignCenter() {
  return (
    <DashboardLayout
      pageTitle="الحملات والقوالب"
      pageDescription="إدارة البث والقوالب المعتمدة من Meta من مركز واحد"
    >
      <div className="container mx-auto w-full max-w-[1440px] py-3 sm:py-5" dir="rtl">
        <Tabs defaultValue="campaigns" className="w-full">
          <div className="-mx-4 mb-4 border-y border-border/70 bg-background/95 px-4 py-2 sm:mx-0 sm:mb-5 sm:rounded-xl sm:border sm:px-2">
            <TabsList className="flex h-10 w-full min-w-0 gap-1 bg-muted/60 p-1 sm:w-fit sm:min-w-[25rem]">
              <TabsTrigger
                value="campaigns"
                className="h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm"
              >
                <Radio className="h-4 w-4" />
                إدارة البث
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm"
              >
                <FileText className="h-4 w-4" />
                مكتبة القوالب
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="campaigns" className="mt-0">
            <WhatsAppBroadcast />
          </TabsContent>
          <TabsContent value="templates" className="mt-0">
            <WhatsAppTemplatesContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
