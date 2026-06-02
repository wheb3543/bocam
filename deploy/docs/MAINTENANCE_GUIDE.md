# دليل الصيانة - BOCAM CRM Platform

## نظرة عامة

هذا الدليل يوفر الإرشادات لصيانة BOCAM CRM Platform بشكل دوري واستكشاف المشاكل الشائعة وحلها.

## الصيانة اليومية

### فحص صحة السيرفر

```bash
# فحص حالة السيرفر
curl http://localhost:3000/api/trpc/license.getInfo

# فحص سجلات السيرفر
tail -f server.log  # أو النظر في وحدة التحكم إذا كان صندوق dev
```

### فحص نظام الترخيص

```bash
# التحقق من الترخيص
curl http://localhost:3000/api/trpc/license.getInfo

# التحقق من حالة Heartbeat (اختياري إذا كان مُنشأ)
cat .heartbeat-log
```

### فحص قاعدة البيانات

```bash
# الاتصال بقاعدة البيانات
mysql -u root -p bocam_crm

# فحص حجم قاعدة البيانات
SELECT 
  table_schema "Database Name",
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) "Database Size (MB)"
FROM information_schema.tables
WHERE table_schema = 'bocam_crm'
GROUP BY table_schema;

# فحص عدد الجداول
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'bocam_crm';
```

## الصيانة الأسبوعية

### نسخ احتياطية لقاعدة البيانات

```bash
# إنشاء نسخة احتياطية
mysqldump -u root -p bocam_crm > backup_$(date +%Y%m%d).sql

# ضغط النسخة الاحتياطية
gzip backup_$(date +%Y%m%d).sql

# تخزين في مكان آمن (Cloud/تخزين خارجي)
```

### فحص التراخيص

```bash
# فحص انتهاء الترخيص
curl http://localhost:3000/api/trpc/license.getInfo | jq '.daysUntilExpiry'

# إذا كان أقل من 30 يومًا، حذر المسؤول
```

### تحديث الحزم (التطوير فقط)

```bash
# فحص التحديثات المتاحة
pnpm outdated

# تحديث الحزم (بعد الاختبار)
pnpm update
```

### فحص سجلات النظام

```bash
# سجلات Heartbeat
cat .heartbeat-log | tail -20

# سجلات Update Checker
cat .update-log | tail -20

# حالة التحديث المعلق
cat .update-state

# سجلات الأخطاء
tail -f server.log | grep ERROR
```

## الصيانة الشهرية

### تحديث الأمان

```bash
# تحديث Node.js (إذا كان هناك إصدارات أمان)
nvm install <version>
nvm use <version>
pnpm install

# تحديث MySQL/MariaDB
sudo apt-get update && sudo apt-get upgrade mysql-server  # Ubuntu
# أو
brew upgrade mariadb  # macOS
```

### أرشفة السجلات القديمة

```bash
# إنشاء مجلد للأرشيف
mkdir -p logs/archive

# نقل السجلات القديمة
mv server_*.log logs/archive/
mv heartbeat.log logs/archive/
mv update.log logs/archive/

# ضغط السجلات القديمة
gzip logs/archive/*.log
```

### فحص أداء قاعدة البيانات

```bash
# تحليل بطء الاستعلامات
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

# تحليل جداول كبيرة
SELECT 
  table_name,
  table_rows,
  ROUND(data_length / 1024 / 1024, 1) AS data_mb,
  ROUND(index_length / 1024 / 1024, 1) AS index_mb
FROM information_schema.tables
WHERE table_schema = 'bocam_crm'
ORDER BY data_length DESC
LIMIT 10;
```

### فحص أمان السيرفر

```bash
# فحص صحة SSL (إذا كان مُستخدم)
openssl s_client -connect your-domain.com:443

# فحص تكوين الجدار الناري
sudo ufw status  # Ubuntu
# أو
sudo firewall-cmd --list-all  # RHEL/CentOS

# فحص الملفات المشبوهة
find . -name "*.js" -type f -exec grep -l "eval" {} \;
```

