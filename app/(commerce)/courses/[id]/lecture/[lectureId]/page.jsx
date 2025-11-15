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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLecture.contents.map((content, index) => {
                const getContentStyle = () => {
                  switch (content.content_type) {
                    case "video":
                      return {
                        icon: "solar:play-circle-bold-duotone",
                        color: "text-sky-500",
                        bg: "from-sky-500 to-blue-600",
                        label: "فيديو",
                      };
                    case "photo":
                      return {
                        icon: "solar:gallery-bold-duotone",
                        color: "text-pink-500",
                        bg: "from-pink-500 to-rose-600",
                        label: "صورة",
                      };
                    case "file":
                      return {
                        icon: "solar:file-text-bold-duotone",
                        color: "text-blue-500",
                        bg: "from-blue-500 to-cyan-600",
                        label: "ملف",
                      };
                    case "audio":
                      return {
                        icon: "solar:music-library-bold-duotone",
                        color: "text-purple-500",
                        bg: "from-purple-500 to-violet-600",
                        label: "صوت",
                      };
                    case "quiz":
                      return {
                        icon: "solar:clipboard-list-bold-duotone",
                        color: "text-indigo-500",
                        bg: "from-indigo-500 to-purple-600",
                        label: "اختبار",
                      };
                    case "link":
                      return {
                        icon: "solar:link-bold-duotone",
                        color: "text-amber-500",
                        bg: "from-amber-500 to-orange-600",
                        label: "رابط",
                      };
                    default:
                      return {
                        icon: "solar:document-bold-duotone",
                        color: "text-gray-500",
                        bg: "from-gray-500 to-gray-600",
                        label: "محتوى",
                      };
                  }
                };

                const contentStyle = getContentStyle();

                return (
                  <Link
                    key={content.id}
                    href={`/courses/${courseId}/lecture/${lectureId}/content/${content.id}`}
                    className="group"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-full border-2 border-gray-200 dark:border-gray-700 group-hover:border-sky-500">
                      <div
                        className={`bg-gradient-to-br ${contentStyle.bg} p-6 text-white`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                            <Icon
                              icon={contentStyle.icon}
                              className="w-8 h-8"
                            />
                          </div>
                          <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            {contentStyle.label}
                          </span>
                        </div>
                        <h3
                          className="text-lg font-bold line-clamp-2"
                          dir="rtl"
                        >
                          {content.title}
                        </h3>
                      </div>

                      <div className="p-6">
                        {content.description && (
                          <p
                            className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm"
                            dir="rtl"
                          >
                            {content.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            #{content.position + 1}
                          </div>
                          {content.quiz_duration && (
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
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-sky-500 group-hover:gap-3 transition-all">
                          <span className="text-sm font-semibold">
                            عرض المحتوى
                          </span>
                          <Icon
                            icon="solar:arrow-left-bold"
                            className="w-5 h-5"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
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
