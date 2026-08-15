# فهرس الوثائق | Documentation Index

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 📚 مرحباً بك في وثائق SGH CRM Portal

هذا الدليل الشامل يغطي جميع جوانب منصة SGH CRM Portal - منصة CRM طبية متكاملة لإدارة الحملات التسويقية، حجوزات المرضى، وتكامل WhatsApp.

### 🗂️ هيكل الوثائق

تم تنظيم الوثائق في مجلدات فرعية حسب النوع:

```
docs/
├── guides/ (أدلة المستخدم)
│   ├── USAGE_GUIDE.md
│   ├── PATIENT_PORTAL_GUIDE.md
│   ├── TESTING_GUIDE.md
│   ├── TROUBLESHOOTING.md
│   ├── userGuide.md
│   ├── EXPORT_FEATURE_GUIDE.md
│   └── QUICK_TEST.md
├── architecture/ (البنية المعمارية)
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── CACHING.md
├── api/ (توثيق API)
│   ├── META_INTEGRATION_GUIDE.md
│   ├── WEBHOOK_FIX_SUMMARY.md
│   ├── WHATSAPP_INTEGRATION_GUIDE.md
│   ├── WEBHOOK_DIAGNOSTICS.md
│   └── CHANGELOG_WEBHOOK_FIX.md
├── performance/ (الأداء)
│   ├── PERFORMANCE_GUIDE.md
│   └── PERFORMANCE_REPORT.md
├── analysis/ (التحليلات والتقارير)
│   ├── ./analysis/AUDIT_AND_IMPROVEMENT_PLAN.md
│   ├── ./analysis/SYSTEM_REPORT.md
│   ├── WHATSAPP_SERVICES_ANALYSIS_REPORT.md
│   ├── ./analysis/IMPROVEMENT_ANALYSIS.md
│   ├── PRESENTATION_SUMMARY.md
│   ├── ANALYSIS_NOTES.md
│   ├── AUDIT_RESULTS.md
│   ├── table-audit-report.md
│   └── pages-inventory.md
├── saas/ (توثيق SaaS)
│   ├── SAAS_CHANGES_EXPLANATION.md
│   ├── SAAS_SERVICE_ISOLATION.md
│   ├── SAAS_WORKFLOW_EXPLANATION.md
│   └── SAAS_FIXED_VARIABLE_SERVICES.md
├── whatsapp/ (توثيق واتساب)
│   ├── ./whatsapp/WHATSAPP_NOTIFICATIONS_DOCUMENTATION.md
│   ├── ./whatsapp/WHATSAPP_PAGES_ANALYSIS.md
│   ├── WHATSAPP_TEMPLATES_REQUIRED.md
│   ├── WHATSAPP_TODO.md
│   ├── whatsapp-api-research-findings.md
│   ├── whatsapp-business-api-setup-guide.md
│   ├── whatsapp-fixes-technical-report.md
│   ├── whatsapp-improvements-plan.md
│   ├── whatsapp-marketing-messages-requirements.md
│   ├── whatsapp-pages-to-review.md
│   └── whatsapp-template-categories-analysis.md
├── implementation/ (خطوات التنفيذ)
│   ├── IMPLEMENTATION_PLAN.md
│   ├── PHASE_ONE_IMPLEMENTATION.md
│   ├── PHASE_ZERO_IMPLEMENTATION.md
│   ├── PHASE_ZERO_SUMMARY.md
│   └── PLAN.md
├── archive/ (الأرشيف القديم)
│   ├── FIX_SUMMARY.txt
│   ├── IMPROVEMENTS_TODO.md
│   ├── SPECIFICATIONS.md
│   ├── TEMPLATE_TABLES_DOCUMENTATION.md
│   ├── VISION_DOCUMENT.md
│   ├── todo.md
│   └── test-webhook.sh
├── README.md
├── COMPONENTS.md
├── HOOKS_DOCUMENTATION.md
└── CODE_OF_CONDUCT.md
```

---

## 📖 دروس تعليمية (Tutorials)

دروس توجيهية للمبتدئين للبدء مع النظام.

### [دليل التثبيت](./INSTALLATION_GUIDE.md)
تعلم كيفية تثبيت وتشغيل SGH CRM Portal على بيئة التطوير الخاصة بك.

**ماذا ستتعلم:**
- المتطلبات الأساسية (Node.js, pnpm, MySQL)
- خطوات التثبيت التفصيلية
- إعداد متغيرات البيئة
- استكشاف الأخطاء الشائعة