## الصيانة السنوية

### تجديد التراخيص

1. فحص تاريخ انتهاء الترخيص
2. اتصل بفريق إيديا للتجديد
3. استبدال license.json بالترخيص الجديد
4. إعادة تشغيل السيرفر

### مراجعة بنية البيانات

```bash
# فحص جداول غير مستخدمة
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'bocam_crm'
AND table_name NOT IN (
  SELECT DISTINCT table_name
  FROM information_schema.table_constraints
);

# فحص فهود غير مستخدمة
SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'bocam_crm';
```

### تحديث النظام الكامل

```bash
# تحديث نظام التشغيل
sudo apt-get update && sudo apt-get upgrade -y  # Ubuntu

# تحديث Docker (إذا كان مُستخدم)
docker system prune -a
```

## استكشاف الأخطاء الشائعة

### السيرفر لا يعمل

#### الخطوات:

1. **فحص حالة السيرفر**
```bash
ps aux | grep node
```

2. **فحص المنافذ المشغولة**
```bash
lsof -i :3000
```

3. **فحص سجلات الأخطاء**
```bash
tail -100 server.log
```

4. **إعادة تشغيل السيرفر**
```bash
# إذا كان يعمل بـ PM2
pm2 restart bocam

# إذا كان يعمل يدويً
pnpm start
```

### خطأ في الترخيص

#### الخطوات:

1. **التحقق من وجود license.json**
```bash
ls -la license.json
```

2. **التحقق من التوقيع الرقمي**
```bash
pnpm dev
```

3. **استعادة نسخة احتياطية من الترخيص**
```bash
cp license.json.backup license.json
```

4. **طلب ترخيص جديدة من إيديا**

### خطأ في قاعدة البيانات

#### الخطوات:

1. **فحص حالة MySQL**
```bash
sudo systemctl status mysql
```

2. **فحص الاتصال**
```bash
mysql -u root -p bocam_crm
```

3. **فحص تكوين DATABASE_URL**
```bash
cat .env | grep DATABASE_URL
```

4. **إعادة تشغيل MySQL**
```bash
sudo systemctl restart mysql
```

### خطأ في الذاكرة (Out of Memory)

#### الخطوات:

1. **فحص استخدام الذاكرة**
```bash
free -h
```

2. **فحص عمليات Node.js**
```bash
ps aux | grep node | awk '{print $6}' | awk '{sum+=$1} END {print sum}'
```

3. **زيادة الذاكرة المخصصة**
```bash
# في package.json، أضف:
# "scripts": {
#   "start": "node --max-old-space-size=4096 server/dist/index.js"
# }
```

4. **إضافة تبديل (Swap)**
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### خطأ في أداء السيرفر

#### الخطوات:

1. **فحص استخدام CPU**
```bash
top -bn1 | grep "Cpu(s)"
```

2. **فحص الاستعلامات البطيئة**
```bash
# في MySQL
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

3. **إضافة فهرسة (Indexing)**
```bash
# فحص الجداول البطيئة
EXPLAIN SELECT * FROM your_slow_query;
```

4. **تقليل حجم قاعدة البيانات**
```bash
# أرشفة البيانات القديمة
INSERT INTO archive_table SELECT * FROM main_table WHERE date < '2024-01-01';
DELETE FROM main_table WHERE date < '2024-01-01';
```

## الأمان والترقيع

### الحماية من هجمات SQL Injection

النظام يستخدم Drizzle ORM الذي يحمي تلقائياً من SQL injection.

### الحماية من XSS

النظام يستخدم React الذي يهرب المحتوى تلقائياً.

### الحماية من CSRF

تأكد من استخدام الكوكيز مع `httpOnly` و `sameSite`:

```javascript
// في ملف التكوين
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
}
```

### الحماية من Clock Tampering

النظام لديه حماية ضد التلاعب بوقت النظام. راجع `LICENSE_GUIDE.md` للاختبار.

### نظام Heartbeat

النظام يرسل نبضة كل 24 ساعة إلى السيرفر المركزي للمراقبة عن بعد:

**فحص Heartbeat:**
```bash
# عرض سجل Heartbeat
cat .heartbeat-log

