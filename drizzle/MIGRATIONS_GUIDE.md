# دليل Migrations | Migrations Guide

## نظرة عامة | Overview

يحتوي مجلد `drizzle/` على 64 ملف migration تتبع تغييرات قاعدة البيانات. معظم الملفات من 0002 إلى 0063 هي placeholder migrations (no-op) تم إنشاؤها للحفاظ على تسلسل الـ migration journal.

This folder contains 64 migration files that track database changes. Most files from 0002 to 0063 are placeholder migrations (no-op) created to preserve the migration journal sequence.

---

## الملفات الرئيسية | Key Files

### 0001_initial_schema.sql
- **الوصف**: Schema مبدئي لقاعدة البيانات
- **المحتوى**: جدول `__drizzle_migrations` لـ Drizzle ORM
- **الحالة**: Active

### 0064_patient_portal_tables.sql
- **الوصف**: جداول بوابة المريض
- **المحتوى**: 
  - `patients` - جدول المرضى
  - `patientOtps` - جدول رموز OTP
  - `patientResults` - جدول نتائج المرضى
- **الحالة**: Active

---

## Placeholder Migrations (0002-0063)

هذه الملفات هي placeholder migrations (no-op) تم إنشاؤها للحفاظ على تسلسل الـ migration journal. كل ملف يحتوي على عبارة `SELECT 1;` فقط.

These files are placeholder migrations (no-op) created to preserve the migration journal sequence. Each file contains only a `SELECT 1;` statement.

- **0002_ancient_overlord.sql** - Placeholder
- **0004_big_pretty_boy.sql** - Placeholder
- **0005_wakeful_arachne.sql** - Placeholder
- **0006_tricky_grim_reaper.sql** - Placeholder
- **0007_furry_prism.sql** - Placeholder
- **0008_aromatic_hitman.sql** - Placeholder
- **0009_regular_risque.sql** - Placeholder
- **0010_puzzling_warpath.sql** - Placeholder
- **0011_lean_kingpin.sql** - Placeholder
- **0012_bizarre_madrox.sql** - Placeholder
- **0013_powerful_mad_thinker.sql** - Placeholder
- **0014_next_the_phantom.sql** - Placeholder
- **0015_fat_the_hand.sql** - Placeholder
- **0016_sudden_joystick.sql** - Placeholder
- **0017_thankful_callisto.sql** - Placeholder
- **0018_smooth_the_liberteens.sql** - Placeholder
- **0019_optimal_mandarin.sql** - Placeholder
- **0020_peaceful_speed_demon.sql** - Placeholder
- **0021_steady_deathbird.sql** - Placeholder
- **0022_short_tempest.sql** - Placeholder
- **0023_damp_changeling.sql** - Placeholder
- **0024_fat_silhouette.sql** - Placeholder
- **0025_cynical_blue_shield.sql** - Placeholder
- **0026_worthless_squadron_supreme.sql** - Placeholder
- **0027_quick_blizzard.sql** - Placeholder
- **0028_cheerful_green_goblin.sql** - Placeholder
- **0029_common_zuras.sql** - Placeholder
- **0030_sleepy_franklin_richards.sql** - Placeholder
- **0031_violet_sunspot.sql** - Placeholder
- **0032_glossy_hedge_knight.sql** - Placeholder
- **0033_boring_cardiac.sql** - Placeholder
- **0034_rainy_lucky_pierre.sql** - Placeholder
- **0035_quick_skreet.sql** - Placeholder
- **0036_past_satana.sql** - Placeholder
- **0037_wooden_jack_flag.sql** - Placeholder
- **0038_pretty_vapor.sql** - Placeholder
- **0039_sudden_venus.sql** - Placeholder
- **0040_warm_lionheart.sql** - Placeholder
- **0041_calm_fixer.sql** - Placeholder
- **0042_quick_justin_hammer.sql** - Placeholder
- **0043_quick_epoch.sql** - Placeholder
- **0044_hesitant_puck.sql** - Placeholder
- **0045_steady_prowler.sql** - Placeholder
- **0046_hard_pandemic.sql** - Placeholder
- **0047_concerned_tusk.sql** - Placeholder
- **0048_calm_drax.sql** - Placeholder
- **0049_left_ikaris.sql** - Placeholder
- **0050_lush_micromacro.sql** - Placeholder
- **0051_salty_vance_astro.sql** - Placeholder
- **0052_eminent_peter_parker.sql** - Placeholder
- **0053_optimal_frank_castle.sql** - Placeholder
- **0054_dear_charles_xavier.sql** - Placeholder
- **0055_kind_vampiro.sql** - Placeholder
- **0056_smooth_glorian.sql** - Placeholder
- **0057_damp_loners.sql** - Placeholder
- **0058_parched_timeslip.sql** - Placeholder
- **0059_lowly_bishop.sql** - Placeholder
- **0060_overjoyed_mariko_yashida.sql** - Placeholder
- **0061_ambitious_lilandra.sql** - Placeholder
- **0062_sharp_morlocks.sql** - Placeholder
- **0063_spotty_king_cobra.sql** - Placeholder

---

## مجلد meta/ | meta/ Folder

يحتوي مجلد `meta/` على 60 ملف snapshot.json وملف _journal.json. هذه الملفات تستخدم بواسطة Drizzle ORM لتتبع حالة الـ migrations.

The `meta/` folder contains 60 snapshot.json files and a _journal.json file. These files are used by Drizzle ORM to track migration state.

### _journal.json
- **الوصف**: سجل الـ migrations
- **المحتوى**: قائمة بجميع الـ migrations مع timestamps و tags
- **الأهمية**: مهم جداً - لا تقم بتعديله يدوياً

### snapshot.json files
- **الوصف**: لقطات من حالة قاعدة البيانات
- **الاستخدام**: تتبع التغييرات في schema

---

## ملفات Schema | Schema Files

### schema.ts
- **الوصف**: تعريف schema قاعدة البيانات باستخدام Drizzle ORM
- **الحجم**: ~73KB

### relations.ts
- **الوصف**: تعريف العلاقات بين الجداول
- **الحجم**: ~467B

---

## ملاحظات مهمة | Important Notes

⚠️ **تحذير**: لا تقم بإعادة تسمية ملفات migration لأنها مرتبطة بـ _journal.json. إعادة التسمية قد تؤدي إلى مشاكل في نظام التتبع.

⚠️ **Warning**: Do not rename migration files as they are linked to _journal.json. Renaming may cause tracking system issues.

💡 **نصيحة**: إذا كنت بحاجة إلى إضافة migration جديد، استخدم Drizzle CLI أو `drizzle-kit` لتوليد الـ migration تلقائياً.

💡 **Tip**: If you need to add a new migration, use Drizzle CLI or `drizzle-kit` to generate the migration automatically.

---

## إدارة Migrations | Managing Migrations

### إنشاء migration جديد | Creating a new migration
```bash
pnpm drizzle-kit generate
```

### تطبيق migrations | Applying migrations
```bash
pnpm drizzle-kit push
```

### التحقق من حالة migrations | Checking migration status
```bash
pnpm drizzle-kit studio
```

---

## الدعم | Support

للمزيد من المعلومات، راجع [Drizzle Documentation](https://orm.drizzle.team/).

For more information, see [Drizzle Documentation](https://orm.drizzle.team/).
