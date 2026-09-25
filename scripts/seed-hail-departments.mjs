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
    const [existing] = await conn.execute('SELECT id FROM departments WHERE slug = ? OR name = ?', [
      dept.slug,
      dept.name,
    ]);

    if (Array.isArray(existing) && existing.length > 0) {
      const id = existing[0].id;
      await conn.execute(
        'UPDATE departments SET name = ?, nameEn = ?, slug = ?, description = ?, icon = ?, sortOrder = ?, isActive = 1, image = COALESCE(image, ?) WHERE id = ?',
        [
          dept.name,
          dept.nameEn,
          dept.slug,
          dept.description,
          dept.icon,
          dept.sortOrder,
          bundledImage,
          id,
        ]
      );
      console.log('Updated:', dept.name);
    } else {
      await conn.execute(
        'INSERT INTO departments (name, nameEn, slug, description, icon, sortOrder, isActive, image) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
        [
          dept.name,
          dept.nameEn,
          dept.slug,
          dept.description,
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
