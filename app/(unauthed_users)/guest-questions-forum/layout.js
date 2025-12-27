import Footer from "../../../components/layout/Footer";
import Navbar from "../../../components/layout/Navbar";

export const metadata = {
  title: "منتدى الأسئلة للزوار",
  description:
    "جرب منتدى الأسئلة مجاناً. تحدى نفسك مع مجموعات متنوعة من الأسئلة الطبية دون الحاجة للتسجيل.",
  keywords: [
    "أسئلة طبية",
    "اختبارات طبية",
    "تدريب طبي مجاني",
    "أسئلة امتحانات",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "منتدى الأسئلة - دحيحة ميديكال",
    description: "جرب منتدى الأسئلة مجاناً وتحدى نفسك مع أسئلة طبية متنوعة.",
    type: "website",
  },
};

export default function UnauthedQuestionsForumLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
