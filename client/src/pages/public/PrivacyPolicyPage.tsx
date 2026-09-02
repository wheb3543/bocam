/**
 * Privacy Policy Page - سياسة الخصوصية
 */

import { useEffect } from 'react';
import { Shield, Phone, Mail } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/HeroSection';
import AnimatedCard from '@/components/AnimatedCard';
import SectionDivider from '@/components/SectionDivider';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import BackToTopButton from '@/components/BackToTopButton';
import ScrollReveal from '@/components/ScrollReveal';
import { usePublicPageContent } from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { APP_TITLE, COMPANY_ARABIC_NAME, COMPANY_EMAIL, COMPANY_PHONE } from '@/const';

type PublicPageTextContent = {
  key: string;
  content: string;
};

type PrivacyCopy = {
  language: 'ar' | 'en';
  t: (key: string, fallback: string) => string;
};

function usePrivacyCopy(): PrivacyCopy {
  const { language } = useLanguage();
  const pageContentQuery = usePublicPageContent('privacy', language) as {
    data?: { textContents: PublicPageTextContent[] };
  };

  return {
    language,
    t: (key, fallback) =>
      pageContentQuery.data?.textContents.find((item) => item.key === `privacy.${key}.${language}`)
        ?.content || fallback,
  };
}

function PolicyHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-3 border-b border-green-100 pb-2">
      {children}
    </h2>
  );
}

function BulletList({ items, color = 'text-green-600' }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className={`${color} font-bold mt-0.5`}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  const copy = usePrivacyCopy();
  const browserTitle = copy.t('meta.browserTitle', `سياسة الخصوصية | ${APP_TITLE}`);

  useEffect(() => {
    document.title = browserTitle;
    window.scrollTo(0, 0);
  }, [browserTitle]);

  return (
    <PageLayout
      title={copy.t('meta.pageTitle', `سياسة الخصوصية - ${COMPANY_ARABIC_NAME}`)}
      description={copy.t(
        'meta.description',
        'سياسة حماية البيانات الشخصية والخصوصية وفقاً لنظام حماية البيانات في المملكة العربية السعودية'
      )}
      keywords={copy.t('meta.keywords', 'سياسة الخصوصية, حماية البيانات, PDPL')}
    >
      <PrivacyPolicyContent copy={copy} />
    </PageLayout>
  );
}

