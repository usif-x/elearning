"use client";

import { getCourseById } from "@/services/Courses";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CourseData = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(id);
        setCourse(data);
        if (data.sections && data.sections.length > 0) {
          setActiveSection(data.sections[0].id);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
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
                src={`${process.env.NEXT_PUBLIC_API_URL}${course.picture}`}
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
                        {course.sections?.length || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      قسم
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <Icon
                        icon="mdi:play-circle"
                        className="w-6 h-6 text-sky-500"
                      />
                      <span className="text-gray-900 dark:text-white font-bold">
                        {course.sections?.reduce(
                          (acc, section) =>
                            acc + (section.sectionables?.length || 0),
                          0
                        ) || 0}
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
                <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse">
                  <Icon icon="mdi:cart-plus" className="w-6 h-6" />
                  <span>اشترك في الكورس</span>
                </button>
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
              استكشف جميع الأقسام والدروس المتاحة في هذا الكورس
            </p>
            {course.sections && course.sections.length > 0 && (
              <div className="mt-4 inline-flex items-center space-x-2 space-x-reverse bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-full">
                <Icon icon="mdi:folder-multiple" className="w-5 h-5" />
                <span className="font-semibold">
                  {course.sections.length} قسم
                </span>
              </div>
            )}
          </div>

          {course.sections && course.sections.length > 0 ? (
            <div className="space-y-6">
              {course.sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transform transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${
                      sectionIndex * 0.1
                    }s both`,
                  }}
                >
                  <button
                    onClick={() =>
                      setActiveSection(
                        activeSection === section.id ? null : section.id
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
                          {section.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {section.sectionables?.length || 0} عنصر
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div
                        className={`transform transition-transform duration-200 ${
                          activeSection === section.id ? "rotate-180" : ""
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
                      activeSection === section.id
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {section.sectionables && (
                      <div className="p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50">
                        {section.sectionables.map((item, itemIndex) => {
                          const getItemIcon = () => {
                            switch (item.sectionable_type) {
                              case "video":
                                return {
                                  icon: "solar:play-circle-bold-duotone",
                                  color: "text-sky-500",
                                  bg: "bg-sky-100 dark:bg-sky-900/30",
                                };
                              case "pdf":
                                return {
                                  icon: "solar:file-text-bold-duotone",
                                  color: "text-blue-500",
                                  bg: "bg-blue-100 dark:bg-blue-900/30",
                                };
                              case "book":
                                return {
                                  icon: "solar:book-2-bold-duotone",
                                  color: "text-amber-500",
                                  bg: "bg-amber-100 dark:bg-amber-900/30",
                                };
                              case "quiz":
                              case "exam":
                                return {
                                  icon: "solar:clipboard-list-bold-duotone",
                                  color: "text-indigo-500",
                                  bg: "bg-indigo-100 dark:bg-indigo-900/30",
                                };
                              case "link":
                                return {
                                  icon: "solar:link-bold-duotone",
                                  color: "text-purple-500",
                                  bg: "bg-purple-100 dark:bg-purple-900/30",
                                };
                              default:
                                return {
                                  icon: "solar:document-bold-duotone",
                                  color: "text-gray-500",
                                  bg: "bg-gray-100 dark:bg-gray-900/30",
                                };
                            }
                          };

                          const itemStyle = getItemIcon();
                          const isActive = activeLecture === item.id;

                          return (
                            <div
                              key={item.id}
                              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                              style={{
                                animation: `slideInRight 0.3s ease-out ${
                                  itemIndex * 0.05
                                }s both`,
                              }}
                            >
                              {/* Lecture Header - Clickable */}
                              <button
                                onClick={() =>
                                  setActiveLecture(isActive ? null : item.id)
                                }
                                className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                                  isActive ? "bg-sky-50 dark:bg-sky-900/20" : ""
                                }`}
                              >
                                <div className="flex items-center space-x-3 space-x-reverse flex-1">
                                  <div
                                    className={`${
                                      itemStyle.bg
                                    } p-2 rounded-lg transition-transform duration-300 ${
                                      isActive ? "scale-110" : ""
                                    }`}
                                  >
                                    <Icon
                                      icon={itemStyle.icon}
                                      className={`w-5 h-5 ${itemStyle.color}`}
                                    />
                                  </div>
                                  <div className="flex-1 text-right">
                                    <span
                                      className="text-sm md:text-base font-semibold text-gray-900 dark:text-white block"
                                      dir="rtl"
                                    >
                                      {item.sectionable?.name}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap justify-end">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.sectionable_type === "video"
                                          ? "فيديو"
                                          : item.sectionable_type === "pdf"
                                          ? "ملف PDF"
                                          : item.sectionable_type === "book"
                                          ? "كتاب"
                                          : item.sectionable_type === "quiz"
                                          ? "اختبار"
                                          : item.sectionable_type === "exam"
                                          ? "امتحان"
                                          : item.sectionable_type === "link"
                                          ? "رابط"
                                          : item.sectionable_type}
                                      </span>
                                      {item.sectionable?.duration && (
                                        <>
                                          <span className="text-gray-400">
                                            •
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Icon
                                              icon="solar:clock-circle-bold"
                                              className="w-3 h-3"
                                            />
                                            {formatDuration(
                                              item.sectionable.duration
                                            )}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 space-x-reverse mr-2">
                                  {item.sectionable?.is_free === 0 ? (
                                    <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-md">
                                      <Icon
                                        icon="solar:lock-password-bold"
                                        className="w-4 h-4 text-gray-400"
                                      />
                                    </div>
                                  ) : (
                                    <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-md">
                                      <Icon
                                        icon="solar:lock-unlocked-bold"
                                        className="w-4 h-4 text-green-500"
                                      />
                                    </div>
                                  )}
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

                              {/* Lecture Details - Expandable */}
                              <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                  isActive
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-600 space-y-3">
                                  {/* Description if available */}
                                  {item.sectionable?.description && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        الوصف:
                                      </p>
                                      <p
                                        className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                                        dir="rtl"
                                      >
                                        {item.sectionable.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* Pivot Information */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        الترتيب
                                      </p>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        #{item.pivot?.order || itemIndex + 1}
                                      </p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        الحالة
                                      </p>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {item.sectionable?.is_free === 0
                                          ? "مقفل 🔒"
                                          : "مفتوح 🔓"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Additional Info */}
                                  {item.sectionable?.duration && (
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        المدة الزمنية
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <Icon
                                          icon="solar:clock-circle-bold"
                                          className={`w-4 h-4 ${itemStyle.color}`}
                                        />
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                          {formatDuration(
                                            item.sectionable.duration
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Action Button */}
                                  <button
                                    className={`w-full ${itemStyle.bg} ${itemStyle.color} font-semibold py-2 px-4 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center justify-center gap-2`}
                                  >
                                    <Icon
                                      icon={itemStyle.icon}
                                      className="w-5 h-5"
                                    />
                                    <span>
                                      {item.sectionable_type === "video"
                                        ? "مشاهدة الفيديو"
                                        : item.sectionable_type === "pdf"
                                        ? "فتح الملف"
                                        : item.sectionable_type === "book"
                                        ? "قراءة الكتاب"
                                        : item.sectionable_type === "quiz"
                                        ? "بدء الاختبار"
                                        : item.sectionable_type === "exam"
                                        ? "دخول الامتحان"
                                        : item.sectionable_type === "link"
                                        ? "فتح الرابط"
                                        : "عرض المحتوى"}
                                    </span>
                                  </button>
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
    </div>
  );
};

export default CourseData;
