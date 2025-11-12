"use client";

import { Lemonada } from "next/font/google";
import Image from "next/image";
const lemonada = Lemonada({ subsets: ["latin", "arabic"], weight: "400" });

// Data-Driven Approach: Manage all features in one place for easy updates.
const features = [
  {
    icon: "/icons/icon-chat.png", // Replace with your actual icon path
    title: "شرح مبسط ومركز",
    description:
      "شرح النظريات والمفاهيم زي ما بتفهمها في حياتك اليومية، بعيد عن التعقيد الأكاديمي.",
  },
  {
    icon: "/icons/icon-exam.png", // Replace with your actual icon path
    title: "نماذج امتحانات بنفس النظام",
    description:
      "امتحانات تفاعلية بنفس شكل امتحانات الثانوية العامة، عشان تعيش جو الامتحان على المنصة.",
  },
  {
    icon: "/icons/icon-certificate.png", // Replace with your actual icon path
    title: "متابعة دورية وتقييم مستمر",
    description:
      "تقدمك بيتراجع أسبوعياً، وبنقدملك توصيات حسب احتياجك، ومتابعة أول بأول.",
  },
  {
    icon: "/icons/icon-hat.png", // Replace with your actual icon path
    title: "خطة مذاكرة منظمة",
    description:
      "المنصة بتديك جدول مذاكرة جاهز حسب وقتك ومستواك، عشان تذاكر بتركيز وراحة.",
  },
  {
    icon: "/icons/icon-video.png", // Replace with your actual icon path
    title: "تفاعل مباشر",
    description:
      "أي استفسار، أو نقطة مش واضحة تسأل عنها وإحنا هنرد عليها بشكل فوري، وكده مش هتحس إنك لوحدك.",
  },
  {
    icon: "/icons/icon-calendar.png", // Replace with your actual icon path
    title: "فيديوهات مراجعة مركزة ليالي الامتحان",
    description:
      "فيديوهات مراجعة قصيرة مركزة على أهم النقاط اللي محتاج تذاكرها قبل ما تدخل قاعة الامتحان.",
  },
];

const PlatformFeatures = () => {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 lg:py-28 transition-colors  smooth">
      <div className="max-w-7xl mx-auto px-6" dir="rtl">
        {/* Section Title */}
        <div className="text-center">
          <h2
            className={`text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white ${lemonada.className} smooth`}
          >
            إيه اللي هتلاقيه على المنصة؟
          </h2>
        </div>

        {/* Responsive Grid for Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 smooth">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 transition-transform transition-colors hover:-translate-y-2 smooth duration-300"
            >
              {/* Positioned Icon */}
              <div className="absolute top-6 left-6">
                <Image
                  src={feature.icon}
                  alt={`${feature.title} icon`}
                  width={64}
                  height={64}
                  className="w-14 h-14"
                />
              </div>

              {/* Text Content */}
              <div className="mt-16 text-right smooth">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white smooth">
                  {feature.title}
                </h3>
                <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed smooth">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
