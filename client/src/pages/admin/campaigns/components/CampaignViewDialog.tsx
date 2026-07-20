/**
 * CampaignViewDialog - حوار عرض تفاصيل الحملة
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Megaphone, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import CampaignLinksManager from '@/components/CampaignLinksManager';
import type { Campaign } from '../types/campaign.types';
import {
  getCampaignTypeLabel,
  getCampaignStatusLabel,
  getStatusColor,
  calculateProgress,
} from '../utils/campaignHelpers';
import { platformOptions } from '../types/campaign.types';

interface CampaignViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onEdit: (campaign: Campaign) => void;
}

export function CampaignViewDialog({
  open,
  onOpenChange,
  campaign,
  onEdit,
}: CampaignViewDialogProps) {
  if (!campaign) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            تفاصيل الحملة
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{campaign.name}</h3>
              {campaign.description && (
                <p className="text-muted-foreground mt-1">{campaign.description}</p>
              )}
            </div>
            <Badge className={getStatusColor(campaign.status)}>
              {getCampaignStatusLabel(campaign.status)}
            </Badge>
          </div>

          {/* Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">تقدم الحملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>العملاء المستهدفين</span>
                  <span>
                    {campaign.actualLeads || 0} / {campaign.targetLeads || 0}
                  </span>
                </div>
                <Progress value={calculateProgress(campaign)} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">النوع</Label>
              <p className="font-medium">{getCampaignTypeLabel(campaign.type)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">الرابط</Label>
              <p className="font-medium text-primary" dir="ltr">
                {campaign.slug}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">تاريخ البدء</Label>
              <p className="font-medium">
                {campaign.startDate
                  ? format(new Date(campaign.startDate), 'dd MMMM yyyy', {
                      locale: ar,
                    })
                  : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">تاريخ الانتهاء</Label>
              <p className="font-medium">
                {campaign.endDate
                  ? format(new Date(campaign.endDate), 'dd MMMM yyyy', { locale: ar })
                  : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">الميزانية المخططة</Label>
              <p className="font-medium">
                {campaign.plannedBudget?.toLocaleString() || 0} ريال
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">الميزانية الفعلية</Label>
              <p className="font-medium">
                {campaign.actualBudget?.toLocaleString() || 0} ريال
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">هدف الحجوزات</Label>
              <p className="font-medium">{campaign.targetBookings || 0}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">هدف الإيرادات</Label>
              <p className="font-medium">
                {campaign.targetRevenue?.toLocaleString() || 0} ريال
              </p>
            </div>
          </div>

          {/* Platforms */}
          {campaign.platforms && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">المنصات</Label>
              <div className="flex flex-wrap gap-2">
                {campaign.platforms.split(',').map((platform: string) => (
                  <Badge key={platform} variant="outline">
                    {platformOptions.find((p: { value: string; label: string }) => p.value === platform)?.label || platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {campaign.teamMembers && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">الفريق المسؤول</Label>
              <p>{campaign.teamMembers}</p>
            </div>
          )}

          {/* KPIs */}
          {campaign.kpis && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">مؤشرات الأداء</Label>
              <p>{campaign.kpis}</p>
            </div>
          )}

          {/* Notes */}
          {campaign.notes && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">ملاحظات</Label>
              <p className="text-foreground">{campaign.notes}</p>
            </div>
          )}

          {/* Campaign Links */}
          <div className="border-t pt-4">
            <CampaignLinksManager
              campaignId={campaign.id}
              campaignName={campaign.name}
              readOnly
              inline
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                onEdit(campaign);
              }}
            >
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              إغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
