/**
 * CRM Records Card Component
 * مكون بطاقة سجلات CRM
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Bell } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CustomerRecords, Appointment } from './types';

interface CrmRecordsCardProps {
  customerRecords: CustomerRecords;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  customerName?: string | null;
  onSendReminder?: (
    appointmentId: number,
    phone: string,
    patientName: string,
    doctorName: string,
    appointmentTime: Date
  ) => void;
  onSendFollowup?: (
    appointmentId: number,
    phone: string,
    patientName: string,
    doctorName: string,
    department: string
  ) => void;
  isSendingReminder?: boolean;
  isSendingFollowup?: boolean;
}

export default function CrmRecordsCard({
  customerRecords,
  isOpen,
  onOpenChange,
  phoneNumber,
  customerName,
  onSendReminder,
  onSendFollowup,
  isSendingReminder = false,
  isSendingFollowup = false,
}: CrmRecordsCardProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer p-2">
          <p className="text-xs font-semibold text-muted-foreground">سجلات CRM</p>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        {/* Appointments Card */}
        {customerRecords.appointments.length > 0 && (
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📅</span>
              <p className="text-xs font-semibold text-foreground">
                المواعيد الطبية ({customerRecords.appointments.length})
              </p>
            </div>
            <div className="space-y-1.5">
              {customerRecords.appointments.slice(0, 3).map((apt: Appointment) => (
                <div
                  key={apt.id}
                  className="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-between"
                >
                  <span className="truncate flex-1">{apt.fullName}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] flex-shrink-0">
                      {apt.status}
                    </Badge>
                    {onSendReminder && apt.appointmentTime && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          apt.id && onSendReminder(
                            apt.id,
                            phoneNumber,
                            apt.fullName || customerName || '',
                            apt.doctorName || '',
                            new Date(apt.appointmentTime as string | Date)
                          )
                        }
                        title="إرسال تذكير"
                        disabled={isSendingReminder}
                      >
                        {isSendingReminder ? (
                          <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                        ) : (
                          <Bell className="h-3 w-3 text-blue-600" />
                        )}
                      </Button>
                    )}
                    {onSendFollowup && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          apt.id && onSendFollowup(
                            apt.id,
                            phoneNumber,
                            apt.fullName || customerName || '',
                            apt.doctorName || '',
                            apt.department ?? ''
                          )
                        }
                        title="إرسال متابعة"
                        disabled={isSendingFollowup}
                      >
                        {isSendingFollowup ? (
                          <Loader2 className="h-3 w-3 text-green-600 animate-spin" />
                        ) : (
                          <MessageSquare className="h-3 w-3 text-green-600" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {customerRecords.appointments.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{customerRecords.appointments.length - 3} مواعيد أخرى
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Leads Card */}
        {customerRecords.leads.length > 0 && (
          <Card className="p-3 sm:p-4 border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👤</span>
              <p className="text-xs font-semibold text-foreground">
                العملاء المحتملين ({customerRecords.leads.length})
              </p>
            </div>
            <div className="space-y-1.5">
              {customerRecords.leads.slice(0, 2).map((lead) => (
                <div
                  key={lead.id}
                  className="text-xs p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded flex items-center justify-between"
                >
                  <span className="truncate flex-1">{lead.fullName}</span>
                  <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
                    {lead.status}
                  </Badge>
                </div>
              ))}
              {customerRecords.leads.length > 2 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{customerRecords.leads.length - 2} عملاء آخرين
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Offers Card */}
        {customerRecords.offers.length > 0 && (
          <Card className="p-3 sm:p-4 border-l-4 border-l-green-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏥</span>
              <p className="text-xs font-semibold text-foreground">
                العروض الطبية ({customerRecords.offers.length})
              </p>
            </div>
            <div className="space-y-1.5">
              {customerRecords.offers.slice(0, 2).map((offer) => (
                <div
                  key={offer.id}
                  className="text-xs p-2 bg-green-50 dark:bg-green-900/20 rounded flex items-center justify-between"
                >
                  <span className="truncate flex-1">{offer.fullName}</span>
                  <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
                    {offer.status}
                  </Badge>
                </div>
              ))}
              {customerRecords.offers.length > 2 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{customerRecords.offers.length - 2} عروض أخرى
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Camps Card */}
        {customerRecords.camps.length > 0 && (
          <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏕️</span>
              <p className="text-xs font-semibold text-foreground">
                تسجيلات المخيمات ({customerRecords.camps.length})
              </p>
            </div>
            <div className="space-y-1.5">
              {customerRecords.camps.slice(0, 2).map((camp) => (
                <div
                  key={camp.id}
                  className="text-xs p-2 bg-purple-50 dark:bg-purple-900/20 rounded flex items-center justify-between"
                >
                  <span className="truncate flex-1">{camp.fullName}</span>
                  <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
                    {camp.status}
                  </Badge>
                </div>
              ))}
              {customerRecords.camps.length > 2 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{customerRecords.camps.length - 2} تسجيلات أخرى
                </p>
              )}
            </div>
          </Card>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
