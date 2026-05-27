# دليل Docker - BOCAM CRM Platform

## نظرة عامة

هذا الدليل يشرح كيفية تشغيل BOCAM CRM Platform باستخدام Docker و Docker Compose.

## المتطلبات

- Docker Engine 20.10+
- Docker Compose 2.0+

## التثبيت السريع

### 1. إعداد ملف البيئة

```bash
# نسخ ملف المثال
cp deploy/.docker.env.example deploy/.docker.env

# تعديل القيم المطلوبة
nano deploy/.docker.env
```

### 2. إعداد الترخيص

تأكد من وجود هذه الملفات في المجلد الرئيسي:
- `license.json` - ملف الترخيص
- `license-keys/` - مجلد مفاتيح RSA

### 3. تشغيل Docker Compose

```bash
cd deploy
docker-compose up -d
```

### 4. الوصول إلى التطبيق

افتح المتصفح على: http://localhost:3000

## الأوامر

### بدء التشغيل

```bash
# تشغيل جميع الخدمات في الخلفية
docker-compose up -d

# تشغيل مع عرض السجلات
docker-compose up
```

### إيقاف التشغيل

```bash
# إيقاف جميع الخدمات
docker-compose down

# إيقاف وإزالة الحاويات والشبكات
docker-compose down --volumes
```

### عرض السجلات

```bash
# عرض سجلات جميع الخدمات
docker-compose logs -f

# عرض سجلات خدمة معينة
docker-compose logs -f bocam-crm
docker-compose logs -f mysql
```

### إعادة بناء

```bash
# إعادة بناء الصورة
docker-compose build

# إعادة بناء بدون cache
docker-compose build --no-cache

# إعادة بناء وتشغيل
docker-compose up -d --build
```

### الدخول إلى الحاوية

```bash
# الدخول إلى حاوية التطبيق
docker-compose exec bocam-crm sh

# الدخول إلى حاوية MySQL
docker-compose exec mysql bash
```

## البنية

### الخدمات

#### bocam-crm
- الصورة: مبنية من `Dockerfile`
- المنافذ: 3000:3000
- يعتمد على: mysql
- فحص صحة: كل 30 ثانية

#### mysql
- الصورة: mysql:8.0
- المنافذ: 3306:3306
- التخزين: mysql-data volume
- فحص صحة: كل 10 ثواني

### الشبكات

- bocam-network: شبكة bridge للاتصال بين الحاويات

### التخزين

- mysql-data: حجم محلي لقاعدة البيانات

## الترقية

### لتحديث التطبيق:

```bash
# سحب التحديثات
git pull

# إعادة بناء
docker-compose up -d --build

# إزالة الصور القديمة
docker image prune -f
```

### لتحديث قاعدة البيانات:

```bash
# الدخول إلى حاوية التطبيق
docker-compose exec bocam-crm sh

# تشغيل الترحيلات
pnpm db:push
```

## النسخ الاحتياطي

### نسخ احتياطي لقاعدة البيانات:

```bash
# إنشاء نسخة احتياطية
docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} bocam_crm > backup_$(date +%Y%m%d).sql
```

### استعادة النسخة الاحتياطية:

```bash
# استعادة النسخة الاحتياطية
docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} bocam_crm < backup_20250527.sql
```

## استكشاف الأخطاء

### الحاوية لا تبدأ:

```bash
# عرض سجلات الحاوية
docker-compose logs bocam-crm

# عرض حالة الخدمات
docker-compose ps

# التحقق من فحص الصحة
docker inspect --format='{{json .State.Health}}' bocam-crm
```

### مشاكل في قاعدة البيانات:

```bash
# عرض سجلات MySQL
docker-compose logs mysql

# الاتصال بقاعدة البيانات
docker-compose exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD}

# إعادة تشغيل MySQL
docker-compose restart mysql
```

### مشاكل في الترخيص:

```bash
# التحقق من وجود ملف الترخيص
docker-compose exec bocam-crm ls -la /app/license.json

# عرض ملف الترخيص
docker-compose exec bocam-crm cat /app/license.json

# التحقق من المفاتيح
docker-compose exec bocam-crm ls -la /app/license-keys/
```

### منافذ مشغولة:

```bash
# عرض المنافذ المشغولة
lsof -i :3000
lsof -i :3306

# تغيير المنافذ في docker-compose.yml
# ports:
#   - "3001:3000"
#   - "3307:3306"
```

## الأمان

### أفضل الممارسات:

1. ✅ استخدم كلمات مرور قوية في `.docker.env`
2. ✅ لا ترتكب `.docker.env` إلى Git
3. ✅ استخدم SSL/HTTPS في الإنتاج
4. ✅ قم بتحديث Docker بانتظام
5. ✅ استخدم Non-root user (مُطبق بالفعل)
6. ✅ استخدم Health Checks (مُطبق بالفعل)

### استخدام Nginx Reverse Proxy:

 uncomment قسم nginx في `docker-compose.yml` وأنشئ ملف `nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://bocam-crm:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## الموارد

### مراقبة الموارد:

```bash
# استخدام الموارد للحاويات
docker stats

# استخدام القرص
docker system df

# تنظيف الموارد غير المستخدمة
docker system prune -a
```

### تكوين الموارد:

في `docker-compose.yml`:

```yaml
bocam-crm:
  # ...
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

## الإنتاج

### للإنتاج:

1. ✅ استخدم قاعدة بيانات خارجية (TiDB Cloud أو MySQL المدار)
2. ✅ استخدم CDN للملفات الثابتة
3. ✅ استخدم Redis للتخزين المؤقت
4. ✅ استخدم Nginx مع SSL
5. ✅ استخدم Docker Swarm أو Kubernetes
6. ✅ قم بمراقبة السجلات والمنبهات

### مثال تكوين الإنتاج:

```yaml
services:
  bocam-crm:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '4'
          memory: 4G
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${PRODUCTION_DATABASE_URL}
      # ...
```

## الدعم

إذا واجهت مشاكل:

1. راجع هذا الدليل
2. راجع `docs/TROUBLESHOOTING.md`
3. اتصل بفريق إيديا

---

**تم التحديث:** 2026-05-27  
**الإصدار:** 1.0
