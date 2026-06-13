# SGH CRM Portal - دليل البدء السريع

منصة إدارة علاقات العملاء للمستشفى السعودي الألماني - صنعاء

## 🚀 البدء السريع

### المتطلبات الأساسية
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **MySQL** >= 8.0 (اختياري للتطوير - يمكن استخدام وضع Mock)

### خطوات التثبيت

#### 1. تثبيت Node.js و pnpm
```bash
# تثبيت Node.js من: https://nodejs.org/

# تثبيت pnpm
npm install -g pnpm
```

#### 2. تثبيت المكتبات
```bash
pnpm install
```

#### 3. إعداد ملف البيئة
```bash
cp .env.example .env
```

#### 4. تشغيل المشروع
```bash
pnpm dev
```

المشروع سيعمل على: `http://localhost:3000`

## ⚠️ المشاكل الشائعة

### خطأ: "Missing required environment variables"
**الحل:** تأكد من إنشاء ملف `.env` من `.env.example`

### خطأ: "Node.js not found"
**الحل:** تثبيت Node.js من https://nodejs.org/

### خطأ: "pnpm not found"
**الحل:** تثبيت pnpm: `npm install -g pnpm`

### تحذير: "Redis Connection Error"
**الحل:** Redis اختياري، يمكن تجاهل هذا التحذير

## 📚 التوثيق الكامل

- [دليل التثبيت التفصيلي](INSTALLATION_GUIDE.md)
- [دليل المستخدم](docs/userGuide.md)
- [دليل المساهمة](CONTRIBUTING.md)
- [الوثائق الكاملة](README.md)

## 💡 نصائح

- للمطورين الجدد: ابدأ بقراءة [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- للمشاكل: راجع قسم استكشاف الأخطاء في INSTALLATION_GUIDE.md
- للأسئلة: تواصل عبر GitHub Issues

---

**نرعاكم كأهالينا - Caring like family**
