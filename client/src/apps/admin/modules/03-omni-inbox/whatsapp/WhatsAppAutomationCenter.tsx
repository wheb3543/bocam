import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MessageSquare } from 'lucide-react';
import { WhatsAppAutoReplyContent } from './WhatsAppAutoReply';
import { WhatsAppAppointmentsContent } from './WhatsAppAppointments';

/** مركز الأتمتة: يجمع القواعد وسجل التنفيذ من دون تعديل إجراءات الإرسال أو التذكيرات. */
export default function WhatsAppAutomationCenter() {
  return (
    <DashboardLayout
      pageTitle="أتمتة واتساب"
      pageDescription="إدارة قواعد الرد التلقائي وسجل الإشعارات والتذكيرات من مركز واحد"
    >
      <div className="container mx-auto w-full max-w-[1440px] py-3 sm:py-5" dir="rtl">
        <Tabs defaultValue="rules" className="w-full">
          <div className="-mx-4 mb-4 border-y border-border/70 bg-background/95 px-4 py-2 sm:mx-0 sm:mb-5 sm:rounded-xl sm:border sm:px-2">
            <TabsList className="flex h-10 w-full min-w-0 gap-1 bg-muted/60 p-1 sm:w-fit sm:min-w-[31rem]">
              <TabsTrigger
                value="rules"
                className="h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm"
              >
                <MessageSquare className="h-4 w-4" />
                قواعد الرد التلقائي
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="h-8 min-w-0 flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm"
              >
                <Bell className="h-4 w-4" />
                الإشعارات والتذكيرات
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="rules" className="mt-0">
            <WhatsAppAutoReplyContent />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0">
            <WhatsAppAppointmentsContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
