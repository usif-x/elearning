"use client";

import { Almarai, Lemonada } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const lemonada = Lemonada({ subsets: ["latin", "arabic"], weight: "400" });
const almarai = Almarai({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

const Hero = () => {
  return (
    // Section container with the new blue theme and dark mode variant.
    <section
      className={`bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 dark:from-blue-900 dark:via-blue-950 dark:to-slate-900 text-white transition-colors duration-300 min-h-screen relative overflow-hidden ${almarai.className}`}
      dir="rtl"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-sky-200/5 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 xl:py-24 relative z-10">
        {/* Main grid for the two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-8rem)]">
          {/* Column 1: Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-right order-2 lg:order-1 space-y-4 sm:space-y-6">
            {/* Title with enhanced styling */}
            <div className="relative">
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-4 sm:mb-6 ${lemonada.className}`}
              >
                دحيحة ميديكال
              </h1>
              <div className="absolute -bottom-2 right-0 w-24 sm:w-32 lg:w-40 h-1 bg-white/50 rounded-full"></div>
            </div>

            {/* Description paragraphs with improved spacing */}
            <div className="space-y-3 sm:space-y-4 max-w-xl">
              <p className="text-base sm:text-lg lg:text-xl text-sky-50 dark:text-sky-100 leading-relaxed">
                دحيحة ميديكال منصة معمولة مخصوص علشان تساعد طلاب التخصصات الطبيه
                يفهموا المذاكرة من غير تعقيد.
              </p>
              <p className="text-base sm:text-lg lg:text-xl text-sky-50 dark:text-sky-100 leading-relaxed">
                من ميح لدحيح
              </p>
            </div>

            {/* CTA Button with improved responsiveness */}
            <div className="pt-4 sm:pt-6 w-full sm:w-auto">
              <Link
                href="/register"
                className={`inline-block w-full sm:w-auto bg-white hover:bg-sky-50 text-sky-600 font-bold text-base sm:text-lg lg:text-xl py-3 sm:py-4 px-8 sm:px-10 lg:px-12 rounded-xl sm:rounded-2xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl shadow-lg transform ${lemonada.className}`}
              >
                <span className="flex items-center justify-center gap-2">
                  سجل دلوقتي!
                  <span className="text-xl sm:text-2xl">🚀</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Column 2: Image with improved responsiveness */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
              {/* Decorative glow behind image */}
              <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-90"></div>
              <Image
                src="/images/hero.svg"
                alt="دحيحة ميديكال - منصة تعليمية"
                width={1000}
                height={1000}
                priority
                className="w-full h-auto relative z-10 drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
