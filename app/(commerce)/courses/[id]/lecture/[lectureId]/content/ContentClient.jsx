"use client";

import { getCourseById, getCourseLectures } from "@/services/Courses";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const LectureContentPage = ({
  initialCourse,
  initialLectures,
  initialCurrentLecture,
}) => {
  const { id: courseId, lectureId } = useParams();
  const [course, setCourse] = useState(initialCourse || null);
  const [lectures, setLectures] = useState(initialLectures || []);
  const [currentLecture, setCurrentLecture] = useState(
    initialCurrentLecture || null
  );
  const [loading, setLoading] = useState(!initialCourse);
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeContent, setActiveContent] = useState(null);

  useEffect(() => {
    if (initialCourse) return;

    const fetchData = async () => {
      try {
        const [courseData, lecturesData] = await Promise.all([
          getCourseById(courseId),
          getCourseLectures(courseId),
        ]);
        setCourse(courseData);
        setLectures(lecturesData);

        // Find current lecture
        const lecture = lecturesData.find((l) => l.id === parseInt(lectureId));
        setCurrentLecture(lecture);
        setActiveLecture(parseInt(lectureId));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lectureId) {
      fetchData();
    }
  }, [courseId, lectureId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="w-12 h-12 text-sky-500 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل المحتوى...
          </p>
        </div>
      </div>
    );
  }

  if (!course || !currentLecture) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">المحتوى غير موجود</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          dir="rtl"
        >
          <Link
            href="/courses"
            className="hover:text-sky-500 transition-colors"
          >
            الكورسات
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <Link
            href={`/courses/${courseId}`}
            className="hover:text-sky-500 transition-colors"
          >
            {course.name}
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <Link
            href={`/courses/${courseId}/lecture`}
            className="hover:text-sky-500 transition-colors"
          >
            المحاضرات
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-semibold">
            {currentLecture.name}
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Icon
                icon="solar:folder-with-files-bold-duotone"
                className="w-20 h-20 text-sky-500"
              />
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3"
              dir="rtl"
            >
              {currentLecture.name}
            </h1>
            {currentLecture.description && (
              <p
                className="text-lg text-gray-600 dark:text-gray-400 mb-4"
                dir="rtl"
              >
                {currentLecture.description}
              </p>
            )}
            {currentLecture.contents && currentLecture.contents.length > 0 && (
              <div className="mt-4 inline-flex items-center space-x-2 space-x-reverse bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-full">
                <Icon icon="mdi:play-circle-multiple" className="w-5 h-5" />
                <span className="font-semibold">
                  {currentLecture.contents.length} محتوى
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lecture Contents Dropdown */}
        {currentLecture.contents && currentLecture.contents.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="space-y-4">
              {currentLecture.contents.map((content, contentIndex) => {
                const getContentIcon = () => {
                  switch (content.content_type) {
                    case "video":
                      return {
                        icon: "solar:play-circle-bold-duotone",
                        color: "text-sky-500",
                        bg: "bg-sky-100 dark:bg-sky-900/30",
                        label: "فيديو",
                      };
                    case "photo":
                      return {
                        icon: "solar:gallery-bold-duotone",
                        color: "text-pink-500",
                        bg: "bg-pink-100 dark:bg-pink-900/30",
                        label: "صورة",
                      };
                    case "file":
                      return {
                        icon: "solar:file-text-bold-duotone",
                        color: "text-blue-500",
                        bg: "bg-blue-100 dark:bg-blue-900/30",
                        label: "ملف",
                      };
                    case "audio":
                      return {
                        icon: "solar:music-library-bold-duotone",
                        color: "text-purple-500",
                        bg: "bg-purple-100 dark:bg-purple-900/30",
                        label: "صوت",
                      };
                    case "quiz":
                      return {
                        icon: "solar:clipboard-list-bold-duotone",
                        color: "text-indigo-500",
                        bg: "bg-indigo-100 dark:bg-indigo-900/30",
                        label: "اختبار",
                      };
                    case "link":
                      return {
                        icon: "solar:link-bold-duotone",
                        color: "text-amber-500",
                        bg: "bg-amber-100 dark:bg-amber-900/30",
                        label: "رابط",
                      };
                    default:
                      return {
                        icon: "solar:document-bold-duotone",
                        color: "text-gray-500",
                        bg: "bg-gray-100 dark:bg-gray-900/30",
                      };
                  }
                };

                const contentStyle = getContentIcon();
                const isActive = activeContent === content.id;

                return (
                  <div
                    key={content.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
                    style={{
                      animation: `slideInRight 0.3s ease-out ${
                        contentIndex * 0.05
                      }s both`,
                    }}
                  >
                    {/* Content Header - Clickable for expand/collapse */}
                    <button
                      onClick={() =>
                        setActiveContent(isActive ? null : content.id)
                      }
                      className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                        isActive ? "bg-sky-50 dark:bg-sky-900/20" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse flex-1">
                        <div
                          className={`${
                            contentStyle.bg
                          } p-3 rounded-lg transition-transform duration-300 ${
                            isActive ? "scale-110" : ""
                          }`}
                        >
                          <Icon
                            icon={contentStyle.icon}
                            className={`w-6 h-6 ${contentStyle.color}`}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <span
                            className="text-base md:text-lg font-semibold text-gray-900 dark:text-white block"
                            dir="rtl"
                          >
                            {content.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1 flex-wrap justify-end">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {content.content_type === "video"
                                ? "فيديو"
                                : content.content_type === "pdf"
                                ? "ملف PDF"
                                : content.content_type === "book"
                                ? "كتاب"
                                : content.content_type === "quiz"
                                ? "اختبار"
                                : content.content_type === "exam"
                                ? "امتحان"
                                : content.content_type === "link"
                                ? "رابط"
                                : content.content_type}
                            </span>
                            {content.content_type === "quiz" &&
                              content.quiz_duration && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Icon
                                      icon="solar:clock-circle-bold"
                                      className="w-3 h-3"
                                    />
                                    {content.quiz_duration} دقيقة
                                  </span>
                                </>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse mr-2">
                        <div
                          className={`transform transition-transform duration-300 ${
                            isActive ? "rotate-180" : ""
                          }`}
                        >
                          <Icon
                            icon="solar:alt-arrow-down-bold"
                            className="w-5 h-5 text-gray-400"
                          />
                        </div>
                      </div>
                    </button>

                    {/* Content Details - Expandable */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isActive
                          ? "max-h-[600px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-600 space-y-3">
                        {/* Description if available */}
                        {content.description && (
                          <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              الوصف:
                            </p>
                            <p
                              className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                              dir="rtl"
                            >
                              {content.description}
                            </p>
                          </div>
                        )}

                        {/* Quiz-specific Information */}
                        {content.content_type === "quiz" && (
                          <div className="grid grid-cols-2 gap-3">
                            {content.max_attempts && (
                              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  عدد المحاولات
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {content.max_attempts}
                                </p>
                              </div>
                            )}
                            {content.passing_score !== null && (
                              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  درجة النجاح
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {content.passing_score}%
                                </p>
                              </div>
                            )}
                            {content.show_correct_answers !== null && (
                              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  إظهار الإجابات
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {content.show_correct_answers
                                    ? "نعم ✓"
                                    : "لا ✗"}
                                </p>
                              </div>
                            )}
                            {content.randomize_questions !== null && (
                              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  ترتيب عشوائي للأسئلة
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {content.randomize_questions
                                    ? "نعم ✓"
                                    : "لا ✗"}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* General Content Information */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              الوصف
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {content.description
                                ? content.description.length > 80
                                  ? `${content.description.slice(0, 80)}...`
                                  : content.description
                                : "-"}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              النوع
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {content.content_type}
                            </p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link
                          href={`/courses/${courseId}/lecture/${lectureId}/content/${content.id}`}
                          className={`w-full ${contentStyle.bg} ${contentStyle.color} font-semibold py-3 px-4 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center justify-center gap-2`}
                        >
                          <Icon icon={contentStyle.icon} className="w-5 h-5" />
                          <span>
                            {content.content_type === "video"
                              ? "مشاهدة الفيديو"
                              : content.content_type === "file"
                              ? "فتح الملف"
                              : content.content_type === "photo"
                              ? "عرض الصورة"
                              : content.content_type === "audio"
                              ? "تشغيل الصوت"
                              : content.content_type === "quiz"
                              ? "بدء الاختبار"
                              : content.content_type === "link"
                              ? "فتح الرابط"
                              : "عرض المحتوى"}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Icon
              icon="solar:file-corrupted-bold-duotone"
              className="w-24 h-24 mx-auto mb-6 text-gray-400"
            />
            <p
              className="text-xl font-semibold text-gray-500 dark:text-gray-400"
              dir="rtl"
            >
              لا يوجد محتوى متاح لهذه المحاضرة حالياً
            </p>
          </div>
        )}

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LectureContentPage;
