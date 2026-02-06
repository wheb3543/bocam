import { drizzle } from "drizzle-orm/mysql2";
import { doctors } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const doctorsData = [
  { name: "أ.د أحمد الحضراني", specialty: "استشاري جراحة القلب", image: "/assets/doctors/أ.داحمدالحضراني.jpg" },
  { name: "أ.د علي العمري", specialty: "استشاري جراحة العظام", image: "/assets/doctors/أ.دعليالعمري.jpg" },
  { name: "أ.د ماجد عامر", specialty: "استشاري جراحة المسالك البولية", image: "/assets/doctors/أ.دماجدعامر.jpg" },
  { name: "د. أحلام مصطفى", specialty: "استشارية نساء وولادة", image: "/assets/doctors/داحلاممصطفى.jpg" },
  { name: "د. أمجد مصطفى", specialty: "استشاري أمراض الباطنة", image: "/assets/doctors/دامجدمصطفى.jpg" },
  { name: "د. حسام مطهر", specialty: "استشاري جراحة عامة", image: "/assets/doctors/دحساممطهر.jpg" },
  { name: "د. خالد الطهيف", specialty: "استشاري أنف وأذن وحنجرة", image: "/assets/doctors/دخالدالطهيف.jpg" },
  { name: "د. خالد القهالي", specialty: "استشاري جراحة الأطفال", image: "/assets/doctors/دخالدالقهالي.jpg" },
  { name: "د. خالد صالح", specialty: "استشاري طب الأطفال", image: "/assets/doctors/دخالدصالح.jpg" },
  { name: "د. خلود الديلمي", specialty: "استشارية الأمراض الجلدية", image: "/assets/doctors/دخلودالديلمي.jpg" },
  { name: "د. سحر عنتر", specialty: "استشارية طب الأسرة", image: "/assets/doctors/دسحرعنتر.jpg" },
  { name: "د. سعيد القرشي", specialty: "استشاري جراحة المخ والأعصاب", image: "/assets/doctors/دسعيدالقرشي.jpg" },
  { name: "د. سناء الأثوري", specialty: "استشارية أمراض النساء والتوليد", image: "/assets/doctors/دسناءالأثوري.jpg" },
  { name: "د. صخر الفقية", specialty: "استشاري جراحة التجميل", image: "/assets/doctors/دصخرالفقية.jpg" },
  { name: "د. علية شعيب", specialty: "استشارية طب العيون", image: "/assets/doctors/دعليةشعيب.jpg" },
  { name: "د. فاطمة الخولاني", specialty: "استشارية الأشعة التشخيصية", image: "/assets/doctors/دفاطمةالخولاني.jpg" },
  { name: "د. فهد لطف الله", specialty: "استشاري جراحة الأوعية الدموية", image: "/assets/doctors/دفهدلطفالله.jpg" },
  { name: "د. قاسم الناظري", specialty: "استشاري أمراض القلب", image: "/assets/doctors/دقاسمالناظري.jpg" },
  { name: "د. قاسم شقحان", specialty: "استشاري جراحة الكلى", image: "/assets/doctors/دقاسمشقحان.jpg" },
  { name: "د. ناصر الوائلي", specialty: "استشاري الطب النفسي", image: "/assets/doctors/دناصرالوائلي.jpg" },
  { name: "د. نجاة محمد", specialty: "استشارية التغذية العلاجية", image: "/assets/doctors/دنجاةمحمد.jpg" },
  { name: "د. نسيبة الكحلاني", specialty: "استشارية طب الأطفال", image: "/assets/doctors/دنسيبةالكحلاني.jpg" },
];

console.log("Inserting doctors data...");

for (const doctor of doctorsData) {
  await db.insert(doctors).values(doctor);
  console.log(`✓ Added: ${doctor.name}`);
}

console.log("✅ All doctors added successfully!");
process.exit(0);
