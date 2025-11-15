"use client";

import { getCourseById, getCourseLectures } from "@/services/Courses";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const LecturesPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, lecturesData] = await Promise.all([
          getCourseById(id),
          getCourseLectures(id),
        ]);
        setCourse(courseData);
        setLectures(lecturesData);
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
            جاري تحميل المحاضرات...
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
            href={`/courses/${id}`}
            className="hover:text-sky-500 transition-colors"
          >
            {course.name}
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-semibold">
            المحاضرات
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Icon
                icon="solar:notebook-bold-duotone"
                className="w-20 h-20 text-sky-500"
              />
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3"
              dir="rtl"
            >
              محاضرات الكورس
            </h1>
            <p
              className="text-lg text-gray-600 dark:text-gray-400 mb-4"
              dir="rtl"
            >
              {course.name}
            </p>
            {lectures.length > 0 && (
              <div className="mt-4 inline-flex items-center space-x-2 space-x-reverse bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-full">
                <Icon icon="mdi:folder-multiple" className="w-5 h-5" />
                <span className="font-semibold">{lectures.length} محاضرة</span>
              </div>
            )}
          </div>
        </div>

        {/* Lectures Grid */}
        {lectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lecture, index) => (
              <Link
                key={lecture.id}
                href={`/courses/${id}/lecture/${lecture.id}`}
                className="group"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-full">
                  <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                        <Icon
                          icon="solar:book-bookmark-bold-duotone"
                          className="w-8 h-8"
                        />
                      </div>
                      <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2" dir="rtl">
                      {lecture.name}
                    </h3>
                  </div>

                  <div className="p-6">
                    {lecture.description && (
                      <p
                        className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2"
                        dir="rtl"
                      >
                        {lecture.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Icon
                          icon="solar:document-text-bold-duotone"
                          className="w-5 h-5 text-sky-500"
                        />
                        <span className="text-sm font-medium">
                          {lecture.contents?.length || 0} محتوى
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sky-500 group-hover:gap-3 transition-all">
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
                </div>
              </Link>
            ))}
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
              لا توجد محاضرات متاحة لهذا الكورس حالياً
            </p>
          </div>
        )}

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

export default LecturesPage;
