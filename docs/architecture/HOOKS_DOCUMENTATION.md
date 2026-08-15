# توثيق الهوكات (Hooks) - بوابة المستشفى السعودي الألماني

**تاريخ التحديث:** 23 فبراير 2026  
**المشروع:** sgh-crm-portal

---

## 1. useAuth

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/_core/hooks/useAuth.ts` |
| **النوع** | هوك مصادقة (Core Authentication Hook) |
| **الوصف** | يوفر حالة المصادقة للمستخدم الحالي، بما في ذلك بيانات المستخدم، حالة التحميل، دالة تسجيل الخروج، ورابط تسجيل الدخول |

**المحتوى الرئيسي:**
- `user` - بيانات المستخدم الحالي (أو null)
- `loading` - حالة التحميل
- `error` - أخطاء المصادقة
- `isAuthenticated` - هل المستخدم مسجل دخول
- `logout()` - دالة تسجيل الخروج
- يستخدم `trpc.auth.me.useQuery()` لجلب بيانات المستخدم
- يحفظ بيانات المستخدم في `localStorage` تحت مفتاح `manus-runtime-user-info`
- يدعم إعادة التوجيه التلقائي عند عدم المصادقة عبر `redirectOnUnauthenticated`

**أماكن الاستخدام:**

| الملف | الاستخدام |
|-------|-----------|
| `pages/AdminDashboard.tsx` | التحقق من صلاحيات المستخدم |
| `pages/AppointmentsManagementPage.tsx` | التحقق من المستخدم لعمليات التعديل |
| `pages/BookingsManagementPage.tsx` | التحقق من المستخدم |
| `pages/LeadsManagementPage.tsx` | التحقق من المستخدم |
| `pages/ManagementPage.tsx` | التحقق من المستخدم وتسجيل الخروج |
| `pages/ProfilePage.tsx` | عرض بيانات الملف الشخصي |
| `pages/UsersManagementPage.tsx` | إدارة المستخدمين (ضمنياً) |
| `pages/Home.tsx` | التحقق من حالة المصادقة |
| `pages/admin/DigitalMarketingTasksPage.tsx` | التحقق من المستخدم |
| `components/DashboardLayout.tsx` | حماية صفحات لوحة التحكم |

---

## 2. useTableFeatures

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/table/useTableFeatures.ts` |
| **النوع** | هوك إدارة الجداول (Unified Table Management Hook) |
| **الوصف** | نظام موحد لإدارة جميع ميزات الجداول: إخفاء/إظهار الأعمدة، ترتيب الأعمدة، أحجام الأعمدة، تجميد الأعمدة، القوالب، والترتيب (Sort) |

**المحتوى الرئيسي:**
- `visibleColumns` / `handleColumnVisibilityChange` - إدارة ظهور الأعمدة
- `columnOrder` / `handleColumnOrderChange` - ترتيب الأعمدة
- `columnWidths` / `handleColumnResize` - أحجام الأعمدة
- `frozenColumns` / `handleFrozenColumnsChange` - تجميد الأعمدة
- `sortState` / `handleSort` / `getSortDirection` - الترتيب
- `templates` / `activeTemplate` / `applyTemplate` - قوالب الأعمدة
- `sharedTemplates` / `saveSharedTemplate` - القوالب المشتركة
- يحفظ التفضيلات في `localStorage` وقاعدة البيانات (`userPreferences`)

**أماكن الاستخدام:**

| الملف | مفتاح الجدول (tableKey) |
|-------|------------------------|
| `pages/AppointmentsManagementPage.tsx` | `appointments` |
| `pages/BookingsManagementPage.tsx` | `bookings-appointments` |
| `pages/UsersManagementPage.tsx` | `users`, `access-requests` |
| `components/OffersManagement.tsx` | `offers` |
| `components/CampsManagement.tsx` | `camps` |
| `components/DoctorsManagement.tsx` | `doctors` |
| `components/OfferLeadsManagement.tsx` | `offer-leads` |
| `components/CampRegistrationsManagement.tsx` | `camp-registrations` |

---