### [دليل البداية السريعة](../QUICK_TEST.md)
ابدأ بسرعة مع دليل الاختبار السريع.

---

## 🎯 أدلة كيفية (How-to Guides)

أدلة عملية لإنجاز مهام محددة.

### إدارة الحملات
- [دليل إدارة الحملات](../docs/CAMPAIGNS_GUIDE.md) - إنشاء وإدارة الحملات التسويقية
- [تتبع UTM Parameters](../docs/UTM_TRACKING.md) - تحليل مصادر الزيارات

### إدارة المواعيد
- [إدارة مواعيد الأطباء](../docs/APPOINTMENTS_GUIDE.md) - حجز وإدارة المواعيد
- [جدولة المواعيد التلقائية](../docs/APPOINTMENT_SCHEDULING.md) - إعداد التذكيرات التلقائية

### إدارة المهام
- [إدارة المهام والمشاريع](../docs/TASKS_GUIDE.md) - إنشاء وتتبع المهام
- [إدارة الفرق](../docs/TEAMS_GUIDE.md) - تنظيم الفرق والأدوار

### WhatsApp
- [دليل WhatsApp الشامل](./WHATSAPP_INTEGRATION_GUIDE.md) - تكامل WhatsApp Business API
- [إرسال الرسائل الجماعية](./WHATSAPP_BROADCAST.md) - البث الجماعي للحملات
- [الردود التلقائية](./WHATSAPP_AUTO_REPLY.md) - إعداد الردود التلقائية

### بوابة المريض
- [دليل بوابة المريض](./PATIENT_PORTAL_GUIDE.md) - استخدام بوابة المريض

---

## 📚 مراجع (Reference)

معلومات تقنية مفصلة للمطورين.

### [البنية المعمارية](../docs/ARCHITECTURE.md)
فهم البنية المعمارية للنظام.

**المحتوى:**
- مخطط البنية العامة
- مكونات النظام (Frontend, Backend, Database)
- تدفق البيانات
- إجراءات الأمان
- تحسينات الأداء

### [مخطط قاعدة البيانات](../docs/DATABASE_SCHEMA.md)
مرجع كامل لجميع جداول قاعدة البيانات.

**المحتوى:**
- 40+ جدول مع تفاصيل الأعمدة
- العلاقات بين الجداول
- الفهارس والقيود
- أمثلة الاستخدام

### [مرجع API](../docs/API_REFERENCE.md)
توثيق كامل لـ tRPC endpoints.

**المحتوى:**
- جميع الـ routers والـ procedures
- أنواع المدخلات والمخرجات
- أمثلة الاستخدام

### [دليل النشر](../docs/DEPLOYMENT.md)
دليل نشر النظام على بيئة الإنتاج.

**المحتوى:**
- متطلبات الخادم
- خطوات النشر
- إعداد HTTPS
- النسخ الاحتياطي

---

## 🧠 شروحات (Explanation)

فهم أعمق لمفاهيم النظام.

### مفاهيم النظام
- [نظام الصلاحيات](./PERMISSIONS.md) - فهم نظام الأدوار والصلاحيات
- [تتبع التحويلات](./CONVERSION_TRACKING.md) - كيفية عمل تتبع التحويلات
- [تكامل Meta](./api/META_INTEGRATION_GUIDE.md) - تكامل Meta Pixel و Conversion API

### أفضل الممارسات
- [أمن البيانات](./DATA_SECURITY.md) - حماية بيانات المرضى
- [تحسين الأداء](./PERFORMANCE_GUIDE.md) - تحسين أداء النظام
- [استكشاف الأخطاء](./TROUBLESHOOTING.md) - حل المشاكل الشائعة
- [دليل الاختبار](./TESTING_GUIDE.md) - كتابة وتشغيل الاختبارات

---

## 📋 الوثائق الرئيسية في الجذر

هذه الملفات موجودة في المجلد الرئيسي للمشروع:

| الملف | الوصف |
|-------|-------|
| [README.md](../README.md) | نظرة عامة على المشروع |
| [CHANGELOG.md](../CHANGELOG.md) | سجل التغييرات |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | دليل المساهمة |
| [SECURITY.md](./SECURITY.md) | سياسة الأمان |
| [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) | دليل التثبيت |
| [LICENSE](../LICENSE) | ترخيص MIT |

---

## 🔗 روابط سريعة

### للمطورين الجدد
1. ابدأ بـ [دليل التثبيت](./INSTALLATION_GUIDE.md)
2. اقرأ [البنية المعمارية](../docs/ARCHITECTURE.md)
3. استكشف [مخطط قاعدة البيانات](../docs/DATABASE_SCHEMA.md)

