"use client";

import { Lemonada } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const lemonada = Lemonada({ subsets: ["latin", "arabic"], weight: "400" });

const Hero = () => {
  return (
    // Section container with the new blue theme and dark mode variant.
    <section
      className="bg-sky-500 dark:bg-blue-950 text-white transition-colors duration-300 min-h-screen"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Main grid for the two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Column 1: Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-right order-2 lg:order-1">
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight lg:leading-snug mb-6 ${lemonada.className}`}
            >
              منصتك الأولى لتعلم وفهم الكيمياء بأسلوب بسيط وممتع
            </h1>
            {/* The paragraph text color is a very light blue in light mode and a slightly brighter one in dark mode */}
            <p className="max-w-lg text-lg text-sky-100 dark:text-sky-200 mb-8">
              أهلاً بيك في بيتك التاني! سواء كنت في أولى، تانية، أو تالتة ثانوي،
              هنا هتلاقي كل اللي تحتاجه علشان تتفوق في الكيمياء، وتفهمها صح،
              وتطبقها بسهولة.
            </p>
            <Link
              href="/register"
              // The button text is now a shade of blue to match the new theme
              className={`bg-white/95 hover:bg-white text-sky-600 font-bold text-lg py-4 px-10 rounded-xl transition-transform transition-colors duration-200 ease-in-out hover:scale-105 shadow-lg ${lemonada.className}`}
            >
              اشترك دلوقتي!
            </Link>

            {/* Social Proof Section */}
            <div className="grid grid-cols-2 gap-8 mt-16 w-full max-w-md">
              <div className="text-center">
                <p className="text-5xl lg:text-6xl font-bold">1.0M+</p>
                {/* Adjusted subtitle color for the new blue theme */}
                <p className="text-sky-200 dark:text-sky-300 mt-2">
                  متابعين على الفيسبوك
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl lg:text-6xl font-bold">2.0M+</p>
                {/* Adjusted subtitle color for the new blue theme */}
                <p className="text-sky-200 dark:text-sky-300 mt-2">
                  متابعين على اليوتيوب
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Image */}
          {/* The image still has its red background, which creates a very bold, high-contrast 'pop' against the new blue background. This can be a very effective design choice. */}
          <div className="order-1 lg:order-2">
            <Image
              src="/images/hero-image.webp"
              alt="مدرس كيمياء يشرح المنهج بأسلوب بسيط"
              width={1000}
              height={1000}
              priority
              className="w-full h-auto max-w-md mx-auto lg:max-w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