## 3. useFilterUtils

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/table/useFilterUtils.ts` |
| **النوع** | هوك تصفية البيانات (Unified Filter Hook) |
| **الوصف** | يوفر نظاماً موحداً لتصفية البيانات يشمل: البحث النصي (مع debounce)، تصفية الحالة، تصفية المصدر، تصفية التصنيف، تصفية التاريخ، وعدد الفلاتر النشطة |

**المحتوى الرئيسي:**
- `filters.searchTerm` / `filters.setSearchTerm` - البحث النصي
- `filters.debouncedSearch` - البحث بعد التأخير
- `filters.statusFilter` / `filters.setStatusFilter` - تصفية الحالة
- `filters.sourceFilter` / `filters.setSourceFilter` - تصفية المصدر
- `filters.categoryFilter` / `filters.setCategoryFilter` - تصفية التصنيف
- `filters.dateFilter` / `filters.setDateFilter` - تصفية التاريخ
- `filters.dateRange` / `filters.setDateRange` - نطاق التاريخ
- `filters.resetAll()` - إعادة تعيين جميع الفلاتر
- `filters.activeFilterCount` - عدد الفلاتر النشطة
- `filteredData` - البيانات المصفاة
- `totalCount` / `filteredCount` - إحصائيات
- `dateRangeISO` - نطاق التاريخ بصيغة ISO
- `applyDefaultSort()` - دالة مساعدة للترتيب الافتراضي

**أماكن الاستخدام:**

| الملف | اسم المتغير |
|-------|-------------|
| `pages/AppointmentsManagementPage.tsx` | `appointmentFilter` |
| `pages/BookingsManagementPage.tsx` | `appointmentFilter`, `leadsFilter` |
| `pages/LeadsManagementPage.tsx` | `leadsFilter` |
| `components/OfferLeadsManagement.tsx` | `offerFilter` |
| `components/CampRegistrationsManagement.tsx` | `campFilter` |

---

## 4. useExportUtils

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/export/useExportUtils.ts` |
| **النوع** | هوك تصدير البيانات (Export & Print Hook) |
| **الوصف** | يوفر دوال لتصدير البيانات إلى Excel وطباعتها كـ PDF، مع دعم الأعمدة المرئية والفلاتر النشطة |

**المحتوى الرئيسي:**
- `handleExport(data, visibleColumns?, activeFilters?)` - تصدير إلى Excel
- `handlePrint(data, visibleColumns?, activeFilters?)` - طباعة PDF
- `buildActiveFilters(filters)` - بناء قائمة الفلاتر النشطة
- `formatDateRange(from, to)` - تنسيق نطاق التاريخ
- يدعم تخصيص الأعمدة عبر `exportColumns` و `printColumns`
- يدعم تحويل البيانات عبر `mapToExportRow` و `mapToPrintRow`

**أماكن الاستخدام:**

| الملف | اسم المتغير |
|-------|-------------|
| `pages/AppointmentsManagementPage.tsx` | `appointmentExport` |
| `pages/BookingsManagementPage.tsx` | `appointmentExport` |
| `components/OfferLeadsManagement.tsx` | `offerExport` |
| `components/CampRegistrationsManagement.tsx` | `campExport` |

---

## 5. useDebounce

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/data/useDebounce.ts` |
| **النوع** | هوك تأخير القيمة (Debounce Hook) |
| **الوصف** | يؤخر تحديث القيمة حتى انتهاء فترة التأخير المحددة. مفيد لحقول البحث لتقليل عدد استدعاءات API |

**المحتوى الرئيسي:**
- يقبل `value` (القيمة) و `delay` (التأخير بالمللي ثانية، افتراضي 500ms)
- يعيد القيمة المؤخرة `debouncedValue`

**أماكن الاستخدام:**
- يُستخدم داخلياً في `useFilterUtils` لتأخير البحث النصي
- يمكن استخدامه مباشرة في أي مكون يحتاج تأخير قيمة

---

## 6. useComposition

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/ui/useComposition.ts` |
| **النوع** | هوك إدارة الإدخال المركب (Composition Input Hook) |
| **الوصف** | يتعامل مع أحداث الإدخال المركب (Composition Events) في حقول النص، خاصة للغات التي تستخدم IME مثل العربية والصينية |

**المحتوى الرئيسي:**
- `onCompositionStart` - بداية الإدخال المركب
- `onCompositionEnd` - نهاية الإدخال المركب
- `onKeyDown` - معالجة ضغطات المفاتيح (يمنع ESC و Enter أثناء التركيب)
- `isComposing()` - هل الإدخال المركب نشط

**أماكن الاستخدام:**
- يُستخدم في مكونات الإدخال النصي التي تحتاج التعامل مع IME
- يعتمد على `usePersistFn` داخلياً

---

