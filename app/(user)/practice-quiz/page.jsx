"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getCourseLectures, getUserCourses } from "@/services/Courses";
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
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [includeUnanswered, setIncludeUnanswered] = useState(true);
  const [filterCourse, setFilterCourse] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lecturesDropdownOpen, setLecturesDropdownOpen] = useState(false);
  const [quizzesDropdownOpen, setQuizzesDropdownOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, filterCourse]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".lectures-dropdown") &&
        !event.target.closest(".quizzes-dropdown")
      ) {
        setLecturesDropdownOpen(false);
        setQuizzesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    // Validate that if lectures are selected, course must be selected
    if (selectedLectures.length > 0 && !selectedCourse) {
      toast.error("يجب اختيار كورس عند اختيار محاضرات");
      return;
    }

    // Validate that if quizzes are selected, lectures must be selected
    if (selectedQuizzes.length > 0 && selectedLectures.length === 0) {
      toast.error("يجب اختيار محاضرات عند اختيار اختبارات");
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        question_count: questionCount,
        include_unanswered: includeUnanswered,
      };

      // Add course_id if selected
      if (selectedCourse) {
        payload.course_id = parseInt(selectedCourse);
      }

      // Add lecture_ids if selected
      if (selectedLectures.length > 0) {
        payload.lecture_ids = selectedLectures.map((id) => parseInt(id));
      }

      // Add quiz_ids if selected
      if (selectedQuizzes.length > 0) {
        payload.quiz_ids = selectedQuizzes.map((id) => parseInt(id));
      }

      const response = await generatePracticeQuiz(payload);

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

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedLectures([]);
    setSelectedQuizzes([]);
    setLectures([]);
    setQuizzes([]);
    setLecturesDropdownOpen(false);
    setQuizzesDropdownOpen(false);

    if (courseId) {
      try {
        const lecturesData = await getCourseLectures(courseId);
        setLectures(lecturesData);
      } catch (error) {
        console.error("Error fetching lectures:", error);
        toast.error("حدث خطأ أثناء تحميل المحاضرات");
      }
    }
  };

  const handleLectureChange = (lectureIds) => {
    setSelectedLectures(lectureIds);
    setSelectedQuizzes([]);
    setQuizzesDropdownOpen(false);

    // Filter quizzes from selected lectures
    const selectedLecturesData = lectures.filter((lecture) =>
      lectureIds.includes(lecture.id.toString())
    );
    const allQuizzes = selectedLecturesData.flatMap((lecture) =>
      lecture.contents.filter((content) => content.content_type === "quiz")
    );
    setQuizzes(allQuizzes);
  };

  const resetSelections = () => {
    setSelectedCourse("");
    setSelectedLectures([]);
    setSelectedQuizzes([]);
    setLectures([]);
    setQuizzes([]);
    setLecturesDropdownOpen(false);
    setQuizzesDropdownOpen(false);
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
                    اختر الكورس (اختياري)
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">جميع الكورسات (عشوائي)</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    إذا لم تختر كورس، سيتم إنشاء الاختبار من جميع الكورسات
                    عشوائياً
                  </p>
                </div>

                {/* Lecture Selection */}
                {selectedCourse && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اختر المحاضرات (اختياري)
                    </label>

                    {/* Custom Multi-Select for Lectures */}
                    <div className="relative lectures-dropdown">
                      <div
                        onClick={() =>
                          setLecturesDropdownOpen(!lecturesDropdownOpen)
                        }
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-h-[48px] flex items-center flex-wrap gap-2"
                      >
                        {selectedLectures.length === 0 ? (
                          <span className="text-gray-500 dark:text-gray-400">
                            اختر المحاضرات...
                          </span>
                        ) : (
                          selectedLectures.map((lectureId) => {
                            const lecture = lectures.find(
                              (l) => l.id.toString() === lectureId
                            );
                            return (
                              <span
                                key={lectureId}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                              >
                                {lecture?.name}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newSelected = selectedLectures.filter(
                                      (id) => id !== lectureId
                                    );
                                    handleLectureChange(newSelected);
                                  }}
                                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                                >
                                  <Icon
                                    icon="solar:close-bold"
                                    className="w-3 h-3"
                                  />
                                </button>
                              </span>
                            );
                          })
                        )}
                        <div className="ml-auto">
                          <Icon
                            icon={
                              lecturesDropdownOpen
                                ? "solar:alt-arrow-up-bold"
                                : "solar:alt-arrow-down-bold"
                            }
                            className="w-5 h-5 text-gray-400"
                          />
                        </div>
                      </div>

                      {lecturesDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {lectures.map((lecture) => {
                            const isSelected = selectedLectures.includes(
                              lecture.id.toString()
                            );
                            return (
                              <div
                                key={lecture.id}
                                onClick={() => {
                                  const newSelected = isSelected
                                    ? selectedLectures.filter(
                                        (id) => id !== lecture.id.toString()
                                      )
                                    : [
                                        ...selectedLectures,
                                        lecture.id.toString(),
                                      ];
                                  handleLectureChange(newSelected);
                                }}
                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {lecture.name}
                                  </div>
                                  {lecture.description && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {lecture.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    {lecture.contents?.length || 0} عنصر
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      يمكنك اختيار أكثر من محاضرة واحدة
                    </p>
                  </div>
                )}

                {/* Quiz Selection */}
                {selectedLectures.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اختر الاختبارات (اختياري)
                    </label>

                    {/* Custom Multi-Select for Quizzes */}
                    <div className="relative quizzes-dropdown">
                      <div
                        onClick={() =>
                          setQuizzesDropdownOpen(!quizzesDropdownOpen)
                        }
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-h-[48px] flex items-center flex-wrap gap-2"
                      >
                        {selectedQuizzes.length === 0 ? (
                          <span className="text-gray-500 dark:text-gray-400">
                            اختر الاختبارات...
                          </span>
                        ) : (
                          selectedQuizzes.map((quizId) => {
                            const quiz = quizzes.find(
                              (q) => q.id.toString() === quizId
                            );
                            return (
                              <span
                                key={quizId}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm"
                              >
                                {quiz?.title}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedQuizzes((prev) =>
                                      prev.filter((id) => id !== quizId)
                                    );
                                  }}
                                  className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                                >
                                  <Icon
                                    icon="solar:close-bold"
                                    className="w-3 h-3"
                                  />
                                </button>
                              </span>
                            );
                          })
                        )}
                        <div className="ml-auto">
                          <Icon
                            icon={
                              quizzesDropdownOpen
                                ? "solar:alt-arrow-up-bold"
                                : "solar:alt-arrow-down-bold"
                            }
                            className="w-5 h-5 text-gray-400"
                          />
                        </div>
                      </div>

                      {quizzesDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {quizzes.map((quiz) => {
                            const isSelected = selectedQuizzes.includes(
                              quiz.id.toString()
                            );
                            const lecture = lectures.find(
                              (l) => l.id === quiz.lecture_id
                            );
                            return (
                              <div
                                key={quiz.id}
                                onClick={() => {
                                  const newSelected = isSelected
                                    ? selectedQuizzes.filter(
                                        (id) => id !== quiz.id.toString()
                                      )
                                    : [...selectedQuizzes, quiz.id.toString()];
                                  setSelectedQuizzes(newSelected);
                                }}
                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {quiz.title}
                                  </div>
                                  {quiz.description && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {quiz.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    المحاضرة: {lecture?.name}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      يمكنك اختيار أكثر من اختبار واحد
                    </p>
                  </div>
                )}

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

                {/* Clear Selections Button */}
                {(selectedCourse ||
                  selectedLectures.length > 0 ||
                  selectedQuizzes.length > 0) && (
                  <button
                    onClick={resetSelections}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                    <span>مسح جميع الاختيارات</span>
                  </button>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerateQuiz}
                  disabled={generating}
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
                    <p className="font-semibold mb-1">كيفية إنشاء الاختبار:</p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • <strong>بدون اختيار كورس:</strong> سيتم إنشاء الاختبار
                        من جميع الكورسات عشوائياً
                      </li>
                      <li>
                        • <strong>اختيار كورس فقط:</strong> سيتم إنشاء الاختبار
                        من الأسئلة الخاطئة/غير المجابة في هذا الكورس
                      </li>
                      <li>
                        • <strong>اختيار محاضرات:</strong> سيتم إنشاء الاختبار
                        من المحاضرات المحددة فقط
                      </li>
                      <li>
                        • <strong>اختيار اختبارات محددة:</strong> سيتم إنشاء
                        الاختبار من الأسئلة في الاختبارات المحددة
                      </li>
                    </ul>
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
