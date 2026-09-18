# معمارية مخطط قاعدة البيانات المعياري (Modular Database Schema)

## 1. نظرة عامة

يمثل مخطط قاعدة البيانات في منظومة **BOCAM** هيكلاً معيارياً متعدد النطاقات يعتمد على **Drizzle ORM** مع **MySQL / TiDB**.
تم تقسيم المخطط التاريخي الأحادي إلى 8 وحدات نطاقية داخل [`drizzle/schema/`](file:///Users/applestore/Documents/GitHub/bocam/drizzle/schema) تتناظر مع وحدات المنظومة الأساسية، مع الإبقاء على ملف [`drizzle/schema.ts`](file:///Users/applestore/Documents/GitHub/bocam/drizzle/schema.ts) كجسر إعادة تصدير موحد لتحقيق التوافق التام 100% مع Drizzle Kit والترحيلات السابقة.

---

## 2. المخطط الهيكلي

```
drizzle/
├── schema/
│   ├── 01-booking-scheduling.ts     # المواعيد، الأطباء، العيادات، العروض، المخيمات
│   ├── 02-crm-patients.ts          # سجلات المرضى، العلاقات، النتائج، OTP
│   ├── 03-omni-inbox.ts             # واتساب، القوالب، البث، التعليقات، حسابات التواصل
│   ├── 04-marketing-publishing.ts   # الحملات، العملاء المحتملين، النشر الآلي
│   ├── 05-cms-portal.ts             # الصفحات، الأقسام، مقالات التدوين، الوسائط، SEO
│   ├── 06-tasks-projects.ts         # المهام، المشاريع، فرق العمل، مرفقات المهام
│   ├── 07-users-rbac.ts             # المستخدمين، الأدوار، الصلاحيات، طلبات الوصول
│   ├── 10-system-settings.ts        # الإعدادات، التراخيص، سجلات التدقيق، التكاملات
│   └── index.ts                     # فهرس مجمع يعيد تصدير كافة الجداول والأنواع
└── schema.ts                        # جسر التوافق المركزي المعتمد لـ Drizzle Kit
```

---

## 3. توزيع الجداول على النطاقات

| الوحدة النطاقية | عدد الجداول | أبرز الجداول |
|---|:---:|---|
| **01-booking-scheduling** | 10 | `appointments`, `doctors`, `doctorSchedules`, `offers`, `camps`, `campRegistrations` |
| **02-crm-patients** | 4 | `patients`, `patientRelationships`, `patientOtps`, `patientResults` |
| **03-omni-inbox** | 32 | `whatsappConversations`, `whatsappMessages`, `whatsappTemplates`, `socialInboxAccounts`, `comments` |
| **04-marketing-publishing** | 19 | `campaigns`, `leads`, `socialPublishPosts`, `broadcastRecipients`, `metaLeadForms` |
| **05-cms-portal** | 13 | `pages`, `sections`, `sectionButtons`, `media`, `seoSettings`, `textContent`, `colorScheme` |
| **06-tasks-projects** | 9 | `tasks`, `projects`, `teams`, `teamMembers`, `taskComments`, `followUpTasks` |
| **07-users-rbac** | 4 | `users`, `roleDefinitions`, `userRoleAssignments`, `accessRequests` |
| **10-system-settings** | 24 | `settings`, `auditLogs`, `notifications`, `integrationConnections`, `trackingEvents` |

---

## 4. مبادئ التصميم والتوافق

1. **التقييم الكسول للعلاقات (Lazy Evaluation)**:
   - تستخدم كافة المفاتيح الأجنبية دوال lambda مثل `() => users.id` لتجنب مشاكل التبعيات الدائرية عند التهيئة.
2. **التوافق التام مع Drizzle Kit**:
   - يشير ملف `drizzle.config.ts` إلى `./drizzle/schema.ts` الذي يعيد تصدير كافة الجداول دون أي تغيير في مسار Drizzle Kit.
3. **التوافق العكسي للاستيرادات**:
   - أي استيراد قديم من `drizzle/schema` أو `../../drizzle/schema` يستمر في العمل فورياً دون أي تعديل.
