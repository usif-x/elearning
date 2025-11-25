"use client";

import { getCourseById, getCourseLectures } from "@/services/Courses";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const LectureDetailPage = () => {
  const { id: courseId, lectureId } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeContent, setActiveContent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, lecturesData] = await Promise.all([
          getCourseById(courseId),
          getCourseLectures(courseId),
        ]);

        setCourse(courseData);
        setLectures(lecturesData);

        const lecture = lecturesData.find((l) => l.id === parseInt(lectureId));
        setCurrentLecture(lecture);
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
            جاري تحميل المحاضرة...
          </p>
        </div>
      </div>
    );
  }

  if (!currentLecture) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">المحاضرة غير موجودة</p>
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
            {course?.name}
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

        {/* Lecture Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Icon
                icon="solar:book-bookmark-bold-duotone"
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
                className="text-lg text-gray-600 dark:text-gray-400 mb-4 max-w-3xl mx-auto"
                dir="rtl"
              >
                {currentLecture.description}
              </p>
            )}
            {currentLecture.contents && (
              <div className="mt-4 inline-flex items-center space-x-2 space-x-reverse bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-full">
                <Icon icon="mdi:folder-open" className="w-5 h-5" />
                <span className="font-semibold">
                  {currentLecture.contents.length} محتوى
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contents List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2
            className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center"
            dir="rtl"
          >
            محتويات المحاضرة
          </h2>

          {currentLecture.contents && currentLecture.contents.length > 0 ? (
            <div className="space-y-4">
              {currentLecture.contents.map((content, index) => {
                const getContentStyle = () => {
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
                    case "pdf":
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
                    case "exam":
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
                    case "book":
                      return {
                        icon: "solar:book-bold-duotone",
                        color: "text-green-500",
                        bg: "bg-green-100 dark:bg-green-900/30",
                        label: "كتاب",
                      };
                    default:
                      return {
                        icon: "solar:document-bold-duotone",
                        color: "text-gray-500",
                        bg: "bg-gray-100 dark:bg-gray-900/30",
                        label:
                          content.content_type === "pdf"
                            ? "ملف PDF"
                            : content.content_type === "book"
                            ? "كتاب"
                            : content.content_type === "exam"
                            ? "امتحان"
                            : "محتوى",
                      };
                  }
                };

                const contentStyle = getContentStyle();
                const isActive = activeContent === content.id;

                return (
                  <div
                    key={content.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transform transition-all duration-200 hover:shadow-xl"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <button
                      onClick={() =>
                        setActiveContent(isActive ? null : content.id)
                      }
                      className="w-full p-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-sky-50 hover:to-transparent dark:hover:from-sky-900/20 dark:hover:to-transparent transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div
                          className={`${contentStyle.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon
                            icon={contentStyle.icon}
                            className={`w-6 h-6 ${contentStyle.color}`}
                          />
                        </div>
                        <div className="text-right">
                          <span
                            className="text-lg font-bold text-gray-900 dark:text-white block"
                            dir="rtl"
                          >
                            {content.title}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {contentStyle.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        {content.content_type === "quiz" &&
                          content.quiz_duration && (
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Icon
                                icon="solar:clock-circle-bold"
                                className="w-4 h-4"
                              />
                              <span className="text-xs">
                                {content.quiz_duration} دقيقة
                              </span>
                            </div>
                          )}
                        <div
                          className={`transform transition-transform duration-200 ${
                            isActive ? "rotate-180" : ""
                          }`}
                        >
                          <Icon
                            icon="solar:alt-arrow-down-bold"
                            className="w-6 h-6 text-sky-500"
                          />
                        </div>
                      </div>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isActive
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        {content.description && (
                          <p
                            className="text-gray-600 dark:text-gray-400 mb-4"
                            dir="rtl"
                          >
                            {content.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            الترتيب: #{content.position + 1}
                          </div>
                        </div>

                        <Link
                          href={`/courses/${courseId}/lecture/${lectureId}/content/${content.id}`}
                          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse"
                        >
                          <span>عرض المحتوى</span>
                          <Icon
                            icon="solar:arrow-left-bold"
                            className="w-5 h-5"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
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
        </div>

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LectureDetailPage;
