// components/AboutSection.js

import { Icon } from "@iconify/react";
import Image from "next/image";

const AboutSection = () => {
  return (
    // Section: Dark background in dark mode
    <section className="py-16 smooth dark:bg-gray-900">
      <div className="container mx-auto px-4 smooth">
        {/* Main Card: Switches from white to a dark gray */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden smooth">
          {/* Main Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 smooth">
            {/* RIGHT SIDE - Title, Features, and Image */}
            <div className="order-1 lg:order-2">
              {/* Title and Features */}
              <div className="p-8 md:p-12">
                {/* Title: Text color changes for dark mode */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-10 text-right smooth">
                  مستقبل التعليم الإلكتروني
                </h2>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-4 text-center mb-8 smooth">
                  {/* Feature 1 */}
                  <div className="flex flex-col items-center space-y-3">
                    {/* Icon Background: Gets darker */}
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 md:p-4 rounded-xl transition-transform hover:scale-110 smooth">
                      <Icon
                        icon="ph:robot"
                        className="w-6 h-6 md:w-8 md:h-8 text-primary"
                      />
                    </div>
                    {/* Feature Text: Gets lighter */}
                    <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-300 font-medium leading-tight smooth">
                      الذكاء الاصطناعي في التعليم
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex flex-col items-center space-y-3">
                    {/* Icon Background: Gets darker */}
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 md:p-4 rounded-xl transition-transform hover:scale-110 smooth">
                      <Icon
                        icon="tabler:device-analytics"
                        className="w-6 h-6 md:w-8 md:h-8 text-primary smooth"
                      />
                    </div>
                    {/* Feature Text: Gets lighter */}
                    <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-300 font-medium leading-tight smooth">
                      تحليلات متقدمة للأداء
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex flex-col items-center space-y-3">
                    {/* Icon Background: Gets darker */}
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 md:p-4 rounded-xl transition-transform hover:scale-110 smooth">
                      <Icon
                        icon="healthicons:i-groups-perspective-crowd"
                        className="w-6 h-6 md:w-8 md:h-8 text-primary smooth"
                      />
                    </div>
                    {/* Feature Text: Gets lighter */}
                    <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-300 font-medium leading-tight smooth">
                      تعلم تفاعلي جماعي
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Container - Gradient updated for dark mode */}
              <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-800 smooth">
                <Image
                  src="/images/future-learning.png"
                  alt="مستقبل التعليم الإلكتروني - The Future of E-Learning"
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>

            {/* LEFT SIDE - Blue Promotional Text (No changes needed as it's self-contained) */}
            <div className="bg-primary text-white p-8 md:p-12 flex items-center order-2 lg:order-1">
              <div className="flex flex-col justify-center h-full">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-right leading-relaxed">
                  انضم إلى ثورة التعليم الرقمي... مع منصتنا المتطورة، ستكتشف
                  عالماً جديداً من التعلم التفاعلي الذي يجمع بين التكنولوجيا
                  الحديثة والتعليم الفعال.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
