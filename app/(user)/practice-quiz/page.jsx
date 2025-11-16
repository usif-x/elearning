"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getUserCourses } from "@/services/Courses";
import {
  generatePracticeQuiz,
  getPracticeQuizResults,
} from "@/services/PracticeQuiz";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PracticeQuizPage = () => {
  const [courses, setCourses] = useState([]);
  const [practiceQuizzes, setPracticeQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [includeUnanswered, setIncludeUnanswered] = useState(true);
  const [filterCourse, setFilterCourse] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [currentPage, filterCourse]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user's enrolled courses
      const coursesData = await getUserCourses(1, 100);
      const enrolledCourses = coursesData.enrollments.map((enrollment) => ({
        id: enrollment.course_id,
        name: enrollment.course_name,
        description: enrollment.course_description,
        image: enrollment.course_image,
        progress: enrollment.progress_percentage,
      }));
      setCourses(enrolledCourses);

      // Fetch practice quiz results
      const params = {
        page: currentPage,
        size: 10,
      };
      if (filterCourse) {
        params.course_id = filterCourse;
      }
      const resultsData = await getPracticeQuizResults(params);
      setPracticeQuizzes(resultsData.results || []);
      setTotalPages(resultsData.total_pages || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedCourse) {
      toast.error("الرجاء اختيار كورس");
      return;
    }

    setGenerating(true);
    try {
      const response = await generatePracticeQuiz({
        course_id: parseInt(selectedCourse),
        question_count: questionCount,
        include_unanswered: includeUnanswered,
      });

      toast.success("تم إنشاء الاختبار التدريبي بنجاح!");
      // Redirect to the quiz attempt page using the practice_quiz_id from response
      window.location.href = `/practice-quiz/attempt/${response.practice_quiz_id}`;
    } catch (error) {
      console.error("Error generating quiz:", error);
      if (error.response?.status === 404) {
        toast.error("لا توجد أسئلة متاحة لهذا الكورس");
      } else {
        toast.error("حدث خطأ أثناء إنشاء الاختبار");
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon
              icon="solar:clipboard-list-bold-duotone"
              className="w-12 h-12 text-blue-500"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                الاختبارات التدريبية
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                تدرب على الأسئلة التي أجبت عليها بشكل خاطئ أو لم تجب عليها
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generate Quiz Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Icon
                  icon="solar:add-circle-bold"
                  className="w-6 h-6 text-blue-500"
                />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  إنشاء اختبار جديد
                </h2>
              </div>

              <div className="space-y-4">
                {/* Course Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اختر الكورس
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- اختر كورس --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عدد الأسئلة: {questionCount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Include Unanswered */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    id="includeUnanswered"
                    checked={includeUnanswered}
                    onChange={(e) => setIncludeUnanswered(e.target.checked)}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="includeUnanswered"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    تضمين الأسئلة التي لم تُجب عليها
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateQuiz}
                  disabled={!selectedCourse || generating}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Icon icon="eos-icons:loading" className="w-5 h-5" />
                      <span>جاري الإنشاء...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:play-bold" className="w-5 h-5" />
                      <span>بدء الاختبار</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:info-circle-bold"
                    className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-1">ملاحظة:</p>
                    <p>
                      سيتم إنشاء الاختبار من الأسئلة التي أجبت عليها بشكل خاطئ
                      أو لم تجب عليها في هذا الكورس.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-2">
            {/* Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  تصفية حسب الكورس:
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => {
                    setFilterCourse(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الكورسات</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Practice Quizzes List */}
            <div className="space-y-4">
              {practiceQuizzes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                  <Icon
                    icon="solar:clipboard-remove-bold-duotone"
                    className="w-24 h-24 mx-auto mb-4 text-gray-400"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    لا توجد اختبارات تدريبية
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    ابدأ بإنشاء اختبار تدريبي جديد من القائمة الجانبية
                  </p>
                </div>
              ) : (
                practiceQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            icon="solar:document-text-bold"
                            className="w-5 h-5 text-blue-500"
                          />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {quiz.title}
                          </h3>
                        </div>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Icon
                              icon="solar:question-circle-bold"
                              className="w-4 h-4"
                            />
                            <span>{quiz.total_questions} سؤال</span>
                          </div>
                          {quiz.is_completed ? (
                            <>
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="w-4 h-4"
                                />
                                <span>
                                  {quiz.correct_answers} /{" "}
                                  {quiz.total_questions} إجابة صحيحة
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Icon
                                  icon="solar:star-bold"
                                  className="w-4 h-4"
                                />
                                <span>{quiz.score}%</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Icon
                                  icon="solar:clock-circle-bold"
                                  className="w-4 h-4"
                                />
                                <span>
                                  {Math.floor(quiz.time_taken / 60)}:
                                  {(quiz.time_taken % 60)
                                    .toString()
                                    .padStart(2, "0")}
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                              غير مكتمل
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {quiz.completed_at
                            ? `تم الإكمال: ${new Date(
                                quiz.completed_at
                              ).toLocaleDateString("ar-EG")}`
                            : `تم الإنشاء: ${new Date(
                                quiz.created_at
                              ).toLocaleDateString("ar-EG")}`}
                        </div>
                      </div>
                      <Link
                        href={`/practice-quiz/result/${quiz.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Icon icon="solar:eye-bold" className="w-4 h-4" />
                        <span className="text-sm font-medium">عرض النتيجة</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
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
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon icon="solar:arrow-left-bold" className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeQuizPage;
