"use client";

import { Lemonada } from "next/font/google";
import Image from "next/image";
const lemonada = Lemonada({ subsets: ["latin", "arabic"], weight: "400" });

// Data-Driven Approach: Manage all features in one place for easy updates.
const features = [
  {
    icon: "/icons/icon-exam.png", // Replace with your actual icon path
    title: "نماذج امتحانات",
    description: "امتحانات تفاعلية تقدر تعملها بنفسك او تحلها من زمايلك",
  },
  {
    icon: "/icons/icon-hat.png", // Replace with your actual icon path
    title: "شرح للمحاضرات",
    description:
      "هتلاقي شرح لمعظم المحاضرات بواسطة زمايلك تساعدك عشان تفهم الماده اسهل",
  },
  {
    icon: "/icons/icon-video.png", // Replace with your actual icon path
    title: "منتدي للطلاب و للأسئلة",
    description:
      "منتدي ليك و لزمايلك تسألو فيه عن أي حاجة تخص المذاكرة أو المنهج، وتساعدوا بعض في الفهم و كمان منتدي اسئله تشاركوها مع بعض.",
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
