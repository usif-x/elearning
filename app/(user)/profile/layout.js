export const metadata = {
  title: "الملف الشخصي",
  description: "إدارة ملفك الشخصي وبياناتك ونتائجك على منصة دحيحة ميديكال.",
  keywords: ["ملف شخصي", "حساب المستخدم", "نتائج الاختبارات", "إعدادات الحساب"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "الملف الشخصي - دحيحة ميديكال",
    description: "إدارة ملفك الشخصي وبياناتك ونتائجك على منصة دحيحة ميديكال.",
    type: "website",
  },
};

export default function ProfileLayout({ children }) {
  return <>{children}</>;
}