## 7. usePersistFn

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/data/usePersistFn.ts` |
| **النوع** | هوك تثبيت الدالة (Persistent Function Hook) |
| **الوصف** | بديل لـ `useCallback` يحافظ على مرجع ثابت للدالة دون الحاجة لتحديد التبعيات |

**المحتوى الرئيسي:**
- يقبل دالة ويعيد نسخة ثابتة المرجع منها
- يستخدم `useRef` داخلياً لتخزين الدالة الأصلية والنسخة الثابتة

**أماكن الاستخدام:**
- يُستخدم داخلياً في `useComposition`
- يمكن استخدامه في أي مكان بدلاً من `useCallback`

---

## 8. useMobile (useIsMobile)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/ui/useMobile.tsx` |
| **النوع** | هوك كشف الجهاز (Mobile Detection Hook) |
| **الوصف** | يكتشف ما إذا كان العرض الحالي للشاشة أقل من 768px (نقطة توقف الهاتف) |

**المحتوى الرئيسي:**
- يعيد `boolean` يشير إلى ما إذا كان الجهاز هاتف محمول
- يستخدم `window.matchMedia` للاستماع لتغييرات حجم الشاشة
- نقطة التوقف: `768px` (MOBILE_BREAKPOINT)

**أماكن الاستخدام:**
- يُستخدم في المكونات التي تحتاج تخطيطاً مختلفاً للهاتف والويب
- يُستخدم في `components/ui/sidebar.tsx` و `components/ResponsiveDialog.tsx`

---

## 9. useNotificationSound

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/integrations/useNotificationSound.ts` |
| **النوع** | هوك إشعارات صوتية (Notification Sound Hook) |
| **الوصف** | يراقب الرسائل الجديدة في واتساب ويشغل صوت إشعار عند وصول رسالة جديدة |

**المحتوى الرئيسي:**
- `soundEnabled` - هل الصوت مفعل
- `toggleSound()` - تبديل حالة الصوت
- يستخدم Web Audio API لتشغيل صوت إشعار ثلاثي النغمات
- يراقب المحادثات كل 15 ثانية عبر `trpc.whatsapp.getConversations.useQuery`
- يحفظ تفضيل الصوت في `localStorage` تحت مفتاح `sgh-notification-sound-enabled`

**أماكن الاستخدام:**
- يُستخدم في صفحة واتساب (`pages/WhatsAppPage.tsx`)

---

## 10. useSlugGenerator (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/data/useSlugGenerator.ts` |
| **النوع** | هوك توليد الروابط (Slug Auto-Generation Hook) |
| **الوصف** | يولّد slug تلقائياً من العنوان العربي/الإنجليزي مع دعم التعديل اليدوي وحالة التعديل |

**المحتوى الرئيسي:**
- `autoGenerateSlug(text)` - توليد slug تلقائي من النص المدخل
- `resetManualEdit()` - إعادة تعيين حالة التعديل اليدوي
- يزيل الأحرف العربية ويحول النص إلى slug صالح
- يحترم حالة التعديل (`isEditing`) - لا يولد slug تلقائياً عند تعديل عنصر موجود
- يدعم التعديل اليدوي - إذا عدّل المستخدم الـ slug يدوياً، يتوقف التوليد التلقائي

**أماكن الاستخدام:**

| الملف | الاستخدام |
|-------|-----------|
| `components/OffersManagement.tsx` | توليد slug تلقائي عند إدخال عنوان العرض |
| `components/CampsManagement.tsx` | توليد slug تلقائي عند إدخال اسم المخيم |
| `components/DoctorsManagement.tsx` | توليد slug تلقائي عند إدخال اسم الطبيب |
| `pages/admin/CampaignsPage.tsx` | توليد slug تلقائي عند إدخال عنوان الحملة |

---

## 11. useImageUpload (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/form/useImageUpload.ts` |
| **النوع** | هوك رفع الصور (Image Upload Hook) |
| **الوصف** | يدير عملية رفع الصور إلى الخادم مع التحقق من النوع والحجم ومعاينة الصورة |

**المحتوى الرئيسي:**
- `uploading` - حالة الرفع
- `preview` - رابط المعاينة المحلية
- `error` - رسالة الخطأ
- `uploadImage(file)` - رفع ملف صورة
- `clearPreview()` - مسح المعاينة
- يدعم أنواع: JPEG, PNG, GIF, WebP, SVG
- الحد الأقصى للحجم: 5MB
- يرفع إلى `/api/upload` مع تحديد المجلد

