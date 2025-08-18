import Button from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 smooth">
      <div className="text-center p-8 max-w-md mx-auto">
        {/* أيقونة كبيرة ترحيبية */}
        <Icon
          icon="solar:planet-3-bold-duotone"
          className="mx-auto h-24 w-24 text-blue-500 mb-6"
        />

        {/* العنوان الرئيسي */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          ٤٠٤ - الصفحة غير موجودة
        </h1>

        {/* النص التوضيحي */}
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          عفوًا! يبدو أنك وصلت إلى مكان غير موجود. الصفحة التي تبحث عنها غير
          متوفرة أو قد تم نقلها.
        </p>

        {/* زر العودة */}
        <div className="mt-8">
          <Link href="/">
            <Button text={"العودة للرئيسية"} color="blue" />
          </Link>
        </div>
      </div>
    </div>
  );
}
