import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

const departmentImages = {
  'dermatology-and-cosmetics': '/sgh/departments/dermatology.jpg',
  'anesthesia-pain-management': '/sgh/departments/anesthesia.jpg',
  'general-surgery': '/sgh/departments/surgery.jpg',
  'internal-medicine': '/sgh/departments/internal.jpg',
  'psychiatry-behavioral-health': '/sgh/departments/psychiatry.jpg',
  'pediatrics-neonatology': '/sgh/departments/pediatrics.jpg',
  'orthopedics-trauma': '/sgh/departments/orthopedics.jpg',
  'cardiology-cardiothoracic': '/sgh/departments/cardiology.jpg',
  'obstetrics-gynecology': '/sgh/departments/obgyn.jpg',
  'emergency-department': '/sgh/departments/emergency.jpg',
  urology: '/sgh/departments/urology.jpg',
  'vascular-surgery': '/sgh/departments/vascular.jpg',
};

const departmentDetails = {
  'dermatology-and-cosmetics': {
    tagline: 'خبرة عالمية لبشرة مثالية',
    fullDescription:
      'نقدم تشخيصاً وعلاجاً متخصصاً للأمراض الجلدية مع خطط تجميل مصممة حسب احتياجات البشرة الفردية، تحت إشراف أطباء معتمدين دولياً.',
    services: [
      'الأمراض الجلدية الشائعة والمزمنة',
      'حب الشباب وآثاره',
      'الأكزيما والتهاب الجلد',
      'التصبغات وآثارها',
      'علاج الشعر والأظافر',
    ],
    advancedTechniques: [
      'الليزر الموجه للآفات الجلدية',
      'حقن البوتوكس والفيلر',
      'الميكرونيدلينج لتحسين نسيج البشرة',
    ],
  },
  'anesthesia-pain-management': {
    tagline: 'رحلة آمنة نحو التعافي',
    fullDescription:
      'نقدم رعاية متخصصة للتخدير وإدارة الألم قبل العمليات وبعدها، بهدف تحسين التعافي وفق أعلى معايير السلامة.',
    services: ['تخدير العمليات الجراحية', 'إدارة الألم الحاد والمزمن', 'تقييم ما قبل التخدير'],
    advancedTechniques: [
      'مراقبة الحساسية القلبية والتنفسية',
      'تسكين متقدم للألم بعد الجراحة',
      'خطط تسكين مخصصة لكل حالة',
    ],
  },
  'general-surgery': {
    tagline: 'دقة ورعاية يمكنك الوثوق بها',
    fullDescription:
      'نقدم تجربة جراحية متكاملة يرافقك فيها فريق خبرائنا من الاستعداد وفق بروتوكولات عالمية حتى التعافي.',
    services: [
      'السمنة',
      'الفتق',
      'البواسير',
      'الدوالي',
      'الغدة الدرقية',
      'المرارة',
      'القولون والمستقيم',
      'الحروق',
      'الارتجاع المريئي',
    ],
    advancedTechniques: [
      'جراحة المنظار المتقدمة',
      'جراحة المنظار داخل البطن',
      'استئصال الزائدة الدودية',
      'استئصال المرارة',
      'إصلاح الفتق بالمنظار',
      'علاجات البواسير بالليزر',
    ],
  },
  'internal-medicine': {
    tagline: 'رعاية شاملة لصحة وعافية',
    fullDescription:
      'نجمع بين الرعاية الشاملة والخطط الوقائية لتشخيص الأمراض الباطنية وإدارتها وفق أحدث الممارسات الطبية.',
    services: ['الأمراض المزمنة', 'أمراض الجهاز الهضمي والكبد', 'الغدد الصماء', 'الفحوصات الدورية'],
    advancedTechniques: [
      'متابعة الأمراض المزمنة',
      'التقييم الشامل',
      'برامج الوقاية وطب نمط الحياة',
    ],
  },
  'psychiatry-behavioral-health': {
    tagline: 'دعم صحتك النفسية، هدفنا',
    fullDescription: 'نقدم رعاية نفسية شاملة في بيئة آمنة تحترم الخصوصية وتدعم المريض في كل مرحلة.',
    services: [
      'الاكتئاب والقلق',
      'اضطرابات النوم',
      'استشارات الأطفال والمراهقين',
      'الدعم بعد الصدمات',
    ],
    advancedTechniques: ['العلاج المعرفي السلوكي', 'العلاج الأسري', 'خطط علاج فردية متخصصة'],
  },
  'pediatrics-neonatology': {
    tagline: 'رعاية شاملة لجميع احتياجات طفلك',
    fullDescription: 'وحدات مجهزة للأطفال وحديثي الولادة تقدم رعاية دقيقة على مدار الساعة.',
    services: ['فحص صحة الطفل', 'التطعيمات ومتابعة النمو', 'رعاية حديثي الولادة', 'طوارئ الأطفال'],
    advancedTechniques: [
      'العناية المركزة لحديثي الولادة',
      'دعم التنفس غير التداخلي',
      'مراقبة النمو والتطور',
    ],
  },
  'orthopedics-trauma': {
    tagline: 'رعاية متخصصة لحركة أفضل',
    fullDescription:
      'نقدم علاجاً متخصصاً للمفاصل والعمود الفقري والإصابات لاستعادة الحركة وتحسين جودة الحياة.',
    services: ['إصابات المفاصل', 'آلام العمود الفقري', 'الكسور', 'جراحات العظام'],
    advancedTechniques: [
      'المناظير العلاجية',
      'جراحات المفاصل',
      'إعادة بناء الرباط',
      'التأهيل الحركي',
    ],
  },
  'cardiology-cardiothoracic': {
    tagline: 'رعاية قلبية متخصصة',
    fullDescription: 'نقدم رعاية متكاملة لمرضى القلب والصدر عبر فريق وأجهزة متخصصة.',
    services: ['قصور القلب', 'الذبحة الصدرية', 'اضطرابات نظم القلب', 'جراحة القلب والصدر'],
    advancedTechniques: ['قسطرة القلب', 'أجهزة القلب التداخلية', 'مراقبة القلب المستمرة'],
  },
  'obstetrics-gynecology': {
    tagline: 'رعاية استثنائية في كل الأوقات',
    fullDescription: 'ندعم المرأة عبر خدمات نسائية وتوليد متكاملة يهتم بالأم والطفل.',
    services: ['متابعة الحمل والولادة', 'أمراض النساء', 'العقم', 'اضطرابات الدورة'],
    advancedTechniques: ['السونار المتقدم', 'جراحات المناظير', 'رعاية الحمل عالي الخطورة'],
  },
  'emergency-department': {
    tagline: 'صحتك أولويتنا على مدار الساعة',
    fullDescription: 'نوفر استقبالاً سريعاً وتقييماً فورياً للحالات العاجلة على مدار الساعة.',
    services: [
      'الإسعافات الأولية',
      'تقييم الحالات العاجلة',
      'أمراض القلب الحادة',
      'الإصابات والحوادث',
    ],
    advancedTechniques: [
      'الإنعاش القلبي الرئوي',
      'مراقبة العلامات الحيوية',
      'التصوير المقطعي والأشعة',
    ],
  },
  urology: {
    tagline: 'حلول متخصصة لصحة الجهاز البولي',
    fullDescription: 'نقدم تشخيصاً وعلاجاً متكاملاً لأمراض الكلى والمثانة والبروستات.',
    services: ['حصوات الكلى', 'أمراض البروستات', 'قصور الكلى', 'التهابات المسالك البولية'],
    advancedTechniques: ['المناظير البولية', 'إزالة الحصى بالليزر', 'متابعة وظائف الكلى'],
  },
  'vascular-surgery': {
    tagline: 'رعاية متطورة للشرايين والأوردة',
    fullDescription: 'نقدم تشخيصاً وعلاجاً لأمراض الشرايين والأوردة والدوالي بتقنيات حديثة.',
    services: ['تضيق الشرايين', 'التمددات الشريانية', 'الدوالي', 'مضاعفات القدم السكري'],
    advancedTechniques: ['القسطرة التداخلية', 'جراحة الأوعية', 'التقييم غير التداخلي'],
  },
};

