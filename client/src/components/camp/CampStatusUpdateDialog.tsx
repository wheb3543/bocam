import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Users, Tent, Loader2 } from 'lucide-react';
import ResponsiveDialog from '@/components/ResponsiveDialog';
import CommentsSection from '@/components/CommentsSection';
import TasksSection from '@/components/TasksSection';
import AuditLogSection from '@/components/AuditLogSection';
import type { CampRegistration, TimeSlot, AvailableDate } from '@/types/camp';

interface CampStatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: CampRegistration | null;
  newStatus: string;
  onStatusChange: (status: string) => void;
  editedName: string;
  onNameChange: (name: string) => void;
  editedPhone: string;
  onPhoneChange: (phone: string) => void;
  attendanceDate: string;
  onAttendanceDateChange: (date: string) => void;
  preferredDate: string;
  onPreferredDateChange: (date: string) => void;
  preferredTimeSlot: TimeSlot;
  onPreferredTimeSlotChange: (slot: TimeSlot) => void;
  availableDates?: { dates?: AvailableDate[] };
  onUpdate: () => void;
  isUpdating: boolean;
  formatPhoneDisplay: (phone?: string) => string;
}

export default function CampStatusUpdateDialog({
  open,
  onOpenChange,
  registration,
  newStatus,
  onStatusChange,
  editedName,
  onNameChange,
  editedPhone,
  onPhoneChange,
  attendanceDate,
  onAttendanceDateChange,
  preferredDate,
  onPreferredDateChange,
  preferredTimeSlot,
  onPreferredTimeSlotChange,
  availableDates,
  onUpdate,
  isUpdating,
  formatPhoneDisplay,
}: CampStatusUpdateDialogProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="تحديث حالة التسجيل"
      description={`قم بتحديث حالة تسجيل المخيم لـ ${registration?.fullName}`}
      className="max-w-3xl"
    >
      {registration && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="info">معلومات التسجيل</TabsTrigger>
              <TabsTrigger value="comments">التعليقات</TabsTrigger>
              <TabsTrigger value="tasks">المهام</TabsTrigger>
              <TabsTrigger value="history">سجل التغييرات</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="info" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label>معلومات المسجل</Label>
                  <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPhoneDisplay(registration.phone)}</span>
                    </div>
                    {registration.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{registration.email}</span>
                      </div>
                    )}
                    {registration.age && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>العمر: {registration.age} سنة</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Tent className="h-4 w-4 text-muted-foreground" />
                      <span>{registration.campName || 'غير محدد'}</span>
                    </div>
                    {registration.medicalCondition && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">الحالة الطبية:</p>
                        <p>{registration.medicalCondition}</p>
                      </div>
                    )}
                    {registration.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">ملاحظات:</p>
                        <p>{registration.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الحالة الجديدة</Label>
                  <Select value={newStatus} onValueChange={onStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="contacted">تم التواصل</SelectItem>
                      <SelectItem value="no_answer">لم يرد</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="attended">حضر</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newStatus === 'confirmed' || newStatus === 'attended') && (
                  <>
                    <div className="space-y-2">
                      <Label>الاسم الكامل</Label>
                      <Input
                        value={editedName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
                        placeholder="الاسم الكامل"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      <Input
                        value={editedPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPhoneChange(e.target.value)}
                        placeholder="رقم الهاتف"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>موعد الحضور (تاريخ ووقت)</Label>
                      <Input
                        type="datetime-local"
                        value={attendanceDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAttendanceDateChange(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الموعد المفضل للحضور</Label>
                      {availableDates?.dates && availableDates.dates.length > 0 ? (
                        <>
                          <Select
                            value={preferredDate}
                            onValueChange={(v) => {
                              onPreferredDateChange(v);
                              onPreferredTimeSlotChange('');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التاريخ" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableDates.dates.map((date) => (
                                <SelectItem key={date.date} value={date.date || ''}>
                                  {date.date}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {preferredDate && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                type="button"
                                variant={preferredTimeSlot === 'morning' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onPreferredTimeSlotChange('morning')}
                              >
                                🌅 صباحي
                              </Button>
                              <Button
                                type="button"
                                variant={preferredTimeSlot === 'evening' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onPreferredTimeSlotChange('evening')}
                              >
                                🌆 مسائي
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          لا توجد مواعيد متاحة لهذا المخيم
                        </p>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="comments" className="mt-0">
                {registration.id && (
                  <CommentsSection entityType="campRegistration" entityId={registration.id} />
                )}
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                {registration.id && (
                  <TasksSection entityType="campRegistration" entityId={registration.id} />
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {registration.id && (
                  <AuditLogSection entityType="campRegistration" entityId={registration.id} />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          إلغاء
        </Button>
        <Button onClick={onUpdate} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري التحديث...
            </>
          ) : (
            'تحديث الحالة'
          )}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
