"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getUserCourses } from "@/services/Courses";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMyCourses();
  }, [currentPage]);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const response = await getUserCourses(currentPage, 12);
      setCourses(response.enrollments || []);
      setTotalPages(response.total_pages || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error fetching my courses:", error);
      toast.error("حدث خطأ أثناء تحميل كورساتك");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon
              icon="solar:book-bookmark-bold-duotone"
              className="w-12 h-12 text-blue-500"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                كورساتي
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                جميع الكورسات المسجل بها
              </p>
            </div>
          </div>
          {!loading && courses.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full">
              <Icon icon="solar:user-check-bold" className="w-5 h-5" />
              <span className="font-semibold">{total} كورس مسجل</span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
              <Icon
                icon="solar:book-minimalistic-bold-duotone"
                className="w-24 h-24 mx-auto mb-4 text-gray-400"
              />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                لم تسجل في أي كورس بعد
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ابدأ رحلتك التعليمية بالتسجيل في أحد الكورسات المتاحة
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                <span>تصفح الكورسات</span>
              </Link>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 p-4">
              {courses.map((enrollment) => (
                <div key={enrollment.id} className="group relative h-full">
                  <div className="bg-white dark:bg-gray-800 text-sky-500 border-2 border-sky-500 transition-all duration-300 rounded-xl p-4 flex flex-col space-y-4 h-full">
                    {/* Course Image */}
                    <div className="rounded-xl relative overflow-hidden">
                      {enrollment.course_image ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${enrollment.course_image}`}
                          alt={enrollment.course_name}
                          className="w-full h-full max-h-[300px] object-cover"
                        />
                      ) : (
                        <div className="w-full h-[300px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Icon
                            icon="solar:book-bookmark-bold"
                            className="w-20 h-20 text-white/50"
                          />
                        </div>
                      )}
                      {/* Progress Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="flex items-center justify-between text-white text-sm mb-2">
                          <span className="font-medium">التقدم</span>
                          <span className="font-bold">
                            {enrollment.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-400 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${enrollment.progress_percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="flex flex-col space-y-3 leading-0 flex-1">
                      {/* Course Name - Centered */}
                      <div className="text-center">
                        <h3
                          className="text-xl font-bold text-gray-900 dark:text-white"
                          dir="rtl"
                        >
                          {enrollment.course_name}
                        </h3>
                      </div>

                      {/* Horizontal Line */}
                      <div className="h-1 m-2 w-full rounded-full bg-sky-700" />

                      {/* Course Description - Centered */}
                      <div className="text-center">
                        <p
                          className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-300"
                          dir="rtl"
                        >
                          {enrollment.course_description?.length > 80
                            ? enrollment.course_description.substring(0, 80) +
                              "..."
                            : enrollment.course_description}
                        </p>
                      </div>

                      {/* Horizontal Line */}
                      <div className="h-1 m-2 w-full rounded-full bg-sky-700" />

                      {/* Stats and Date */}
                      <div className="flex md:flex-row md:justify-between flex-col md:items-center w-full">
                        <div className="md:space-y-1 flex md:flex-col flex-row-reverse justify-between">
                          {/* Stats */}
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="solar:video-library-bold"
                                className="w-4 h-4 text-blue-500"
                              />
                              <span className="text-gray-700 dark:text-gray-300">
                                {enrollment.completed_lectures}/
                                {enrollment.total_lectures} محاضرة
                              </span>
                            </div>
                            {/* Badge */}
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-md w-fit ${
                                enrollment.course_is_free
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-500"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500"
                              }`}
                            >
                              {enrollment.course_is_free
                                ? "كورس مجاني"
                                : "مدفوع"}
                            </span>
                          </div>
                        </div>
                        {/* Date */}
                        <div className="hidden md:flex flex-col items-end space-y-1 text-gray-500 dark:text-gray-400 text-xs">
                          <div className="flex items-center gap-1">
                            <span>{formatDate(enrollment.enrolled_at)}</span>
                            <Icon
                              icon="solar:calendar-bold"
                              className="w-4 h-4"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center w-full !mt-auto pt-4">
                      {/* Mobile Date */}
                      <div className="flex md:hidden flex-col space-y-1 text-gray-500 dark:text-gray-400 text-xs w-1/2">
                        <div className="flex items-center gap-1">
                          <Icon
                            icon="solar:calendar-bold"
                            className="w-4 h-4"
                          />
                          <span>{formatDate(enrollment.enrolled_at)}</span>
                        </div>
                      </div>
                      {/* Button */}
                      <div className="md:w-full w-1/2">
                        <Link
                          href={`/courses/${enrollment.course_id}`}
                          className="w-full block"
                        >
                          <button className="border-2 transition-all duration-300 w-full rounded-xl px-4 py-2 bg-sky-500 border-sky-500 dark:bg-sky-500 dark:border-sky-500 text-white hover:bg-sky-600">
                            متابعة التعلم
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon
                    icon="solar:arrow-right-bold"
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon
                    icon="solar:arrow-left-bold"
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