const depts = [
  {
    name: 'الأمراض الجلدية والتجميل',
    nameEn: 'Dermatology & Cosmetics',
    slug: 'dermatology-and-cosmetics',
    description:
      'خبرة عالمية لبشرة مثالية. اكتشف أسرار العناية بالبشرة مع أفضل خبراء الجلد لدينا، والمعتمدين دولياً. حيث يقدمون لك أحدث التقنيات في مجال الجلدية، مع خطط علاج شخصية مصممة خصيصاً لبشرتك.',
    icon: 'Sparkles',
    sortOrder: 1,
  },
  {
    name: 'التخدير وإدارة الألم',
    nameEn: 'Anesthesia & Pain Management',
    slug: 'anesthesia-pain-management',
    description:
      'رحلتك نحو التعافي بأمان. العلاج المتميز للتخدير في المستشفى السعودي الألماني، إننا نلتزم بتقديم خدمات التخدير الشاملة والمتميزة، بخبرة واسعة في التعامل مع مختلف الحالات الشائعة والمزمنة بأمان تام.',
    icon: 'Pill',
    sortOrder: 2,
  },
  {
    name: 'الجراحة العامة والتخصصية',
    nameEn: 'General & Specialized Surgery',
    slug: 'general-surgery',
    description:
      'دقة ورعاية يمكنك الوثوق بها. اختبر تحولاً حقيقياً في حياتك بفضل خبرتنا الواسعة ورعايتنا المتقدمة في وحدة الجراحة العامة والتخصصية، مصممة لتحقيق نتائج علاجية استثنائية.',
    icon: 'Stethoscope',
    sortOrder: 3,
  },
  {
    name: 'الطب الباطني',
    nameEn: 'Internal Medicine',
    slug: 'internal-medicine',
    description:
      'رعاية شاملة لصحة وعافية. نجمع بين الرعاية الشاملة والخطط الوقائية في قسم الطب الباطني لتشخيص وإدارة الأمراض بأحدث التقنيات والممارسات الطبية العالمية.',
    icon: 'Activity',
    sortOrder: 4,
  },
  {
    name: 'الطب النفسي والصحة السلوكية',
    nameEn: 'Psychiatry & Behavioral Health',
    slug: 'psychiatry-behavioral-health',
    description:
      'دعم صحتك النفسية، هدفنا. في المستشفى السعودي الألماني، نقدم لك الرعاية الشاملة التي تحتاجها لتحسين صحتك النفسية والعاطفية تحت إشراف طاقم متخصص وفي بيئة مريحة.',
    icon: 'Brain',
    sortOrder: 5,
  },
  {
    name: 'طب الأطفال وحديثي الولادة',
    nameEn: 'Pediatrics & Neonatology',
    slug: 'pediatrics-neonatology',
    description:
      'رعاية شاملة لجميع احتياجات طفلك. وحدات العناية المركزة للأطفال وحديثي الولادة مجهزتان بأحدث التقنيات مع طاقم طبي متفانٍ يوفر الرعاية الدقيقة على مدار الساعة.',
    icon: 'Baby',
    sortOrder: 6,
  },
  {
    name: 'طب العظام ورعاية الإصابات',
    nameEn: 'Orthopedics & Trauma',
    slug: 'orthopedics-trauma',
    description:
      'رعاية متخصصة لصحة العمود الفقري والمفاصل. نقدم لك رعاية شاملة لآلام العمود الفقري والمفاصل مع علاجات متخصصة وجراحات دقيقة للمساعدة على سرعة الشفاء واستعادة الحركة.',
    icon: 'Bone',
    sortOrder: 7,
  },
  {
    name: 'طب القلب وجراحة القلب والصدر',
    nameEn: 'Cardiology & Cardiothoracic Surgery',
    slug: 'cardiology-cardiothoracic',
    description:
      'رعاية قلبية متخصصة. احظى برعاية قلبية متكاملة في مركزنا المتخصص، حيث نجمع بين أحدث التقنيات والرعاية الاستثنائية مع فريقنا متعدد التخصصات من أطباء وجراحي القلب.',
    icon: 'HeartPulse',
    sortOrder: 8,
  },
  {
    name: 'قسم أمراض النساء والتوليد',
    nameEn: 'Obstetrics & Gynecology',
    slug: 'obstetrics-gynecology',
    description:
      'رعاية استثنائية في كل الأوقات. احظي برعاية استثنائية في قسم أمراض النساء والتوليد في المستشفى السعودي الألماني، حيث نلتزم بدعم المرأة في جميع مراحل حياتها بخبرة واسعة.',
    icon: 'Users',
    sortOrder: 9,
  },
  {
    name: 'قسم الطوارئ',
    nameEn: 'Emergency Department',
    slug: 'emergency-department',
    description:
      'صحتك أولويتنا على مدار 24 ساعة. اختبر تجربة رعاية استثنائية بقسم الطوارئ في المستشفى السعودي الألماني، حيث يقدم فريقنا المتميز دعماً سريعاً لتلبية احتياجاتك الطبية العاجلة.',
    icon: 'ShieldAlert',
    sortOrder: 10,
  },
  {
    name: 'قسم المسالك البولية',
    nameEn: 'Urology',
    slug: 'urology',
    description:
      'حلول شاملة لأمراض الجهاز البولي والتناسلي. نقدم رعاية شاملة ومتخصصة لجميع مشاكل الجهاز البولي، بدءاً من التشخيص الدقيق وجراحة المناظير وحتى العلاج المتقدم.',
    icon: 'Thermometer',
    sortOrder: 11,
  },
  {
    name: 'قسم الأوعية الدموية',
    nameEn: 'Vascular Surgery',
    slug: 'vascular-surgery',
    description:
      'رعاية متطورة لصحة الشرايين والأوردة. تشخيص وعلاج أمراض الأوعية الدموية والقدم السكري والدوالي بتقنيات القسطرة التداخلية والجراحة الحديثة.',
    icon: 'Heart',
    sortOrder: 12,
  },
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('Connected to DB');

  for (const dept of depts) {
    const bundledImage = departmentImages[dept.slug] ?? null;
    const details = departmentDetails[dept.slug] ?? {
      tagline: 'رعاية متخصصة',
      fullDescription: dept.description,
      services: ['التشخيص الطبي المتخصص', 'خطط علاج مخصصة', 'متابعة طبية مستمرة'],
      advancedTechniques: ['أحدث الأجهزة الطبية', 'خبرة الكادر الطبي', 'متابعة متخصصة'],
    };
    const detailsJson = {
      tagline: details.tagline,
      fullDescription: details.fullDescription,
      services: JSON.stringify(details.services),
      advancedTechniques: JSON.stringify(details.advancedTechniques),
    };
    const [existing] = await conn.execute('SELECT id FROM departments WHERE slug = ? OR name = ?', [
      dept.slug,
      dept.name,
    ]);

    if (Array.isArray(existing) && existing.length > 0) {
      const id = existing[0].id;
      await conn.execute(
        "UPDATE departments SET name = ?, nameEn = ?, slug = ?, description = ?, icon = ?, sortOrder = ?, isActive = 1, image = COALESCE(image, ?), tagline = COALESCE(NULLIF(tagline, ''), ?), fullDescription = COALESCE(NULLIF(fullDescription, ''), ?), services = COALESCE(NULLIF(services, ''), ?), advancedTechniques = COALESCE(NULLIF(advancedTechniques, ''), ?) WHERE id = ?",
        [
          dept.name,
          dept.nameEn,
          dept.slug,
          dept.description,
          dept.icon,
          dept.sortOrder,
          bundledImage,
          detailsJson.tagline,
          detailsJson.fullDescription,
          detailsJson.services,
          detailsJson.advancedTechniques,
          id,
        ]
      );
      console.log('Updated:', dept.name);
    } else {
      await conn.execute(
        'INSERT INTO departments (name, nameEn, slug, description, tagline, fullDescription, services, advancedTechniques, icon, sortOrder, isActive, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
        [
          dept.name,
          dept.nameEn,
          dept.slug,
          dept.description,
          detailsJson.tagline,
          detailsJson.fullDescription,
          detailsJson.services,
          detailsJson.advancedTechniques,
          dept.icon,
          dept.sortOrder,
          bundledImage,
        ]
      );
      console.log('Inserted:', dept.name);
    }
  }

  const [current] = await conn.execute(
    'SELECT id, name, slug, image FROM departments ORDER BY sortOrder ASC'
  );
  console.log('Final departments count:', current.length);
  console.table(current);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
