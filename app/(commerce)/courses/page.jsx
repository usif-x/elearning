"use client";

import CourseCard from "@/components/ui/CourseCard";
import { getFeaturedCourses } from "@/services/Courses";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const total = courses?.length || 0;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const featuredCourses = await getFeaturedCourses();
        const formattedCourses = featuredCourses.map((course) => ({
          id: course.id,
          name: course.name,
          description: course.description,
          image: course.image,
          price: course.price,
          price_before_discount: course.price_before_discount || 0,
          is_free: course.is_free,
          is_subscribed: course.is_subscribed,
          created_at: course.created_at,
        }));
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("حدث خطأ أثناء تحميل الكورسات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleRetry = () => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const featuredCourses = await getFeaturedCourses();
        const formattedCourses = featuredCourses.map((course) => ({
          id: course.id,
          name: course.name,
          description: course.description,
          image: course.image,
          price: course.price,
          price_before_discount: course.price_before_discount || 0,
          is_free: course.is_free,
          is_subscribed: course.is_subscribed,
          created_at: course.created_at,
        }));
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("حدث خطأ أثناء تحميل الكورسات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon
              icon="solar:book-bookmark-bold-duotone"
              className="w-12 h-12 text-blue-500"
            />

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                الكورسات المتاحة
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mt-1">
                الكورسات المتاحه حاليا علي المنصة.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full">
            <Icon icon="solar:user-check-bold" className="w-5 h-5" />
            <span className="font-semibold">
              {loading ? "..." : `${total} كورس متاح`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Icon
                icon="eos-icons:loading"
                className="w-20 h-20 text-sky-500 animate-spin"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 text-lg font-medium">
              جاري تحميل الكورسات...
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">
              يرجى الانتظار قليلاً
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-center mb-4">
                <Icon
                  icon="mdi:alert-circle"
                  className="w-16 h-16 text-red-500"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                عذراً، حدث خطأ
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse"
              >
                <Icon icon="mdi:refresh" className="w-5 h-5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-center mb-4">
                <Icon
                  icon="mdi:book-alert"
                  className="w-16 h-16 text-gray-400"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                لا توجد كورسات متاحة
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                لا توجد كورسات متاحة في الوقت الحالي. يرجى العودة لاحقاً.
              </p>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && courses.length > 0 && (
          <CourseCard courses={courses} />
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