**أماكن الاستخدام:**
- يُستخدم داخلياً في مكون `ImageUpload`

---

## 12. useFormValidation (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/form/useFormValidation.ts` |
| **النوع** | هوك التحقق من النماذج (Form Validation Hook) |
| **الوصف** | يوفر نظام تحقق بسيط من صحة حقول النماذج مع رسائل خطأ عربية |

**المحتوى الرئيسي:**
- `errors` - كائن يحتوي أخطاء كل حقل
- `validate(data, rules)` - تحقق من البيانات وفق القواعد
- `clearErrors()` - مسح جميع الأخطاء
- `getFieldError(field)` - الحصول على خطأ حقل محدد
- `hasErrors` - هل يوجد أخطاء
- يدعم قواعد: `required`, `minLength`, `maxLength`, `pattern`, `custom`

**أماكن الاستخدام:**
- متاح للاستخدام في جميع نماذج الإدارة (العروض، المخيمات، الأطباء، الحملات)

---

## 13. useConfirmDialog (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/ui/useConfirmDialog.ts` |
| **النوع** | هوك حوار التأكيد (Confirm Dialog Hook) |
| **الوصف** | يدير حالة حوار التأكيد (مثل حذف عنصر) مع دعم العنوان والرسالة والإجراء |

**المحتوى الرئيسي:**
- `isOpen` - هل الحوار مفتوح
- `title` - عنوان الحوار
- `message` - رسالة التأكيد
- `confirm(config)` - فتح حوار التأكيد مع الإعدادات
- `handleConfirm()` - تنفيذ الإجراء المؤكد
- `handleCancel()` - إلغاء الحوار
- يدعم `variant`: `danger` أو `warning`

**أماكن الاستخدام:**
- متاح للاستخدام في جميع صفحات الإدارة لعمليات الحذف والتأكيد

---

## 14. useStatusLabels (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/data/useStatusLabels.ts` |
| **النوع** | هوك تسميات الحالات (Status Labels Hook) |
| **الوصف** | يوحد تسميات وألوان الحالات عبر جميع صفحات الإدارة |

**المحتوى الرئيسي:**
- `getStatusLabel(type, value)` - الحصول على التسمية العربية للحالة
- `getStatusColor(type, value)` - الحصول على لون الحالة (CSS classes)
- `getStatusBadgeProps(type, value)` - الحصول على خصائص Badge كاملة
- يدعم أنواع: `lead`, `appointment`, `campaign`, `offer`, `camp`, `doctor`

**أماكن الاستخدام:**
- متاح للاستخدام في جميع صفحات الإدارة لتوحيد عرض الحالات

---

## المكونات المشتركة الجديدة

### ImageUpload Component

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/components/form/ImageUpload.tsx` |
| **النوع** | مكون رفع صور (Reusable Image Upload Component) |
| **الوصف** | مكون قابل لإعادة الاستخدام لرفع الصور مع Drag & Drop ومعاينة فورية |

**الخصائص (Props):**
- `value` - رابط الصورة الحالية
- `onChange(url)` - دالة تُستدعى عند تغيير الصورة
- `folder` - مجلد الرفع (مثل: offers, camps, doctors)
- `placeholder` - نص توضيحي

**أماكن الاستخدام:**

| الملف | الاستخدام |
|-------|-----------|
| `components/OffersManagement.tsx` | رفع صورة العرض |
| `components/CampsManagement.tsx` | رفع صورة المخيم |
| `components/DoctorsManagement.tsx` | رفع صورة الطبيب |

### CampaignLinksManager Component

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/components/CampaignLinksManager.tsx` |
| **النوع** | مكون إدارة ربط الحملات (Campaign Links Manager) |
| **الوصف** | مكون لإدارة ربط العروض والمخيمات والأطباء بالحملات |

**الخصائص (Props):**
- `campaignId` - معرف الحملة
- `readOnly` - وضع القراءة فقط (اختياري)

**أماكن الاستخدام:**

| الملف | الاستخدام |
|-------|-----------|
| `pages/admin/CampaignsPage.tsx` | عرض وإدارة الروابط في حوار تفاصيل/تعديل الحملة |

---

## 15. useFormatDate (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/export/useFormatDate.ts` |
| **النوع** | هوك تنسيق التاريخ (Date Formatting Hook) |
| **الوصف** | يوفر دوال لتنسيق التواريخ بالعربية والإنجليزية |

