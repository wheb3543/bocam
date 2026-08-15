/**
 * Camp Form Dialog Component
 * مكون حوار نموذج المخيم
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit, Plus } from 'lucide-react';
import ImageUpload from '@/components/form/ImageUpload';
import { useSlugGenerator } from '@/hooks/data/useSlugGenerator';
import type { Camp, CampFormData } from './types';

interface CampFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCamp: Camp | null;
  formData: CampFormData;
  onFormDataChange: (data: CampFormData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function CampFormDialog({
  isOpen,
  onOpenChange,
  editingCamp,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
}: CampFormDialogProps) {
  // Slug auto-generation hook
  const { autoGenerateSlug, resetManualEdit } = useSlugGenerator(
    (slug) => onFormDataChange({ ...formData, slug }),
    { isEditing: !!editingCamp }
  );

  const handleNameChange = (value: string) => {
    onFormDataChange({ ...formData, name: value });
    autoGenerateSlug(value);
  };

  const handleReset = () => {
    onFormDataChange({
      name: '',
      slug: '',
      description: '',
      location: '',
      imageUrl: '',
      isActive: true,
      startDate: '',
      endDate: '',
      freeOffers: '',
      discountedOffers: '',
      availableProcedures: '',
      galleryImages: '',
      morningTime: '',
      eveningTime: '',
      dailyCapacity: '',
    });
    resetManualEdit();
  };

  const isFormValid = formData.name && formData.slug;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${editingCamp ? 'bg-blue-50' : 'bg-emerald-50'}`}
            >
              {editingCamp ? (
                <Edit className="h-4 w-4 text-blue-600" />
              ) : (
                <Plus className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            {editingCamp ? 'تعديل المخيم' : 'إضافة مخيم جديد'}
          </DialogTitle>
          <DialogDescription>
            {editingCamp ? 'قم بتعديل بيانات المخيم' : 'أدخل بيانات المخيم الجديد'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* المعلومات الأساسية */}
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
                اسم المخيم *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="مثال: مخيم الجراحة العامة"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="slug"
              >
                الرابط (slug) *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => onFormDataChange({ ...formData, slug: e.target.value })}
                placeholder="مثال: surgery-camp"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-right block text-xs font-medium text-muted-foreground"
              htmlFor="description"
            >
              الوصف
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="وصف تفصيلي للمخيم..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-right block text-xs font-medium text-muted-foreground">
              صورة المخيم
            </Label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => onFormDataChange({ ...formData, imageUrl: url })}
              folder="camps"
              placeholder="اسحب صورة المخيم هنا أو اضغط للاختيار"
            />
          </div>

          {/* تفاصيل المخيم */}
          <div className="space-y-1 mb-4 mt-6">
            <h4 className="text-sm font-semibold text-foreground">تفاصيل المخيم</h4>
            <div className="h-px bg-muted" />
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-right block text-xs font-medium text-muted-foreground"
              htmlFor="freeOffers"
            >
              العروض المجانية
            </Label>
            <Textarea
              id="freeOffers"
              value={formData.freeOffers}
              onChange={(e) => onFormDataChange({ ...formData, freeOffers: e.target.value })}
              placeholder="أدخل العروض المجانية (كل عرض في سطر جديد)"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-right block text-xs font-medium text-muted-foreground"
              htmlFor="discountedOffers"
            >
              العروض المخفضة
            </Label>
            <Textarea
              id="discountedOffers"
              value={formData.discountedOffers}
              onChange={(e) => onFormDataChange({ ...formData, discountedOffers: e.target.value })}
              placeholder="أدخل العروض المخفضة (كل عرض في سطر جديد)"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-right block text-xs font-medium text-muted-foreground"
              htmlFor="availableProcedures"
            >
              الإجراءات المتاحة
            </Label>
            <Textarea
              id="availableProcedures"
              value={formData.availableProcedures}
              onChange={(e) => onFormDataChange({ ...formData, availableProcedures: e.target.value })}
              placeholder="أدخل الإجراءات المتاحة (كل إجراء في سطر جديد)"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-right block text-xs font-medium text-muted-foreground"
              htmlFor="galleryImages"
            >
              روابط الصور الإضافية
            </Label>
            <Textarea
              id="galleryImages"
              value={formData.galleryImages}
              onChange={(e) => onFormDataChange({ ...formData, galleryImages: e.target.value })}
              placeholder="أدخل روابط الصور (كل رابط في سطر جديد)"
              rows={3}
              dir="ltr"
            />
          </div>

          {/* الإعدادات والتواريخ */}
          <div className="space-y-1 mb-4 mt-6">
            <h4 className="text-sm font-semibold text-foreground">الإعدادات والتواريخ</h4>
            <div className="h-px bg-muted" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="startDate"
              >
                تاريخ البداية
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => onFormDataChange({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="endDate"
              >
                تاريخ النهاية
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => onFormDataChange({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* أوقات الحضور والطاقة الاستيعابية */}
          <div className="space-y-1 mb-4 mt-6">
            <h4 className="text-sm font-semibold text-foreground">
              أوقات الحضور والطاقة الاستيعابية
            </h4>
            <div className="h-px bg-muted" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="morningTime"
              >
                وقت الجلسة الصباحية
              </Label>
              <Input
                id="morningTime"
                type="time"
                value={formData.morningTime}
                onChange={(e) => onFormDataChange({ ...formData, morningTime: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="eveningTime"
              >
                وقت الجلسة المسائية
              </Label>
              <Input
                id="eveningTime"
                type="time"
                value={formData.eveningTime}
                onChange={(e) => onFormDataChange({ ...formData, eveningTime: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-right block text-xs font-medium text-muted-foreground"
                htmlFor="dailyCapacity"
              >
                الطاقة الاستيعابية اليومية (لكل وقت)
              </Label>
              <Input
                id="dailyCapacity"
                type="number"
                min="1"
                value={formData.dailyCapacity}
                onChange={(e) => onFormDataChange({ ...formData, dailyCapacity: e.target.value })}
                placeholder="مثال: 20 (اتركه فارغاً لعدم التحديد)"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => onFormDataChange({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isActive" className="text-sm text-foreground">
              المخيم نشط
            </Label>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              handleReset();
            }}
          >
            إلغاء
          </Button>
          <Button onClick={onSubmit} disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : editingCamp ? (
              'حفظ التعديلات'
            ) : (
              'إضافة المخيم'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
