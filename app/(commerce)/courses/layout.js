export const metadata = {
  title: "الدورات التدريبية",
  description:
    "تصفح جميع الدورات التدريبية الطبية المتاحة على منصة دحيحة ميديكال. اختر الدورة المناسبة لك وابدأ رحلتك التعليمية.",
  keywords: [
    "دورات طبية",
    "كورسات طب",
    "تدريب طبي",
    "دورات علوم صحية",
    "تعليم طبي أونلاين",
  ],
  openGraph: {
    title: "الدورات التدريبية - دحيحة ميديكال",
    description:
      "استعرض جميع الدورات التدريبية المتاحة في مجال الطب والعلوم الصحية.",
    type: "website",
  },
};

export default function CoursesLayout({ children }) {
  return <>{children}</>;
}
