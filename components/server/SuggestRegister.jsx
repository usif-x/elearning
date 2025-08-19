"use client";

import { Icon } from "@iconify/react"; // We'll add an icon to the button
import { Lemonada } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

// Using a bolder weight for the special font can make the heading pop more.
const lemonada = Lemonada({ subsets: ["latin", "arabic"], weight: "600" });

const CTASection = () => {
  return (
    // The outer section can remain simple, providing the spacing.
    <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors smooth">
      <div className="">
        {/*
          IMPROVEMENT 1: Added `group` for hover effects and a subtle gradient background.
          This adds depth and makes the component feel more premium.
        */}
        <div
          className="group relative bg-sky-200 dark:bg-slate-800 rounded-l-2xl p-8 lg:p-12 ml-32 transition-all  shadow-xl shadow-slate-200/50 dark:shadow-black/20 smooth"
          dir="rtl"
        >
          {/* Responsive grid: stacks on mobile, two columns on desktop. */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Column 1: Text Content & Button */}
            {/* IMPROVEMENT 2: Re-ordered for better mobile flow (Image first). */}
            <div className="text-center lg:text-right flex flex-col items-center lg:items-start order-2 lg:order-1">
              <h2
                className={`text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white leading-normal smooth md:leading-snug ${lemonada.className}`}
              >
                انضم لأوائل الكيمياء
                <br />و ابدأ{" "}
                {/* IMPROVEMENT 3: Highlight the key branding word "صقرية" with a gradient. */}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500">
                  مرحلة صقرية
                </span>
                <br />
                جديدة في حياتك
              </h2>

              {/* IMPROVEMENT 4: Added a descriptive subheading for more context. */}
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto lg:mx-0">
                مع مستر خالد صقر، هتحول الكيمياء من مادة صعبة لمغامرة ممتعة تضمن
                لك أعلى الدرجات.
              </p>

              <Link
                href="/register"
                className="mt-8 flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-lg py-3 px-8 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 shadow-lg shadow-sky-500/40"
              >
                <Icon icon="solar:rocket-bold-duotone" className="w-6 h-6" />
                <span>انشئ حسابك الآن</span>
              </Link>
            </div>

            {/* Column 2: Illustration */}
            <div className="flex justify-center order-1 lg:order-2">
              {/* IMPROVEMENT 5: Added a subtle hover animation linked to the `group` class. */}
              <Image
                src="/images/cta-image.png" // Make sure this path is correct
                alt="مستر خالد صقر يدعوك للانضمام لرحلة التفوق في الكيمياء" // Improved alt text for SEO & context
                width={500}
                height={450}
                className="w-full max-w-md h-auto transition-transform transition-colors duration-500 ease-out group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
