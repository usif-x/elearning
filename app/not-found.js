import Button from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-white dark:bg-zinc-950 smooth">
      {/* Background Decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] dark:opacity-[0.05]">
        <h1 className="text-[20rem] font-black text-gray-900 dark:text-white">
          404
        </h1>
      </div>

      <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
        {/* Icon */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
          <Icon
            icon="solar:planet-3-bold-duotone"
            className="relative z-10 h-32 w-32 text-blue-600 dark:text-blue-500 mx-auto animate-float"
          />
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          عفوًا! الصفحة غير موجودة
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
          يبدو أنك قد ضللت الطريق في الفضاء الرقمي. الصفحة التي تبحث عنها قد تكون
          نُقلت أو لم تعد متوفرة.
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <Link href="/">
            <Button
              text="العودة للرئيسية"
              color="blue"
              icon="solar:home-2-bold-duotone"
              className="!px-8 !py-3 !text-lg shadow-lg shadow-blue-500/20"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