# عرض آخر 10 نبضات
cat .heartbeat-log | tail -10

# عرض وقت آخر تشغيل ناجح
cat .last-successful-run
```

**استكشاف أخطاء Heartbeat:**
- إذا لم تكن هناك نبضات جديدة، تحقق من اتصال الإنترنت
- تحقق من صحة `CENTRAL_ACTIVATION_URL` في `.env`
- تحقق من أن الترخيص صالح

### نظام Update Checker

النظام يتحقق من التحديثات عند الإقلاع وكل 6 ساعات:

**فحص Update Checker:**
```bash
# عرض سجل التحقق من التحديثات
cat .update-log

# عرض حالة التحديث المعلق
cat .update-state

# عرض آخر 10 عمليات تحقق
cat .update-log | tail -10
```

**استكشاف أخطاء Update Checker:**
- إذا فشل التحقق، تحقق من اتصال الإنترنت
- تحقق من صحة `CENTRAL_UPDATE_URL` في `.env`
- تحقق من إصدار البروتوكول `PROTOCOL_VERSION`

## المراقبة والتنبيهات

### إعداد التنبيهات

يمكنك استخدام أدوات مثل:
- **Uptime Robot** - مراقبة الخدمة
- **Sentry** - مراقبة الأخطاء
- **Grafana** - مراقبة الأداء
- **Healthchecks.io** - مراقبة Cron jobs

### مؤشرات الأداء

راقب هذه المؤشرات:
- ✅ uptime سيرفر > 99%
- ✅ وقت استجابة API < 200ms
- ✅ استخدام CPU < 80%
- ✅ استخدام الذاكرة < 80%
- ✅ Heartbeat يعمل يومياً (كل 24 ساعة)
- ✅ Update Checker يعمل (كل 6 ساعات)
- ✅ الترخيص صالح > 30 يوم

## النسخ الاحتياطية والاستعادة

### النسخ الاحتياطي التلقائي

```bash
# إضافة Cron job للنسخ الاحتياطي اليومي
# 0 2 * * * mysqldump -u root -pPASSWORD bocam_crm > /backups/bocam_$(date +\%Y\%m\%d).sql
```

### استعادة من النسخ الاحتياطي

```bash
# إنشاء قاعدة بيانات جديدة
mysql -u root -p -e "CREATE DATABASE bocam_crm_new"

# استيراد النسخة الاحتياطية
mysql -u root -p bocam_crm_new < backup_20250527.sql

# تحديث DATABASE_URL في .env
```

## الدعم الفني

### عند مواجهة مشكلة:

1. ✅ راجع `docs/TROUBLESHOOTING.md`
2. ✅ فحص السجلات الأخيرة
3. ✅ تأكد من أن الترخيص صالح
4. ✅ تحقق من اتصال قاعدة البيانات
5. ✅ اتصل بفريق إيديا مع:
   - وصف المشكلة
   - لقطات من السجلات
   - خطوات إعادة الإنتاج
   - Hardware ID الحالي

### جمع المعلومات للتقارير

```bash
# معلومات النظام
echo "=== System Info ==="
uname -a
echo ""

echo "=== Node Version ==="
node -v
echo ""

echo "=== Memory ==="
free -h
echo ""

echo "=== Disk Usage ==="
df -h
echo ""

echo "=== Recent Logs ==="
tail -50 server.log
```

## تحديثات النظام

### قبل التحديث

1. ✅ إنشاء نسخة احتياطية كاملة
2. ✅ اختبار التحديث في بيئة التطوير
3. ✅ توثيق النسخة الحالية
4. ✅ إخبار المستخدمين

### بعد التحديث

1. ✅ فحص السيرفر
2. ✅ اختبار جميع الميزات
3. ✅ فحص السجلات
4. ✅ إخبار المستخدمين عن التغييرات

---

**تم التحديث:** 2026-05-27  
**الإصدار:** 1.0
