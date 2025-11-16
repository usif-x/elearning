"use client";

import { getCourseById, getCourseLectures } from "@/services/Courses";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CourseData = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, lecturesData] = await Promise.all([
          getCourseById(id),
          getCourseLectures(id),
        ]);
        setCourse(courseData);
        setLectures(lecturesData);
        if (lecturesData.length > 0) {
          setActiveLecture(lecturesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="w-12 h-12 text-sky-500 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل الكورس...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">الكورس غير موجود</p>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} دقيقة`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Course Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Course Image */}
            <div className="relative h-64 md:h-full">
              <Image
                src={
                  course.image
                    ? `${apiUrl}/storage/${course.image}`
                    : "/placeholder.jpg"
                }
                alt={course.name}
                fill
                loading="lazy"
                className="object-cover"
              />
            </div>

            {/* Course Info */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h1
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-right"
                  dir="rtl"
                >
                  {course.name}
                </h1>
                <p
                  className="text-gray-600 dark:text-gray-400 mb-6 text-right"
                  dir="rtl"
                >
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <Icon
                        icon="mdi:book-open-page-variant"
                        className="w-6 h-6 text-sky-500"
                      />
                      <span className="text-gray-900 dark:text-white font-bold">
                        {lectures.length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      محاضرة
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <Icon
                        icon="mdi:play-circle"
                        className="w-6 h-6 text-sky-500"
                      />
                      <span className="text-gray-900 dark:text-white font-bold">
                        {lectures.reduce(
                          (acc, lecture) =>
                            acc + (lecture.contents?.length || 0),
                          0
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      محتوى
                    </p>
                  </div>
                </div>
              </div>

              {/* Price and Subscribe */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-sky-500">
                      {parseFloat(course.price) === 0
                        ? "مجاني"
                        : `${course.price} جنيه`}
                    </p>
                    {course.price_before_discount &&
                      parseFloat(course.price_before_discount) > 0 && (
                        <p className="text-sm text-gray-500 line-through">
                          {course.price_before_discount} جنيه
                        </p>
                      )}
                  </div>
                </div>
                {parseFloat(course.price) === 0 ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-6 h-6 text-green-500"
                      />
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        كورس مجاني
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      يمكنك مشاهدة المحتوى مباشرة
                    </p>
                  </div>
                ) : (
                  <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse">
                    <Icon icon="mdi:cart-plus" className="w-6 h-6" />
                    <span>اشترك في الكورس</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <Icon
                icon="solar:notebook-bold-duotone"
                className="w-20 h-20 text-sky-500"
              />
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3"
              dir="rtl"
            >
              محتوى الكورس
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400" dir="rtl">
              استكشف جميع المحاضرات والدروس المتاحة في هذا الكورس
            </p>
            {lectures.length > 0 && (
              <div className="mt-4 inline-flex items-center space-x-2 space-x-reverse bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-full">
                <Icon icon="mdi:folder-multiple" className="w-5 h-5" />
                <span className="font-semibold">{lectures.length} محاضرة</span>
              </div>
            )}
          </div>

          {lectures.length > 0 ? (
            <div className="space-y-6">
              {lectures.map((lecture, lectureIndex) => (
                <div
                  key={lecture.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transform transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${
                      lectureIndex * 0.1
                    }s both`,
                  }}
                >
                  <button
                    onClick={() =>
                      setActiveLecture(
                        activeLecture === lecture.id ? null : lecture.id
                      )
                    }
                    className="w-full p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-sky-50 hover:to-transparent dark:hover:from-sky-900/20 dark:hover:to-transparent transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="bg-sky-100 dark:bg-sky-900/30 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <Icon
                          icon="solar:folder-with-files-bold-duotone"
                          className="w-8 h-8 text-sky-500"
                        />
                      </div>
                      <div className="text-right">
                        <span
                          className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white block"
                          dir="rtl"
                        >
                          {lecture.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {lecture.contents?.length || 0} عنصر
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div
                        className={`transform transition-transform duration-200 ${
                          activeLecture === lecture.id ? "rotate-180" : ""
                        }`}
                      >
                        <Icon
                          icon="solar:alt-arrow-down-bold"
                          className="w-7 h-7 text-sky-500"
                        />
                      </div>
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      activeLecture === lecture.id
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {lecture.contents && (
                      <div className="p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50">
                        {lecture.contents.map((content, contentIndex) => {
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
                              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                              style={{
                                animation: `slideInRight 0.3s ease-out ${
                                  contentIndex * 0.05
                                }s both`,
                              }}
                            >
                              {/* Content Header - Clickable */}
                              <button
                                onClick={() =>
                                  setActiveContent(isActive ? null : content.id)
                                }
                                className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                                  isActive ? "bg-sky-50 dark:bg-sky-900/20" : ""
                                }`}
                              >
                                <div className="flex items-center space-x-3 space-x-reverse flex-1">
                                  <div
                                    className={`${
                                      contentStyle.bg
                                    } p-2 rounded-lg transition-transform duration-300 ${
                                      isActive ? "scale-110" : ""
                                    }`}
                                  >
                                    <Icon
                                      icon={contentStyle.icon}
                                      className={`w-5 h-5 ${contentStyle.color}`}
                                    />
                                  </div>
                                  <div className="flex-1 text-right">
                                    <span
                                      className="text-sm md:text-base font-semibold text-gray-900 dark:text-white block"
                                      dir="rtl"
                                    >
                                      {content.title}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap justify-end">
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
                                      {content.quiz_duration && (
                                        <>
                                          <span className="text-gray-400">
                                            •
                                          </span>
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
                                      className="w-4 h-4 text-gray-400"
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
                                      {content.show_correct_answers !==
                                        null && (
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
                                        الترتيب
                                      </p>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        #{content.position + 1}
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
                                    href={`/courses/${id}/lecture/${lecture.id}/content/${content.id}`}
                                    className={`w-full ${contentStyle.bg} ${contentStyle.color} font-semibold py-2 px-4 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center justify-center gap-2`}
                                  >
                                    <Icon
                                      icon={contentStyle.icon}
                                      className="w-5 h-5"
                                    />
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <Icon
                icon="solar:file-corrupted-bold-duotone"
                className="w-24 h-24 mx-auto mb-6 text-gray-400"
              />
              <p className="text-xl font-semibold" dir="rtl">
                لا يوجد محتوى متاح لهذا الكورس حالياً
              </p>
            </div>
          )}
        </div>
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
  );
};
export default CourseData;