function PrivacyPolicyContent({ copy }: { copy: PrivacyCopy }) {
  const { t } = copy;
  const contactPhone = t('contact.phoneNumber', COMPANY_PHONE || '+966500000000');
  const contactEmail = t('contact.emailAddress', COMPANY_EMAIL || 'support@example.com');

  const dataCards = [
    {
      title: t('data.patient.title', 'أ. بيانات المريض والمستخدم'),
      body: t(
        'data.patient.body',
        'الاسم الكامل، رقم الهاتف، البريد الإلكتروني، العمر، الجنس، والبيانات الصحية الضرورية لتقديم الرعاية الطبية ومعالجة مطالبات التأمين.'
      ),
      className: 'bg-green-50',
      headingClassName: 'text-green-800',
      delay: 0.1,
    },
    {
      title: t('data.digital.title', 'ب. بيانات الخدمات الرقمية'),
      body: t(
        'data.digital.body',
        'تفاصيل التسجيل عبر الإنترنت، بيانات الحجز والمواعيد، والتفاعلات عبر تطبيقاتنا ومنصاتنا الرقمية.'
      ),
      className: 'bg-blue-50',
      headingClassName: 'text-blue-800',
      delay: 0.2,
    },
    {
      title: t('data.tracking.title', 'ج. بيانات التتبع والتحليل'),
      body: t(
        'data.tracking.body',
        'مصدر الزيارة (فيسبوك، واتساب، جوجل، أو مباشر)، مسار التنقل داخل الموقع، ومعلومات الجهاز والمتصفح — وذلك بناءً على موافقتك فقط.'
      ),
      className: 'bg-purple-50',
      headingClassName: 'text-purple-800',
      delay: 0.3,
    },
    {
      title: t('data.recovery.title', 'د. مسودات النماذج غير المكتملة (Lead Recovery)'),
      body: t(
        'data.recovery.body',
        'في حال بدأت ملء نموذج حجز ولم تكمله، قد نحفظ البيانات المُدخلة مؤقتاً (رقم الهاتف أو الاسم) للتواصل معك ومساعدتك في إتمام الحجز. يمكنك طلب حذف هذه البيانات في أي وقت.'
      ),
      className: 'bg-orange-50',
      headingClassName: 'text-orange-800',
      delay: 0.4,
    },
  ];

  const metaTools = [
    {
      title: t('metaTech.pixel.title', 'Meta Pixel'),
      body: t(
        'metaTech.pixel.body',
        'تتبع تحويلات الإعلانات وقياس فعالية حملاتنا التسويقية على فيسبوك وإنستغرام.'
      ),
    },
    {
      title: t('metaTech.conversions.title', 'Conversions API'),
      body: t(
        'metaTech.conversions.body',
        'مشاركة أحداث التحويل مع Meta من خادمنا مباشرةً لتحسين دقة قياس الإعلانات.'
      ),
    },
    {
      title: t('metaTech.audiences.title', 'Custom Audiences'),
      body: t(
        'metaTech.audiences.body',
        'إنشاء جماهير مخصصة لاستهداف إعلانات ذات صلة بناءً على تفاعلاتك مع خدماتنا.'
      ),
    },
    {
      title: t('metaTech.utm.title', 'UTM Tracking'),
      body: t(
        'metaTech.utm.body',
        'تتبع مصدر زيارتك (فيسبوك، واتساب، جوجل) لتحسين تجربتك وتخصيص العروض.'
      ),
    },
  ];

  const cookieRows = [
    {
      type: t('cookies.essential.type', 'الأساسية'),
      purpose: t('cookies.essential.purpose', 'تشغيل الموقع، الجلسات، الأمان'),
      required: t('cookies.essential.required', 'نعم دائماً'),
      requiredClassName: 'text-green-700 font-medium',
      rowClassName: '',
    },
    {
      type: t('cookies.analytics.type', 'التحليلية'),
      purpose: t('cookies.analytics.purpose', 'قياس حركة المرور وتحسين الموقع'),
      required: t('cookies.analytics.required', 'بموافقتك'),
      requiredClassName: 'text-orange-600',
      rowClassName: 'bg-gray-50',
    },
    {
      type: t('cookies.marketing.type', 'التسويقية'),
      purpose: t('cookies.marketing.purpose', 'الإعلانات وإعادة الاستهداف (Meta Pixel)'),
      required: t('cookies.marketing.required', 'بموافقتك'),
      requiredClassName: 'text-orange-600',
      rowClassName: '',
    },
  ];

  const rights = [
    {
      title: t('rights.information.title', 'الإعلام'),
      body: t('rights.information.body', 'الحق في معرفة كيفية استخدام بياناتك.'),
    },
    {
      title: t('rights.access.title', 'الوصول'),
      body: t('rights.access.body', 'الحق في الاطلاع على بياناتك الشخصية المحفوظة لدينا.'),
    },
    {
      title: t('rights.erasure.title', 'الحذف'),
      body: t('rights.erasure.body', 'الحق في طلب حذف بياناتك عند انتفاء الحاجة إليها.'),
    },
    {
      title: t('rights.withdrawal.title', 'سحب الموافقة'),
      body: t('rights.withdrawal.body', 'الحق في سحب موافقتك على المعالجة الاختيارية في أي وقت.'),
    },
    {
      title: t('rights.correction.title', 'التصحيح'),
      body: t('rights.correction.body', 'الحق في تصحيح أو تحديث بياناتك غير الدقيقة أو الناقصة.'),
    },
    {
      title: t('rights.copy.title', 'نسخة من البيانات'),
      body: t('rights.copy.body', 'الحق في الحصول على نسخة من بياناتك الشخصية.'),
    },
  ];

  return (
    <div className="space-y-6" dir={copy.language === 'ar' ? 'rtl' : 'ltr'}>
      <ReadingProgressBar color="green" />

      <HeroSection
        title={t('title', 'سياسة الخصوصية')}
        subtitle={t('hero.lastUpdated', 'آخر تحديث: مارس 2026')}
        description={t(
          'hero.description',
          `يلتزم ${COMPANY_ARABIC_NAME || 'BOCAM'} بحماية خصوصيتك وصون بياناتك الشخصية وفقاً لأحكام نظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL)`
        )}
        badge={{ text: t('badge', 'حماية البيانات'), icon: Shield }}
        backgroundGradient="from-green-800 to-green-600"
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <ScrollReveal delay={0.1}>
          <AnimatedCard
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10 space-y-8 text-gray-700 leading-relaxed"
            delay={0.1}
            hoverEffect={false}
          >
            <section>
              <PolicyHeading>{t('intro.heading', '1. المقدمة')}</PolicyHeading>
              <p className="text-sm sm:text-base">
                {t(
                  'intro.paragraph1',
                  `يلتزم ${COMPANY_ARABIC_NAME || 'BOCAM'} بحماية خصوصيتك وصون بياناتك الشخصية وفقاً لأحكام نظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL) وأفضل الممارسات الدولية. تُوضّح هذه السياسة كيفية جمع بياناتك واستخدامها وتخزينها ومشاركتها، وكيف نضمن التعامل معها بمسؤولية وشفافية تامة.`
                )}
              </p>
              <p className="text-sm sm:text-base mt-3">
                {t(
                  'intro.paragraph2',
                  'تنطبق هذه السياسة على جميع الخدمات الرقمية التي نقدمها، بما في ذلك موقعنا الإلكتروني، وتطبيق الجوال، وخدمات الحجز الإلكتروني، والتواصل عبر واتساب وفيسبوك وإنستغرام.'
                )}
              </p>
            </section>

            <SectionDivider color="green" />

            <section>
              <PolicyHeading>{t('data.heading', '2. البيانات التي نجمعها')}</PolicyHeading>
              <p className="text-sm sm:text-base mb-4">
                {t(
                  'data.intro',
                  'نجمع فقط البيانات الضرورية لتقديم خدماتنا الصحية وإدارة عملياتنا وتلبية المتطلبات القانونية والتنظيمية، وتشمل:'
                )}
              </p>
              <div className="space-y-4">
                {dataCards.map((card) => (
                  <AnimatedCard
                    key={card.title}
                    className={`${card.className} rounded-lg p-4`}
                    delay={card.delay}
                    hoverEffect={false}
                  >
                    <h3
                      className={`font-semibold ${card.headingClassName} text-sm sm:text-base mb-2`}
                    >
                      {card.title}
                    </h3>
                    <p className="text-sm">{card.body}</p>
                  </AnimatedCard>
                ))}
              </div>
            </section>

            <SectionDivider color="green" />

            <section>
              <PolicyHeading>{t('collection.heading', '3. طرق جمع البيانات')}</PolicyHeading>
              <p className="text-sm sm:text-base">
                {t(
                  'collection.body',
                  'نجمع بياناتك من خلال وسائل آمنة وقانونية، تشمل: النماذج الإلكترونية وتطبيقات الجوال وبوابات المرضى، وأنظمة المعلومات الصحية والسجلات الطبية الإلكترونية، وملفات تعريف الارتباط (Cookies) عند استخدامك لموقعنا أو منصاتنا الرقمية، والتواصل المباشر عبر الهاتف أو واتساب أو وسائل التواصل الاجتماعي.'
                )}
              </p>
            </section>

            <section>
              <PolicyHeading>
                {t('whatsapp.heading', '4. استخدام واتساب للأعمال (WhatsApp Business API)')}
              </PolicyHeading>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-5">
                <p className="text-sm sm:text-base mb-3">
                  {t(
                    'whatsapp.intro',
                    `يستخدم ${COMPANY_ARABIC_NAME || 'BOCAM'} واجهة برمجة تطبيقات واتساب للأعمال المُقدَّمة من شركة Meta Platforms, Inc. لأغراض التواصل مع المرضى والمستخدمين، وتشمل:`
                  )}
                </p>
                <BulletList
                  items={[
                    t('whatsapp.item1', 'إرسال تأكيدات الحجز والمواعيد الطبية فور التسجيل.'),
                    t('whatsapp.item2', 'إرسال تذكيرات بالمواعيد والفحوصات الطبية.'),
                    t(
                      'whatsapp.item3',
                      'إرسال عروض طبية وحملات توعوية صحية (بموافقتك المسبقة فقط).'
                    ),
                    t('whatsapp.item4', 'التواصل لمتابعة الحجوزات غير المكتملة وتقديم المساعدة.'),
                  ]}
                />
                <p className="text-sm mt-3 text-gray-600">
                  <strong>{t('whatsapp.notePrefix', 'ملاحظة:')}</strong>{' '}
                  {t(
                    'whatsapp.noteBeforeLink',
                    'يُعالَج رقم هاتفك عبر خوادم Meta وفقاً لسياسة خصوصية Meta المتاحة على'
                  )}{' '}
                  <a
                    href="https://www.whatsapp.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline"
                  >
                    {t('whatsapp.privacyLinkLabel', 'whatsapp.com/legal/privacy-policy')}
                  </a>
                  {t(
                    'whatsapp.noteAfterLink',
                    '. يمكنك إلغاء الاشتراك في رسائل واتساب التسويقية في أي وقت بإرسال كلمة "إلغاء" أو التواصل معنا مباشرة.'
                  )}
                </p>
              </div>
            </section>

            <section>
              <PolicyHeading>
                {t('metaTech.heading', '5. تقنيات Meta للإعلانات والقياس')}
              </PolicyHeading>
              <p className="text-sm sm:text-base mb-3">
                {t(
                  'metaTech.intro',
                  'بموافقتك على ملفات تعريف الارتباط التسويقية، قد نستخدم تقنيات Meta (فيسبوك وإنستغرام) لأغراض قياس أداء الإعلانات وتحسين تجربتك، وتشمل:'
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metaTools.map((tool) => (
                  <div key={tool.title} className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-1">{tool.title}</h4>
                    <p className="text-xs text-gray-600">{tool.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <PolicyHeading>{t('use.heading', '6. كيف نستخدم بياناتك')}</PolicyHeading>
              <p className="text-sm sm:text-base">
                {t(
                  'use.body',
                  'تُستخدم بياناتك لدعم الأنشطة الصحية والإدارية، وتشمل: تقديم الخدمات الطبية عالية الجودة والآمنة، وإدارة سجلات الموظفين والمستشفى، والوفاء بالالتزامات القانونية والتنظيمية، وضمان التواصل الفعّال وتنسيق الخدمات، وتحسين تجربة المستخدم على منصاتنا الرقمية، وإرسال تحديثات وعروض ذات صلة بخدماتنا (بموافقتك فقط).'
                )}
              </p>
            </section>

            <section>
              <PolicyHeading>{t('sharing.heading', '7. مشاركة البيانات')}</PolicyHeading>
              <p className="text-sm sm:text-base mb-3">
                {t(
                  'sharing.intro',
                  'لا نبيع بياناتك الشخصية لأي طرف ثالث. نشارك البيانات فقط عند الضرورة ولأغراض مشروعة، تشمل:'
                )}
              </p>
              <BulletList
                items={[
                  t('sharing.item1', 'المختبرات والمرافق الطبية لأغراض التشخيص والعلاج.'),
                  t('sharing.item2', 'شركات التأمين لمعالجة المطالبات والتسويات.'),
                  t(
                    'sharing.item3',
                    'مزودي الخدمات التقنية (مثل Meta وGoogle) لأغراض الإعلانات والتحليل — بموافقتك.'
                  ),
                  t('sharing.item4', 'الجهات الحكومية عند الاقتضاء القانوني.'),
                ]}
              />
            </section>

            <section>
              <PolicyHeading>
                {t('cookies.heading', '8. ملفات تعريف الارتباط (Cookies)')}
              </PolicyHeading>
              <p className="text-sm sm:text-base mb-4">
                {t(
                  'cookies.intro',
                  'يستخدم موقعنا وتطبيقاتنا ملفات تعريف الارتباط لضمان التشغيل السلس وتحسين تجربتك. يمكنك إدارة تفضيلاتك عبر شريط الموافقة الذي يظهر عند زيارة الموقع لأول مرة.'
                )}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="border border-gray-200 p-2 text-right font-semibold text-green-800">
                        {t('cookies.table.type', 'النوع')}
                      </th>
                      <th className="border border-gray-200 p-2 text-right font-semibold text-green-800">
                        {t('cookies.table.purpose', 'الغرض')}
                      </th>
                      <th className="border border-gray-200 p-2 text-right font-semibold text-green-800">
                        {t('cookies.table.required', 'إلزامي؟')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieRows.map((row) => (
                      <tr key={row.type} className={row.rowClassName}>
                        <td className="border border-gray-200 p-2 font-medium">{row.type}</td>
                        <td className="border border-gray-200 p-2">{row.purpose}</td>
                        <td className={`border border-gray-200 p-2 ${row.requiredClassName}`}>
                          {row.required}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <PolicyHeading>
                {t('pwa.heading', '9. التطبيق التدريجي (PWA) والتخزين المحلي')}
              </PolicyHeading>
              <p className="text-sm sm:text-base">
                {t(
                  'pwa.body',
                  'يدعم موقعنا تقنية التطبيق التدريجي (Progressive Web App) التي تتيح لك تثبيته على جهازك والوصول إليه بدون إنترنت. لتحقيق ذلك، نستخدم التخزين المحلي (LocalStorage وIndexedDB وService Worker Cache) لحفظ بعض البيانات على جهازك، مثل تفضيلاتك وبيانات الحجوزات المؤقتة. هذه البيانات تبقى على جهازك فقط ولا تُرسل إلى خوادمنا إلا عند استعادة الاتصال بالإنترنت.'
                )}
              </p>
            </section>

            <section>
              <PolicyHeading>{t('storage.heading', '10. تخزين البيانات وحمايتها')}</PolicyHeading>
              <p className="text-sm sm:text-base mb-3">
                {t(
                  'storage.intro',
                  'تُخزَّن بياناتك بصورة رئيسية داخل المملكة العربية السعودية. في حالات محدودة، قد تُعالَج خارج المملكة وفق ضمانات وعقود معتمدة بموجب نظام حماية البيانات الشخصية (PDPL).'
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">
                    {t('storage.technical.title', 'التدابير التقنية')}
                  </h4>
                  <BulletList
                    items={[
                      t('storage.technical.item1', 'تشفير البيانات أثناء النقل والتخزين'),
                      t('storage.technical.item2', 'التحكم في الوصول والمصادقة متعددة العوامل'),
                      t('storage.technical.item3', 'جدران الحماية وأنظمة مكافحة الفيروسات'),
                      t('storage.technical.item4', 'اختبارات أمنية دورية'),
                    ]}
                    color="text-gray-600"
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">
                    {t('storage.retention.title', 'فترات الاحتفاظ')}
                  </h4>
                  <BulletList
                    items={[
                      t(
                        'storage.retention.item1',
                        'سجلات المرضى: 10 سنوات (وفق متطلبات وزارة الصحة)'
                      ),
                      t('storage.retention.item2', 'ملفات الموارد البشرية: مدة العمل + 5 سنوات'),
                      t('storage.retention.item3', 'بيانات التأمين: وفق القوانين المالية'),
                      t('storage.retention.item4', 'السجلات الرقمية: 1-3 سنوات'),
                    ]}
                    color="text-gray-600"
                  />
                </div>
              </div>
            </section>

            <section>
              <PolicyHeading>
                {t('rights.heading', '11. حقوقك بموجب نظام حماية البيانات الشخصية (PDPL)')}
              </PolicyHeading>
              <p className="text-sm sm:text-base mb-4">
                {t('rights.intro', 'يحق لك ممارسة الحقوق التالية في أي وقت:')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rights.map((right) => (
                  <div
                    key={right.title}
                    className="flex items-start gap-3 bg-green-50 rounded-lg p-3"
                  >
                    <Shield className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-sm text-green-800">{right.title}: </span>
                      <span className="text-sm text-gray-700">{right.body}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm mt-4 text-gray-600">
                {t(
                  'rights.responseTime',
                  'ستُعالَج جميع الطلبات الصحيحة خلال 30 يوماً، مع إمكانية التمديد 30 يوماً إضافية عند الاقتضاء القانوني.'
                )}
              </p>
            </section>

            <section>
              <PolicyHeading>
                {t('optout.heading', '12. إلغاء الاشتراك وحذف البيانات')}
              </PolicyHeading>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5">
                <p className="text-sm sm:text-base mb-3">{t('optout.intro', 'يمكنك في أي وقت:')}</p>
                <BulletList
                  color="text-amber-600"
                  items={[
                    t(
                      'optout.item1',
                      'إلغاء الاشتراك في الرسائل التسويقية عبر واتساب بإرسال كلمة "إلغاء" أو "STOP".'
                    ),
                    t(
                      'optout.item2',
                      'إلغاء الاشتراك في رسائل البريد الإلكتروني التسويقية عبر رابط "إلغاء الاشتراك" في أسفل كل رسالة.'
                    ),
                    t(
                      'optout.item3',
                      'طلب حذف بياناتك الشخصية بالكامل من خلال التواصل مع مسؤول حماية البيانات.'
                    ),
                    t(
                      'optout.item4',
                      'إدارة تفضيلات ملفات تعريف الارتباط عبر شريط الموافقة أو إعدادات المتصفح.'
                    ),
                  ]}
                />
              </div>
            </section>

            <section>
              <PolicyHeading>{t('children.heading', '13. بيانات الأطفال')}</PolicyHeading>
              <p className="text-sm sm:text-base">
                {t(
                  'children.body',
                  'نحرص على حماية خصوصية الأطفال. لا يمكن إنشاء حسابات إلا للأفراد الذين تجاوزوا سن الثامنة عشرة. بالنسبة للأطفال، يجب أن يُنشئ الحساب ويُدار من قِبل أحد الوالدين أو الأوصياء القانونيين.'
                )}
              </p>
            </section>

            <section>
              <PolicyHeading>
                {t('contact.heading', '14. التواصل مع مسؤول حماية البيانات')}
              </PolicyHeading>
              <p className="text-sm sm:text-base mb-4">
                {t(
                  'contact.body',
                  `إذا كنت ترغب في ممارسة أي من حقوقك المتعلقة بحماية البيانات، أو إذا كنت تعتقد أن بياناتك الشخصية قد تعرضت لسوء المعالجة، يمكنك التواصل مع مسؤول حماية البيانات في ${COMPANY_ARABIC_NAME || 'BOCAM'}:`
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`tel:${contactPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">{t('contact.phoneLabel', 'هاتف')}</p>
                    <p className="font-medium text-sm">{contactPhone}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors"
                >
                  <Mail className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">
                      {t('contact.emailLabel', 'بريد إلكتروني')}
                    </p>
                    <p className="font-medium text-sm">{contactEmail}</p>
                  </div>
                </a>
              </div>
              <p className="text-sm mt-4 text-gray-600">
                {t(
                  'contact.complaint',
                  'إذا لم تكن راضياً عن ردنا خلال 30 يوماً، يمكنك تقديم شكوى إلى المركز الوطني للمعلومات (Yemen-NIC).'
                )}
              </p>
            </section>

            <section>
              <PolicyHeading>{t('updates.heading', '15. تحديثات سياسة الخصوصية')}</PolicyHeading>
              <p className="text-sm sm:text-base">
                {t(
                  'updates.body',
                  'قد نُحدّث هذه السياسة من وقت لآخر لتعكس التغييرات القانونية أو التشغيلية. ستكون النسخة الأحدث متاحة دائماً على موقعنا الرسمي. في حال إجراء تغييرات جوهرية، سنُخطرك عبر البريد الإلكتروني أو إشعار بارز على الموقع.'
                )}
              </p>
              <p className="text-sm mt-3 text-gray-500">
                {t('updates.lastUpdated', 'آخر تحديث لهذه السياسة: مارس 2026')}
              </p>
            </section>
          </AnimatedCard>
        </ScrollReveal>
      </main>

      <BackToTopButton threshold={300} />
    </div>
  );
}
