import { Icon } from "@iconify/react";
import Link from "next/link";

const QuizBreadcrumb = ({
  courseId,
  lectureId,
  contentId,
  courseName,
  quizTitle,
}) => {
  return (
    <div
      className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
      dir="rtl"
    >
      <Link href="/courses" className="hover:text-sky-500 transition-colors">
        الكورسات
      </Link>
      <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
      <Link
        href={`/courses/${courseId}`}
        className="hover:text-sky-500 transition-colors"
      >
        {courseName}
      </Link>
      <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
      <Link
        href={`/courses/${courseId}/lecture/${lectureId}/content/${contentId}`}
        className="hover:text-sky-500 transition-colors"
      >
        {quizTitle}
      </Link>
      <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
      <span className="text-gray-900 dark:text-white font-semibold">
        محاولة الاختبار
      </span>
    </div>
  );
};

export default QuizBreadcrumb;
