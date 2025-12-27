export const metadata = {
  title: "منتدى الأسئلة",
  description: "تحدى نفسك مع مجموعات متنوعة من الأسئلة الطبية وشارك مع زملائك.",
  keywords: [
    "أسئلة طبية",
    "منتدى أسئلة",
    "اختبارات طبية",
    "تدريب طبي",
    "أسئلة تفاعلية",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "منتدى الأسئلة - دحيحة ميديكال",
    description:
      "تحدى نفسك مع مجموعات متنوعة من الأسئلة الطبية وشارك مع زملائك.",
    type: "website",
  },
};

export default function QuestionsForumLayout({ children }) {
  return <>{children}</>;
}
