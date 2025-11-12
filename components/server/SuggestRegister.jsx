"use client";

import { Icon } from "@iconify/react";
import { Lemonada } from "next/font/google";
import Link from "next/link";

// Using a bold weight for the main heading for impact
const lemonada = Lemonada({ subsets: ["latin", "arabic"], weight: "700" });

const SimpleCTASection = () => {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* 
          The main card. A simple, clean container with a subtle background color
          that changes perfectly for dark mode.
        */}
        <div
          className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 md:p-12 lg:p-16"
          dir="rtl"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <h2
              className={`text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white ${lemonada.className}`}
            >
              انضميت لينا ولا لسه؟!
            </h2>

            <p className="max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-300">
              اعمل حسابك دلوقتي !!!
            </p>

            <Link
              href="/register"
              className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-base py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-sky-500/30"
            >
              <Icon icon="solar:rocket-bold-duotone" className="w-6 h-6" />
              <span>أنشئ حسابك الآن</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleCTASection;