### للمسؤولين
1. [دليل المستخدم](../userGuide.md)
2. [سياسة الأمان](./SECURITY.md)
3. [دليل النشر](./DEPLOYMENT.md)

### للمساهمين
1. [دليل المساهمة](./CONTRIBUTING.md)
2. [معايير الكود](./CONTRIBUTING.md#معايير-الكود)
3. [دليل الاختبار](./TESTING_GUIDE.md)

---

## 📞 الدعم

للحصول على المساعدة:
- **GitHub Issues:** [إنشاء مشكلة](https://github.com/wheb3543/bocam/issues)
- **البريد الإلكتروني:** abood22828@gmail.com

---

<a name="english"></a>

## 📚 Welcome to SGH CRM Portal Documentation

This comprehensive guide covers all aspects of the SGH CRM Portal - an integrated medical CRM platform for marketing campaign management, patient appointments, and WhatsApp integration.

### 🗂️ Documentation Structure

Documentation is organized in subdirectories by type:

```
docs/
├── guides/ (User Guides)
│   ├── USAGE_GUIDE.md
│   ├── PATIENT_PORTAL_GUIDE.md
│   ├── TESTING_GUIDE.md
│   ├── TROUBLESHOOTING.md
│   ├── userGuide.md
│   ├── EXPORT_FEATURE_GUIDE.md
│   └── QUICK_TEST.md
├── architecture/ (Architecture)
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── CACHING.md
├── api/ (API Documentation)
│   ├── META_INTEGRATION_GUIDE.md
│   ├── WEBHOOK_FIX_SUMMARY.md
│   ├── WHATSAPP_INTEGRATION_GUIDE.md
│   ├── WEBHOOK_DIAGNOSTICS.md
│   └── CHANGELOG_WEBHOOK_FIX.md
├── performance/ (Performance)
│   ├── PERFORMANCE_GUIDE.md
│   └── PERFORMANCE_REPORT.md
├── analysis/ (Analysis & Reports)
│   ├── ./analysis/AUDIT_AND_IMPROVEMENT_PLAN.md
│   ├── ./analysis/SYSTEM_REPORT.md
│   ├── WHATSAPP_SERVICES_ANALYSIS_REPORT.md
│   ├── ./analysis/IMPROVEMENT_ANALYSIS.md
│   ├── PRESENTATION_SUMMARY.md
│   ├── ANALYSIS_NOTES.md
│   ├── AUDIT_RESULTS.md
│   ├── table-audit-report.md
│   └── pages-inventory.md
├── saas/ (SaaS Documentation)
│   ├── SAAS_CHANGES_EXPLANATION.md
│   ├── SAAS_SERVICE_ISOLATION.md
│   ├── SAAS_WORKFLOW_EXPLANATION.md
│   └── SAAS_FIXED_VARIABLE_SERVICES.md
├── whatsapp/ (WhatsApp Documentation)
│   ├── ./whatsapp/WHATSAPP_NOTIFICATIONS_DOCUMENTATION.md
│   ├── ./whatsapp/WHATSAPP_PAGES_ANALYSIS.md
│   ├── WHATSAPP_TEMPLATES_REQUIRED.md
│   ├── WHATSAPP_TODO.md
│   ├── whatsapp-api-research-findings.md
│   ├── whatsapp-business-api-setup-guide.md
│   ├── whatsapp-fixes-technical-report.md
│   ├── whatsapp-improvements-plan.md
│   ├── whatsapp-marketing-messages-requirements.md
│   ├── whatsapp-pages-to-review.md
│   └── whatsapp-template-categories-analysis.md
├── implementation/ (Implementation Plans)
│   ├── IMPLEMENTATION_PLAN.md
│   ├── PHASE_ONE_IMPLEMENTATION.md
│   ├── PHASE_ZERO_IMPLEMENTATION.md
│   ├── PHASE_ZERO_SUMMARY.md
│   └── PLAN.md
├── archive/ (Old Archive)
│   ├── FIX_SUMMARY.txt
│   ├── IMPROVEMENTS_TODO.md
│   ├── SPECIFICATIONS.md
│   ├── TEMPLATE_TABLES_DOCUMENTATION.md
│   ├── VISION_DOCUMENT.md
│   ├── todo.md
│   └── test-webhook.sh
├── README.md
├── COMPONENTS.md
├── HOOKS_DOCUMENTATION.md
└── CODE_OF_CONDUCT.md
```

---

## 📖 Tutorials

Learning-oriented lessons for beginners.

### [Installation Guide](./INSTALLATION_GUIDE.md)
Learn how to install and run SGH CRM Portal in your development environment.

**What you'll learn:**
- Prerequisites (Node.js, pnpm, MySQL)
- Step-by-step installation
- Environment configuration
- Common troubleshooting

### [Quick Start Guide](../QUICK_TEST.md)
Get started quickly with the quick test guide.

---

## 🎯 How-to Guides

Practical guides for accomplishing specific tasks.

### Campaign Management
- [Campaign Management Guide](../docs/CAMPAIGNS_GUIDE.md) - Create and manage marketing campaigns
- [UTM Tracking](../docs/UTM_TRACKING.md) - Analyze traffic sources

### Appointment Management
- [Doctor Appointments](../docs/APPOINTMENTS_GUIDE.md) - Book and manage appointments
- [Appointment Scheduling](../docs/APPOINTMENT_SCHEDULING.md) - Setup automatic reminders

### Task Management
- [Tasks & Projects](../docs/TASKS_GUIDE.md) - Create and track tasks
- [Team Management](../docs/TEAMS_GUIDE.md) - Organize teams and roles

### WhatsApp
- [WhatsApp Complete Guide](../docs/WHATSAPP_INTEGRATION_GUIDE.md) - WhatsApp Business API integration
- [Broadcast Messaging](../docs/WHATSAPP_BROADCAST.md) - Mass messaging for campaigns
- [Auto Replies](../docs/WHATSAPP_AUTO_REPLY.md) - Setup automatic replies

### Patient Portal
- [Patient Portal Guide](../docs/PATIENT_PORTAL_GUIDE.md) - Using the patient portal

---

## 📚 References

Detailed technical information for developers.

### [Architecture](../docs/ARCHITECTURE.md)
Understand the system architecture.

**Contents:**
- Overall architecture diagram
- System components (Frontend, Backend, Database)
- Data flow
- Security measures
- Performance optimizations

### [Database Schema](../docs/DATABASE_SCHEMA.md)
Complete reference for all database tables.

**Contents:**
- 40+ tables with column details
- Table relationships
- Indexes and constraints
- Usage examples

### [API Reference](../docs/API_REFERENCE.md)
Complete tRPC endpoints documentation.

**Contents:**
- All routers and procedures
- Input/output types
- Usage examples

### [Deployment Guide](./DEPLOYMENT.md)
Guide for deploying to production.

**Contents:**
- Server requirements
- Deployment steps
- HTTPS setup
- Backup strategies

---

## 🧠 Explanation

Deeper understanding of system concepts.

### System Concepts
- [Permission System](./PERMISSIONS.md) - Understanding roles and permissions
- [Conversion Tracking](./CONVERSION_TRACKING.md) - How conversion tracking works
- [Meta Integration](./api/META_INTEGRATION_GUIDE.md) - Meta Pixel and Conversion API integration

### Best Practices
- [Data Security](./DATA_SECURITY.md) - Protecting patient data
- [Performance Optimization](./PERFORMANCE_GUIDE.md) - Optimizing system performance
- [Troubleshooting](./TROUBLESHOOTING.md) - Solving common issues
- [Testing Guide](./TESTING_GUIDE.md) - Writing and running tests

---

## 📋 Root Documentation Files

These files are located in the project root:

| File | Description |
|------|-------------|
| [README.md](../README.md) | Project overview |
| [CHANGELOG.md](../CHANGELOG.md) | Changelog |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contributing guide |
| [SECURITY.md](./SECURITY.md) | Security policy |
| [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) | Installation guide |
| [LICENSE](../LICENSE) | MIT License |

---

## 🔗 Quick Links

### For New Developers
1. Start with [Installation Guide](./INSTALLATION_GUIDE.md)
2. Read [Architecture](../docs/ARCHITECTURE.md)
3. Explore [Database Schema](../docs/DATABASE_SCHEMA.md)

### For Administrators
1. [User Guide](../userGuide.md)
2. [Security Policy](./SECURITY.md)
3. [Deployment Guide](./DEPLOYMENT.md)

### For Contributors
1. [Contributing Guide](./CONTRIBUTING.md)
2. [Code Standards](./CONTRIBUTING.md#code-standards)
3. [Testing Guide](./TESTING_GUIDE.md)

---

## 📞 Support

For help:
- **GitHub Issues:** [Create an issue](https://github.com/wheb3543/bocam/issues)
- **Email:** abood22828@gmail.com

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by Abdullkwy Alhatef

</div>