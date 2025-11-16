"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

const QuestionsForumBreadcrumb = ({ questionSetId, questionSetTitle }) => {
  return (
    <div
      className="mb-4 md:mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
      dir="rtl"
    >
      <Link
        href="/questions-forum"
        className="hover:text-sky-500 transition-colors"
      >
        منتدى الأسئلة
      </Link>
      <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
      <Link
        href={`/questions-forum/${questionSetId}`}
        className="hover:text-sky-500 transition-colors"
      >
        {questionSetTitle}
      </Link>
      <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
      <span className="text-gray-900 dark:text-white font-semibold">
        محاولة الاختبار
      </span>
    </div>
  );
};

export default QuestionsForumBreadcrumb;
