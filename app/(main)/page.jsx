import Hero from "@/components/server/Hero";
import OurFeatures from "@/components/server/OurFuture";
import CTASection from "@/components/server/SuggestRegister";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "الصفحة الرئيسية",
  description:
    "منصة دحيحة ميديكال - أفضل منصة تعليمية في مجال الطب والعلوم الصحية. تعلم من أفضل الأطباء والمتخصصين واحصل على شهادات معتمدة.",
  keywords: [
    "دحيحة ميديكال",
    "منصة تعليمية",
    "دورات طبية",
    "تعليم طبي",
    "كورسات طب",
    "تدريب طبي",
    "شهادات طبية",
  ],
  openGraph: {
    title: "دحيحة ميديكال - منصة التعلم الإلكتروني للطب والعلوم الصحية",
    description:
      "منصة تعليمية شاملة تقدم دورات تدريبية متنوعة في مجال الطب والعلوم الصحية من أفضل الأطباء والمتخصصين.",
    type: "website",
  },
};

export default function Home() {
  return (
    <HomeClient>
      <Hero />
      <OurFeatures />
      <CTASection />
    </HomeClient>
  );
}
