import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export default function CourseSearchPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
          dir="rtl"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
          </div>
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