**المحتوى الرئيسي:**
- `formatDate(date)` - تنسيق التاريخ
- `formatDateRange(from, to)` - تنسيق نطاق التاريخ
- يدعم التواريخ العربية والإنجليزية

**أماكن الاستخدام:**
- يُستخدم مع `useExportUtils` لتنسيق التواريخ في التصدير

---

## 16. usePagination (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/table/usePagination.ts` |
| **النوع** | هوك تقسيم البيانات (Pagination Hook) |
| **الوصف** | يدير تقسيم البيانات إلى صفحات مع دعم تغيير حجم الصفحة |

**المحتوى الرئيسي:**
- `currentPage` / `setCurrentPage` - الصفحة الحالية
- `pageSize` / `setPageSize` - حجم الصفحة
- `totalPages` - إجمالي الصفحات
- `paginatedData` - البيانات المقسمة
- `goToPage()` - الانتقال إلى صفحة محددة
- `nextPage()` / `prevPage()` - الصفحة التالية/السابقة

**أماكن الاستخدام:**
- متاح للاستخدام في جميع الجداول الكبيرة

---

## 17. usePhoneFormat (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/form/usePhoneFormat.ts` |
| **النوع** | هوك تنسيق رقم الهاتف (Phone Formatting Hook) |
| **الوصف** | يوفر دوال لتنسيق والتحقق من أرقام الهواتف اليمنية |

**المحتوى الرئيسي:**
- `formatPhone(phone)` - تنسيق رقم الهاتف
- `validatePhone(phone)` - التحقق من صحة رقم الهاتف
- يدعم الأرقام اليمنية (967+)

**أماكن الاستخدام:**
- يُستخدم في نماذج إدخال أرقام الهواتف

---

## 18. usePatientStorage (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/data/usePatientStorage.ts` |
| **النوع** | هوك تخزين بيانات المريض (Patient Storage Hook) |
| **الوصف** | يدير تخزين بيانات المريض في localStorage |

**المحتوى الرئيسي:**
- `patientData` - بيانات المريض
- `savePatientData(data)` - حفظ بيانات المريض
- `clearPatientData()` - مسح بيانات المريض

**أماكن الاستخدام:**
- يُستخدم في بوابة المريض

---

## 19. useRecentlyUsed (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/data/useRecentlyUsed.ts` |
| **النوع** | هوك العناصر المستخدمة مؤخراً (Recently Used Hook) |
| **الوصف** | يدير قائمة العناصر المستخدمة مؤخراً مع الحد الأقصى |

**المحتوى الرئيسي:**
- `recentItems` - العناصر المستخدمة مؤخراً
- `addItem(item)` - إضافة عنصر
- `removeItem(id)` - إزالة عنصر
- `clearItems()` - مسح القائمة

**أماكن الاستخدام:**
- متاح للاستخدام في القوائم السريعة

---

## 20. useSidebarState (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/ui/useSidebarState.ts` |
| **النوع** | هوك حالة الشريط الجانبي (Sidebar State Hook) |
| **الوصف** | يدير حالة الشريط الجانبي (مفتوح/مغلق) |

**المحتوى الرئيسي:**
- `isOpen` - هل الشريط مفتوح
- `toggle()` - تبديل الحالة
- `open()` / `close()` - فتح/إغلاق
- يحفظ الحالة في localStorage

**أماكن الاستخدام:**
- يُستخدم في DashboardLayout

---

## 21. useSSE (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/integrations/useSSE.ts` |
| **النوع** | هوك Server-Sent Events (SSE Hook) |
| **الوصف** | يدير اتصال SSE لاستقبال التحديثات من الخادم |

**المحتوى الرئيسي:**
- `connected` - حالة الاتصال
- `lastMessage` - آخر رسالة مستلمة
- `connect()` - الاتصال
- `disconnect()` - قطع الاتصال

**أماكن الاستخدام:**
- يُستخدم لاستقبال التحديثات الفورية

---

## 22. useWhatsAppSSE (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/integrations/useWhatsAppSSE.ts` |
| **النوع** | هوك SSE لواتساب (WhatsApp SSE Hook) |
| **الوصف** | يدير اتصال SSE لاستقبال تحديثات واتساب الفورية |

**المحتوى الرئيسي:**
- `connected` - حالة الاتصال
- `messages` - الرسائل المستلمة
- `connect()` - الاتصال
- `disconnect()` - قطع الاتصال

