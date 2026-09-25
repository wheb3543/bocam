/**
 * DepartmentFormDialog - نافذة إضافة وتعديل الأقسام والعيادات الطبية
 *
 * Provides a responsive modal form for creating and updating medical departments
 * with smart slug generation, medical icon selector, sorting priority, and active status toggle.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Stethoscope,
  HeartPulse,
  Brain,
  Eye,
  Baby,
  Bone,
  Smile,
  Pill,
  Activity,
  Microscope,
  Dna,
  ShieldAlert,
  Thermometer,
  Syringe,
  Sparkles,
  Building2,
  Loader2,
  Sparkle,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc';
import { generateSlugFromText } from '@/hooks/data/useSlugGenerator';
import ImageUpload from '@/apps/admin/shared/form/ImageUpload';

const parseDepartmentList = (value?: string | null): string[] => {
  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // قد تأتي البيانات القديمة كنص مفصول بالأسطر.
  }

  return value
    .split('\n')
    .map((item) => item.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
};

const serializeDepartmentList = (value: string): string | null => {
  const items = parseDepartmentList(value);
  return items.length > 0 ? JSON.stringify(items) : null;
};

export interface DepartmentFormData {
  id?: number;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  tagline?: string | null;
  fullDescription?: string | null;
  services?: string | null;
  advancedTechniques?: string | null;
  icon?: string | null;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
  doctorCount?: number;
}

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: DepartmentFormData | null;
  onSuccess?: () => void;
}

// Predefined medical icons with Arabic labels and Lucide components
const COMMON_MEDICAL_ICONS = [
  { value: 'Stethoscope', label: 'سماعة طبية (عام / استشاري)', icon: Stethoscope },
  { value: 'HeartPulse', label: 'أمراض القلب والأوعية الدموية', icon: HeartPulse },
  { value: 'Brain', label: 'مخ وأعصاب وجراحة عصبية', icon: Brain },
  { value: 'Eye', label: 'طب وجراحة العيون والبصريات', icon: Eye },
  { value: 'Baby', label: 'طب الأطفال وحديثي الولادة', icon: Baby },
  { value: 'Bone', label: 'جراحة العظام والمفاصل والعمود الفقري', icon: Bone },
  { value: 'Smile', label: 'طب وجراحة الأسنان', icon: Smile },
  { value: 'Pill', label: 'صيدلية وعلاجات دوائية', icon: Pill },
  { value: 'Activity', label: 'عناية مركزة وباطنية تخصصية', icon: Activity },
  { value: 'Microscope', label: 'مختبرات وتحاليل طبية', icon: Microscope },
  { value: 'Dna', label: 'جينات وفحوصات وراثية', icon: Dna },
  { value: 'ShieldAlert', label: 'طوارئ وإسعاف على مدار الساعة', icon: ShieldAlert },
  { value: 'Thermometer', label: 'باطنية عامة وحميات', icon: Thermometer },
  { value: 'Syringe', label: 'تخدير وعلاج الألم المزمن', icon: Syringe },
  { value: 'Sparkles', label: 'جلدية وتجميل وليزر', icon: Sparkles },
  { value: 'Building2', label: 'عيادة عامة / مركز طبي', icon: Building2 },
];

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  onSuccess,
}: DepartmentFormDialogProps) {
  const isEditing = Boolean(department?.id);
  const utils = trpc.useUtils();

  // Form states
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Stethoscope');
  const [customIcon, setCustomIcon] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [services, setServices] = useState('');
  const [advancedTechniques, setAdvancedTechniques] = useState('');
  const [image, setImage] = useState('');
  const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false);

  // Sync form state on open or department change
  useEffect(() => {
    if (open) {
      if (department) {
        setName(department.name || '');
        setNameEn(department.nameEn || '');
        setSlug(department.slug || '');
        const currentIcon = department.icon || 'Stethoscope';
        const isPredefined = COMMON_MEDICAL_ICONS.some((i) => i.value === currentIcon);
        if (isPredefined) {
          setIcon(currentIcon);
          setCustomIcon('');
        } else {
          setIcon('custom');
          setCustomIcon(currentIcon);
        }
        setSortOrder(department.sortOrder ?? 0);
        setImage(department.image || '');
        setManuallyEditedSlug(true);
        setIsActive(department.isActive ?? true);
        setDescription(department.description || '');
        setTagline(department.tagline || '');
        setFullDescription(department.fullDescription || department.description || '');
        setServices(parseDepartmentList(department.services).join('\n'));
        setAdvancedTechniques(parseDepartmentList(department.advancedTechniques).join('\n'));
      } else {
        setName('');
        setNameEn('');
        setSlug('');
        setDescription('');
        setTagline('');
        setFullDescription('');
        setServices('');
        setAdvancedTechniques('');
        setImage('');
        setManuallyEditedSlug(false);
        setIcon('Stethoscope');
        setCustomIcon('');
        setSortOrder(0);
        setIsActive(true);
      }
    }
  }, [open, department]);

  // Handle Arabic name change with smart slug generation
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing && !manuallyEditedSlug) {
      const generated = generateSlugFromText(value);
      setSlug(generated);
    }
  };

  // Mutations
  const createMutation = trpc.departments.create.useMutation({
    onSuccess: () => {
      toast.success('تمت إضافة القسم الطبي بنجاح');
      utils.departments.getAllAdmin.invalidate();
      utils.departments.list.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ أثناء إضافة القسم');
    },
  });

  const updateMutation = trpc.departments.update.useMutation({
    onSuccess: () => {
      toast.success('تم تعديل بيانات القسم الطبي بنجاح');
      utils.departments.getAllAdmin.invalidate();
      utils.departments.list.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ أثناء تعديل القسم');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('اسم القسم بالعربية مطلوب');
      return;
    }

    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      toast.error('المعرف الرمزي (slug) مطلوب');
      return;
    }

    const finalIcon = icon === 'custom' ? customIcon.trim() || 'Building2' : icon;

    const taglineValue = tagline.trim() || 'رعاية متخصصة';
    const descriptionValue = description.trim();
    const fullDescriptionValue = fullDescription.trim() || descriptionValue;

    const payload = {
      name: trimmedName,
      nameEn: nameEn.trim() || undefined,
      slug: trimmedSlug,
      description: descriptionValue || null,
      tagline: taglineValue || null,
      fullDescription: fullDescriptionValue || null,
      services: serializeDepartmentList(services),
      advancedTechniques: serializeDepartmentList(advancedTechniques),
      icon: finalIcon || undefined,
      // نرسل null عند الإزالة حتى تُمسح الصورة القديمة من قاعدة البيانات.
      image: image.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };

    if (isEditing && department?.id) {
      updateMutation.mutate({
        id: department.id,
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{isEditing ? 'تعديل القسم الطبي' : 'إضافة قسم طبي جديد'}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'تحديث بيانات وخصائص القسم الطبي والعيادة التخصصية'
              : 'أدخل تفاصيل العيادة التخصصية ليتم إدراجها في دليل الأقسام ونظام الحجز'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Names Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dept-name" className="text-xs font-semibold text-foreground">
                اسم القسم (عربي) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dept-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="مثال: قسم القلب والأوعية الدموية"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dept-name-en" className="text-xs font-semibold text-foreground">
                اسم القسم (إنجليزي)
              </Label>
              <Input
                id="dept-name-en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Cardiology Department"
                dir="ltr"
              />
            </div>
          </div>

          {/* Slug Row */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="dept-slug" className="text-xs font-semibold text-foreground">
                المعرف الرمزي (Slug) <span className="text-destructive">*</span>
              </Label>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    const generated = generateSlugFromText(name);
                    setSlug(generated);
                    setManuallyEditedSlug(false);
                  }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkle className="w-3 h-3" />
                  <span>توليد تلقائي من الاسم</span>
                </button>
              )}
            </div>
            <Input
              id="dept-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setManuallyEditedSlug(true);
              }}
              placeholder="مثال: cardiology"
              dir="ltr"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              يُستخدم في روابط التوجيه المباشرة، مثل: /departments/{slug || 'name'}
            </p>
          </div>

          {/* Icon Selector Row */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">الأيقونة الطبية</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الأيقونة الطبية المعبرة" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COMMON_MEDICAL_ICONS.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <SelectItem key={item.value} value={item.value}>
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{item.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
                <SelectItem value="custom">أيقونة مخصصة (اسم Lucide يدوي)</SelectItem>
              </SelectContent>
            </Select>

            {icon === 'custom' && (
              <Input
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="أدخل اسم أيقونة Lucide بالإنجليزية (مثال: Syringe, Heart)"
                dir="ltr"
                className="mt-1.5"
              />
            )}
          </div>

          {/* Sort Order & Active Switch Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="dept-order" className="text-xs font-semibold text-foreground">
                ترتيب الظهور (الأولوية)
              </Label>
              <Input
                id="dept-order"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
              />
              <p className="text-[11px] text-muted-foreground">الرقم الأصغر يظهر أولاً في الفهرس</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
              <div className="space-y-0.5">
                <Label
                  htmlFor="dept-active"
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  تفعيل القسم
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {isActive ? 'القسم متاح للجمهور وللحجز' : 'القسم معطل ومخفي مؤقتاً'}
                </p>
              </div>
              <Switch id="dept-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          {/* Department detail content */}
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="dept-tagline" className="text-xs font-semibold text-foreground">
                العنوان الفرعي
              </Label>
              <Input
                id="dept-tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="مثال: دقة ورعاية يمكنك الوثوق بها"
              />
              <p className="text-[11px] text-muted-foreground">
                يظهر مباشرة أسفل اسم القسم في صفحة التفاصيل.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dept-desc" className="text-xs font-semibold text-foreground">
                الوصف المختصر
              </Label>
              <Textarea
                id="dept-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف موجز يظهر في بطاقة القسم وبيانات SEO..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="dept-full-description"
                className="text-xs font-semibold text-foreground"
              >
                الوصف التفصيلي
              </Label>
              <Textarea
                id="dept-full-description"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="اشرح تجربة المريض في القسم، الخبرة، المنهج المتبع، وتجهيزات الرعاية..."
                rows={5}
                className="resize-y"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dept-services" className="text-xs font-semibold text-foreground">
                  علاج الحالات والخدمات
                </Label>
                <Textarea
                  id="dept-services"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder={'اكتب خدمة أو حالة في كل سطر\nمثال: السمنة\nالفتق'}
                  rows={8}
                  className="resize-y leading-7"
                  dir="rtl"
                />
                <p className="text-[11px] text-muted-foreground">
                  عنصر واحد في كل سطر. إذا تركته فارغاً لن يظهر القسم.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dept-techniques" className="text-xs font-semibold text-foreground">
                  تقنيات الرعاية المتقدمة
                </Label>
                <Textarea
                  id="dept-techniques"
                  value={advancedTechniques}
                  onChange={(e) => setAdvancedTechniques(e.target.value)}
                  placeholder={'اكتب تقنية في كل سطر\nمثال: جراحة المنظار\nالعلاج بالليزر'}
                  rows={8}
                  className="resize-y leading-7"
                  dir="rtl"
                />
                <p className="text-[11px] text-muted-foreground">
                  عنصر واحد في كل سطر. إذا تركته فارغاً لن يظهر القسم.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">صورة القسم</Label>
              <ImageUpload
                value={image}
                onChange={setImage}
                folder="departments"
                placeholder="اسحب صورة القسم هنا أو اضغط للاختيار"
                previewHeight="h-48"
              />
              <p className="text-[11px] text-muted-foreground">
                ستظهر في بطاقة القسم، وأعلى صفحة تفاصيله، وفي قسم المزيد من الأقسام.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة القسم'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
