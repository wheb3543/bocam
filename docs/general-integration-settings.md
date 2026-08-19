# إعدادات الربط العامة للنشر الاجتماعي

تجمع صفحة **إعدادات الربط العامة** في لوحة التحكم بيانات التطبيقات الخاصة بمنصات Meta وX وLinkedIn وYouTube وTikTok. لا تمنح هذه الصفحة أي حساب صلاحية نشر تلقائياً؛ فهي تحفظ إعدادات التطبيق فقط حتى تصبح المنصة جاهزة لمرحلة تفويض OAuth وربط الحسابات المصرح بها.

| المنصة | الحقول المحفوظة | نطاقات البداية في البوابة | المرجع الرسمي |
|---|---|---|---|
| Meta | App ID، ومعرّفات الحسابات، وApp Secret وVerify Token وPage Access Token | بحسب تطبيق Meta وWebhook | [وثائق Meta Webhooks](https://developers.facebook.com/docs/graph-api/webhooks/) |
| X | Client ID وClient Secret | `tweet.read tweet.write users.read offline.access media.write` | [وثائق X API](https://docs.x.com/x-api) |
| LinkedIn | Client ID وClient Secret | `openid profile w_member_social w_organization_social` | [وثائق LinkedIn](https://learn.microsoft.com/linkedin/) |
| YouTube | Client ID وClient Secret | `https://www.googleapis.com/auth/youtube.upload` | [YouTube Data API](https://developers.google.com/youtube/v3) |
| TikTok | Client ID وClient Secret | `video.publish user.info.basic` | [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started/) |

## قواعد الحماية

يُخزّن `Client Secret` لكل منصة خارجية باستخدام **AES-256-GCM** بالمفتاح الأساسي المشتق من `JWT_SECRET`. لا يعيد راوتر `generalIntegrations.status` قيمة السر؛ بل يعيد فقط العلامة `hasClientSecret`. يمكن للمسؤول استبدال السر بإدخال قيمة جديدة، أو ترك الحقل فارغاً للإبقاء على القيمة المشفرة الحالية.

| الحالة | المعنى | الإجراء المطلوب |
|---|---|---|
| `not_configured` | لم تُحفظ بيانات التطبيق الكاملة، أو أن المنصة غير مفعلة. | أدخل Client ID وClient Secret ثم فعّل المنصة. |
| `ready_for_oauth` | حُفظت بيانات التطبيق كاملة والمنصة مفعلة. | انتقل إلى تنفيذ OAuth وربط حساب/قناة/منظمة مصرح بها. |

## حدود المرحلة الحالية

لا تنفذ هذه المرحلة مسارات OAuth أو تخزين Access/Refresh Tokens أو إنشاء حسابات نشر خارجية، ولذلك **لا يجب تسجيل أي Redirect URI جديد من هذه البوابة في لوحات المطورين حتى تُنفذ مرحلة OAuth**. يبقى مسار Meta Webhook الحالي مستقلاً ومتاحاً على:

```text
/api/webhooks/meta-social-inbox
```

عند تنفيذ OAuth لكل منصة، يجب إضافة مسار Callback فعلي والتحقق من `state` وربط التوكن المشفر بسجل `social_publish_accounts`، ثم اختبار النشر الحي بحساب تجريبي قبل تفعيل وجهات الإنتاج.

## تحقق النشر المجدول

تعمل مهمة Heartbeat الخاصة بفحص المنشورات المستحقة كل دقيقة على المسار `POST /api/scheduled/social-publish`. معرّف المهمة المحفوظ هو `Q5m3AUHncuZofeQMWVSmmc`. بعد نشر إصلاح توافق Cookie v2، أكدت أحدث عملية تنفيذ ناجحة استجابة `HTTP 200` بالنتيجة `ok: true`؛ ولم يكن هناك منشور مستحق وقت الفحص، ولذلك ظهرت العدادات `inspected: 0` و`locked: 0` و`skipped: 0`.

> يجب أن يستمر التحقق من النجاح عند إنشاء أول منشور مجدول فعلي، إذ سيتغير عداد `inspected` ليثبت أن المهمة التقطت منشوراً مستحقاً وأغلقته بأمان قبل توزيعه.
