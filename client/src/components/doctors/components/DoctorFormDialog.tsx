/**
 * DoctorFormDialog - حوار إضافة/تعديل الطبيب
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, Edit, Plus } from 'lucide-react';
import ImageUpload from '@/components/form/ImageUpload';
import type { DoctorFormData } from '../types/doctor.types';

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: DoctorFormData;
  onFormDataChange: (data: DoctorFormData) => void;
  onSubmit: () => void;
  isPending: boolean;
  onNameChange?: (value: string) => void;
}

export function DoctorFormDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  onNameChange,
}: DoctorFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${mode === 'edit' ? 'bg-blue-50' : 'bg-emerald-50'}`}
            >
              {mode === 'edit' ? (
                <Edit className="h-4 w-4 text-blue-600" />
              ) : (
                <Plus className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            {mode === 'edit' ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'قم بتعديل بيانات الطبيب في النموذج أدناه'
              : 'أدخل بيانات الطبيب الجديد في النموذج أدناه'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* القسم الأول: المعلومات الأساسية */}
          <div className="space-y-1 mb-4">
            <h4 className="text-sm font-semibold text-foreground">المعلومات الأساسية</h4>
            <div className="h-px bg-muted" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="name"
              >
                الاسم *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  onFormDataChange({ ...formData, name: e.target.value });
                  onNameChange?.(e.target.value);
                }}
                placeholder="د. أحمد محمد"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="slug"
              >
                الرابط (Slug) *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => onFormDataChange({ ...formData, slug: e.target.value })}
                placeholder="dr-ahmed-mohamed"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="specialty"
              >
                التخصص *
              </Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => onFormDataChange({ ...formData, specialty: e.target.value })}
                placeholder="أخصائي القلب والأوعية الدموية"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="experience"
              >
                سنوات الخبرة
              </Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => onFormDataChange({ ...formData, experience: e.target.value })}
                placeholder="15 سنة"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-right block text-xs font-medium text-muted-foreground">
              صورة الطبيب
            </Label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => onFormDataChange({ ...formData, image: url })}
              folder="doctors"
              placeholder="اسحب صورة الطبيب هنا أو اضغط للاختيار"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-right block text-xs font-medium text-muted-foreground"
              htmlFor="bio"
            >
              نبذة عن الطبيب
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => onFormDataChange({ ...formData, bio: e.target.value })}
              placeholder="نبذة مختصرة عن الطبيب وخبراته..."
              rows={3}
            />
          </div>

          {/* القسم الثاني: التفاصيل */}
          <div className="space-y-1 mb-4 mt-6">
            <h4 className="text-sm font-semibold text-foreground">التفاصيل والإعدادات</h4>
            <div className="h-px bg-muted" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="languages"
              >
                اللغات
              </Label>
              <Input
                id="languages"
                value={formData.languages}
                onChange={(e) => onFormDataChange({ ...formData, languages: e.target.value })}
                placeholder="العربية، الإنجليزية"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="consultationFee"
              >
                رسوم الاستشارة
              </Label>
              <Input
                id="consultationFee"
                value={formData.consultationFee}
                onChange={(e) => onFormDataChange({ ...formData, consultationFee: e.target.value })}
                placeholder="200 ريال"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-right block text-xs font-medium text-muted-foreground"
              htmlFor="procedures"
            >
              الإجراءات المتاحة (فصل بفاصلة)
            </Label>
            <Textarea
              id="procedures"
              value={formData.procedures}
              onChange={(e) => onFormDataChange({ ...formData, procedures: e.target.value })}
              placeholder="مثال: كشف عام, تخطيط قلب, إيكو على القلب"
              rows={2}
            />
            <p className="text-[11px] text-muted-foreground">
              سيتم عرضها في نموذج الحجز كخيارات للمريض
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="isVisiting"
              >
                طبيب زائر
              </Label>
              <Select
                value={formData.isVisiting}
                onValueChange={(value: 'yes' | 'no') =>
                  onFormDataChange({ ...formData, isVisiting: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">لا - مقيم</SelectItem>
                  <SelectItem value="yes">نعم - زائر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="available"
              >
                الحالة
              </Label>
              <Select
                value={formData.available}
                onValueChange={(value: 'yes' | 'no') =>
                  onFormDataChange({ ...formData, available: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">متاح للحجز</SelectItem>
                  <SelectItem value="no">غير متاح</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : mode === 'edit' ? (
              'حفظ التعديلات'
            ) : (
              'إضافة الطبيب'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