**أماكن الاستخدام:**
- يُستخدم في صفحة واتساب

---

## 23. usePWAInstall (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/integrations/usePWAInstall.ts` |
| **النوع** | هوك تثبيت PWA (PWA Install Hook) |
| **الوصف** | يدير تثبيت التطبيق كـ PWA |

**المحتوى الرئيسي:**
- `canInstall` - هل يمكن التثبيت
- `install()` - تثبيت التطبيق
- `dismiss()` - إخفاء زر التثبيت

**أماكن الاستخدام:**
- يُستخدم لعرض زر تثبيت PWA

---

## 24. useLicense (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/integrations/useLicense.ts` |
| **النوع** | هوك الترخيص (License Hook) |
| **الوصف** | يدير التحقق من ترخيص التطبيق |

**المحتوى الرئيسي:**
- `license` - بيانات الترخيص
- `isValid` - هل الترخيص صالح
- `checkLicense()` - التحقق من الترخيص

**أماكن الاستخدام:**
- يُستخدم للتحقق من الترخيص عند بدء التطبيق

---

## 25. useUpdateChecker (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/integrations/useUpdateChecker.ts` |
| **النوع** | هوك التحقق من التحديثات (Update Checker Hook) |
| **الوصف** | يتحقق من وجود تحديثات للتطبيق |

**المحتوى الرئيسي:**
- `updateAvailable` - هل يوجد تحديث
- `checkForUpdates()` - التحقق من التحديثات

**أماكن الاستخدام:**
- يُستخدم للتحقق من التحديثات تلقائياً

---

## 26. useAbandonedFormTracking (جديد)

| الحقل | القيمة |
|-------|--------|
| **المسار** | `client/src/hooks/form/useAbandonedFormTracking.ts` |
| **النوع** | هوك تتبع النماذج المتروكة (Abandoned Form Tracking Hook) |
| **الوصف** | يتعقب النماذج التي بدأها المستخدم ولم يكملها |

**المحتوى الرئيسي:**
- `trackFormStart()` - بدء تتبع النموذج
- `trackFormComplete()` - إكمال النموذج
- `saveFormData()` - حفظ بيانات النموذج

**أماكن الاستخدام:**
- يُستخدم في نماذج التسجيل والحجز

---

## ملخص الهوكات والتبعيات (محدث)

```
useAuth ─────────────────────── (مستقل - يعتمد على trpc)

# Table Hooks
useTableFeatures ────────────── (مستقل - يعتمد على trpc + localStorage)
useFilterUtils ──────────────── يعتمد على → useDebounce
usePagination ───────────────── (مستقل)

# Form Hooks
useFormValidation ───────────── (مستقل)
useImageUpload ──────────────── (مستقل)
usePhoneFormat ─────────────── (مستقل)
useAbandonedFormTracking ────── (مستقل)

# UI Hooks
useMobile (useIsMobile) ─────── (مستقل)
useConfirmDialog ────────────── (مستقل)
useSidebarState ─────────────── (مستقل)
useComposition ──────────────── يعتمد على → usePersistFn

# Data Hooks
useDebounce ─────────────────── (مستقل)
usePersistFn ────────────────── (مستقل)
useSlugGenerator ────────────── (مستقل)
useStatusLabels ─────────────── (مستقل)
usePatientStorage ───────────── (مستقل)
useRecentlyUsed ─────────────── (مستقل)

# Integration Hooks
useSSE ─────────────────────── (مستقل)
useWhatsAppSSE ──────────────── (مستقل)
usePWAInstall ───────────────── (مستقل)
useLicense ──────────────────── (مستقل)
useUpdateChecker ────────────── (مستقل)
useNotificationSound ────────── (مستقل - يعتمد على trpc)

# Export Hooks
useExportUtils ──────────────── (مستقل)
useFormatDate ───────────────── (مستقل)
```

---

## هوكات مقترحة للإنشاء مستقبلاً

| الهوك المقترح | الوصف | أماكن الاستخدام المحتملة |
|--------------|-------|-------------------------|
| `useBulkActions` | إجراءات جماعية على عناصر محددة | جميع صفحات الجداول |
| `usePagination` | تقسيم البيانات إلى صفحات (client-side) | جميع الجداول الكبيرة |
| `useActivityLog` | سجل النشاطات والتغييرات | لوحة التحكم |
| `useNotifications` | إشعارات داخل التطبيق | جميع الصفحات |
