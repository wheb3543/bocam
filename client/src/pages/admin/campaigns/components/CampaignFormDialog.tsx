/**
 * CampaignFormDialog - حوار إنشاء/تعديل الحملة
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import CampaignLinksManager from '@/components/CampaignLinksManager';
import type { Campaign, CampaignFormData } from '../types/campaign.types';
import { platformOptions } from '../types/campaign.types';

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: CampaignFormData;
  onFormDataChange: (data: CampaignFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  selectedCampaign?: Campaign | null;
  onNameChange?: (value: string) => void;
  onSlugChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onTypeChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
  onPlannedBudgetChange?: (value: string) => void;
  onActualBudgetChange?: (value: string) => void;
  onTargetLeadsChange?: (value: string) => void;
  onTargetBookingsChange?: (value: string) => void;
  onTargetRevenueChange?: (value: string) => void;
  onTeamMembersChange?: (value: string) => void;
  onKpisChange?: (value: string) => void;
  onNotesChange?: (value: string) => void;
  onPlatformToggle?: (platform: string) => void;
  onNameBlur?: () => void;
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  selectedCampaign,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  onTypeChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onPlannedBudgetChange,
  onActualBudgetChange,
  onTargetLeadsChange,
  onTargetBookingsChange,
  onTargetRevenueChange,
  onTeamMembersChange,
  onKpisChange,
  onNotesChange,
  onPlatformToggle,
  onNameBlur,
}: CampaignFormDialogProps) {
  const handlePlatformToggle = (platform: string) => {
    if (onPlatformToggle) {
      onPlatformToggle(platform);
    } else {
      onFormDataChange({
        ...formData,
        platforms: formData.platforms.includes(platform)
          ? formData.platforms.filter((p) => p !== platform)
          : [...formData.platforms, platform],
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          onFormDataChange({
            name: '',
            slug: '',
            description: '',
            type: 'digital',
            status: 'draft',
            plannedBudget: '',
            actualBudget: '',
            targetLeads: '',
            targetBookings: '',
            targetRevenue: '',
            startDate: '',
            endDate: '',
            platforms: [],
            teamMembers: '',
            kpis: '',
            notes: '',
          });
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'تعديل الحملة' : 'إضافة حملة جديدة'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'تحديث معلومات الحملة التسويقية'
              : 'أدخل معلومات الحملة التسويقية الجديدة'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم الحملة *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onNameChange?.(e.target.value) || onFormDataChange({ ...formData, name: e.target.value })}
                  onBlur={onNameBlur}
                  required
                />
              </div>
              {mode === 'create' && (
                <div className="grid gap-2">
                  <Label htmlFor="slug">الرابط المختصر *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => onSlugChange?.(e.target.value) || onFormDataChange({ ...formData, slug: e.target.value })}
                    required
                    placeholder="campaign-name"
                    dir="ltr"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onDescriptionChange?.(e.target.value) || onFormDataChange({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>النوع *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => onTypeChange?.(value) || onFormDataChange({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">رقمية</SelectItem>
                    <SelectItem value="field">ميدانية</SelectItem>
                    <SelectItem value="awareness">توعوية</SelectItem>
                    <SelectItem value="mixed">مختلطة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>الحالة *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => onStatusChange?.(value) || onFormDataChange({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="paused">متوقفة</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                    <SelectItem value="cancelled">ملغاة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => onStartDateChange?.(e.target.value) || onFormDataChange({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => onEndDateChange?.(e.target.value) || onFormDataChange({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plannedBudget">الميزانية المخططة (ريال)</Label>
                <Input
                  id="plannedBudget"
                  type="number"
                  value={formData.plannedBudget}
                  onChange={(e) => onPlannedBudgetChange?.(e.target.value) || onFormDataChange({ ...formData, plannedBudget: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="actualBudget">الميزانية الفعلية (ريال)</Label>
                <Input
                  id="actualBudget"
                  type="number"
                  value={formData.actualBudget}
                  onChange={(e) => onActualBudgetChange?.(e.target.value) || onFormDataChange({ ...formData, actualBudget: e.target.value })}
                />
              </div>
            </div>

            {/* Targets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="targetLeads">هدف العملاء</Label>
                <Input
                  id="targetLeads"
                  type="number"
                  value={formData.targetLeads}
                  onChange={(e) => onTargetLeadsChange?.(e.target.value) || onFormDataChange({ ...formData, targetLeads: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetBookings">هدف الحجوزات</Label>
                <Input
                  id="targetBookings"
                  type="number"
                  value={formData.targetBookings}
                  onChange={(e) => onTargetBookingsChange?.(e.target.value) || onFormDataChange({ ...formData, targetBookings: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetRevenue">هدف الإيرادات (ريال)</Label>
                <Input
                  id="targetRevenue"
                  type="number"
                  value={formData.targetRevenue}
                  onChange={(e) => onTargetRevenueChange?.(e.target.value) || onFormDataChange({ ...formData, targetRevenue: e.target.value })}
                />
              </div>
            </div>

            {/* Platforms */}
            <div className="grid gap-2">
              <Label>المنصات</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
                {platformOptions.map((platform) => (
                  <div
                    key={platform.value}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                      formData.platforms.includes(platform.value)
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-card border hover:bg-muted'
                    }`}
                    onClick={() => handlePlatformToggle(platform.value)}
                  >
                    <span className="text-sm">{platform.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team and KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teamMembers">الفريق المسؤول</Label>
                <Input
                  id="teamMembers"
                  value={formData.teamMembers}
                  onChange={(e) => onTeamMembersChange?.(e.target.value) || onFormDataChange({ ...formData, teamMembers: e.target.value })}
                  placeholder="أسماء أعضاء الفريق"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kpis">مؤشرات الأداء (KPIs)</Label>
                <Input
                  id="kpis"
                  value={formData.kpis}
                  onChange={(e) => onKpisChange?.(e.target.value) || onFormDataChange({ ...formData, kpis: e.target.value })}
                  placeholder="CTR, CPA, ROAS..."
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => onNotesChange?.(e.target.value) || onFormDataChange({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            {/* Campaign Links - Only show when editing */}
            {mode === 'edit' && selectedCampaign && (
              <div className="border-t pt-4 mt-2">
                <CampaignLinksManager
                  campaignId={selectedCampaign.id}
                  campaignName={selectedCampaign.name}
                  inline
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {mode === 'edit' ? 'حفظ التغييرات' : 'إنشاء الحملة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
