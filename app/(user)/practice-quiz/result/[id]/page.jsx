"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getPracticeQuizDetailedResult } from "@/services/PracticeQuiz";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PracticeQuizResultPage = () => {
  const { id: practiceQuizId } = useParams();
  const router = useRouter();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");

  const filterTabs = [
    { id: "all", label: "جميع الأسئلة", icon: "solar:document-text-bold" },
    {
      id: "correct",
      label: "الأسئلة الصحيحة",
      icon: "solar:check-circle-bold",
    },
    { id: "wrong", label: "الأسئلة الخاطئة", icon: "solar:close-circle-bold" },
    {
      id: "unanswered",
      label: "غير المجابة",
      icon: "solar:question-circle-bold",
    },
  ];

  const filterQuestions = (questions) => {
    if (!questions) return [];
    switch (activeFilter) {
      case "correct":
        return questions.filter((q) => q.is_correct);
      case "wrong":
        return questions.filter((q) => !q.is_correct && q.user_answer !== null);
      case "unanswered":
        return questions.filter((q) => q.user_answer === null);
      default:
        return questions;
    }
  };

  // Initialize language selection - prefer Arabic if available
  useEffect(() => {
    if (quizData?.questions_with_results) {
      const initialLanguages = {};
      quizData.questions_with_results.forEach((question, index) => {
        initialLanguages[index] = question.explanation_ar ? "ar" : "en";
      });
      setSelectedLanguage(initialLanguages);
    }
  }, [quizData]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getPracticeQuizDetailedResult(practiceQuizId);

        // Check if quiz is not completed
        if (!data.is_completed) {
          toast.warning("لم يتم إكمال هذا الاختبار بعد");
          router.push("/practice-quiz");
          return;
        }

        setQuizData(data);
      } catch (error) {
        console.error("Error fetching result:", error);
        toast.error("حدث خطأ أثناء تحميل النتيجة");
        router.push("/practice-quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [practiceQuizId, router]);

  const toggleLanguage = (index, lang) => {
    setSelectedLanguage((prev) => ({
      ...prev,
      [index]: lang,
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">لم يتم العثور على النتيجة</p>
        </div>
      </div>
    );
  }

  const isPassed = quizData.score >= 50;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <div
          className="mb-4 md:mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
          dir="rtl"
        >
          <Link
            href="/practice-quiz"
            className="hover:text-sky-500 transition-colors"
          >
            الاختبارات التدريبية
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-semibold">
            نتيجة الاختبار
          </span>
        </div>

        {/* Quiz Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 md:mb-6">
          <div className="text-center mb-6 md:mb-8">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words"
              dir="rtl"
            >
              {quizData.title}
            </h1>
            {quizData.description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {quizData.description}
              </p>
            )}
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div
              className={`p-3 sm:p-4 md:p-6 rounded-xl text-center ${
                isPassed
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <Icon
                icon={
                  isPassed
                    ? "solar:verified-check-bold"
                    : "solar:close-circle-bold"
                }
                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 ${
                  isPassed ? "text-green-500" : "text-red-500"
                }`}
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                النتيجة النهائية
              </p>
              <p
                className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                  isPassed ? "text-green-600" : "text-red-600"
                }`}
              >
                {quizData.score}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                {isPassed ? "نجحت ✓" : "راسب ✗"}
              </p>
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/20 p-3 sm:p-4 md:p-6 rounded-xl text-center">
              <Icon
                icon="solar:document-text-bold"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-sky-500 mx-auto mb-2"
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي الأسئلة
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-600">
                {quizData.total_questions}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 md:p-6 rounded-xl text-center">
              <Icon
                icon="solar:check-circle-bold"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-2"
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجابات صحيحة
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                {quizData.correct_answers}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 md:p-6 rounded-xl text-center">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-amber-500 mx-auto mb-2"
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                الوقت المستغرق
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600">
                {Math.floor(quizData.time_taken / 60)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                دقيقة
              </p>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-4 md:space-y-6">
          <h2
            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
            dir="rtl"
          >
            الأسئلة والإجابات
          </h2>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                <Icon icon={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {quizData.questions_with_results &&
          quizData.questions_with_results.length > 0 ? (
            filterQuestions(quizData.questions_with_results).map(
              (question, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 md:p-6"
                >
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <span className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-bold px-3 py-1 rounded-lg">
                          سؤال {index + 1}
                        </span>
                        {question.is_correct ? (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <Icon
                              icon="solar:check-circle-bold"
                              className="w-4 h-4"
                            />
                            صحيح
                          </span>
                        ) : (
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <Icon
                              icon="solar:close-circle-bold"
                              className="w-4 h-4"
                            />
                            خطأ
                          </span>
                        )}
                      </div>
                      <p
                        className="text-base sm:text-lg text-gray-900 dark:text-white leading-relaxed break-words"
                        dir="rtl"
                      >
                        {question.question}
                      </p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {question.options.map((option, optionIndex) => {
                      const isUserAnswer = question.user_answer === optionIndex;
                      const isCorrectAnswer =
                        question.correct_answer === optionIndex;

                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                            isCorrectAnswer
                              ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                              : isUserAnswer && !question.is_correct
                              ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                              : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center ${
                                isCorrectAnswer
                                  ? "bg-green-500 border-green-500"
                                  : isUserAnswer && !question.is_correct
                                  ? "bg-red-500 border-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {isCorrectAnswer && (
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="w-5 h-5 text-white"
                                />
                              )}
                              {isUserAnswer && !question.is_correct && (
                                <Icon
                                  icon="solar:close-circle-bold"
                                  className="w-5 h-5 text-white"
                                />
                              )}
                            </div>
                            <span
                              className={`text-sm sm:text-base flex-1 break-words ${
                                isCorrectAnswer
                                  ? "text-green-900 dark:text-green-100 font-semibold"
                                  : isUserAnswer && !question.is_correct
                                  ? "text-red-900 dark:text-red-100 font-semibold"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                              dir="rtl"
                            >
                              {option}
                            </span>
                            {isUserAnswer && (
                              <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                إجابتك
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                الإجابة الصحيحة
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {(question.explanation_ar || question.explanation_en) && (
                    <div className="bg-sky-50 dark:bg-sky-900/20 border-r-4 border-sky-500 p-3 sm:p-4 rounded-lg mb-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Icon
                          icon="solar:lightbulb-bolt-bold"
                          className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 flex-shrink-0 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                            <p className="font-semibold text-sky-900 dark:text-sky-100 text-sm sm:text-base">
                              التوضيح:
                            </p>
                            {question.explanation_ar &&
                              question.explanation_en && (
                                <button
                                  onClick={() =>
                                    toggleLanguage(
                                      index,
                                      selectedLanguage[index] === "en"
                                        ? "ar"
                                        : "en"
                                    )
                                  }
                                  className="flex items-center gap-1 text-[10px] sm:text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 sm:px-3 py-1 rounded-full hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors whitespace-nowrap"
                                >
                                  <Icon
                                    icon="solar:translation-bold"
                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                  />
                                  <span>
                                    {selectedLanguage[index] === "en"
                                      ? "عربي"
                                      : "English"}
                                  </span>
                                </button>
                              )}
                          </div>
                          <p
                            className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words"
                            dir={
                              selectedLanguage[index] === "en" ? "ltr" : "rtl"
                            }
                          >
                            {selectedLanguage[index] === "en"
                              ? question.explanation_en
                              : question.explanation_ar ||
                                question.explanation_en}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Source Info */}
                  {(question.source_quiz_title ||
                    question.source_course_id) && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 flex-1 min-w-0">
                        <Icon
                          icon="solar:document-text-bold"
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <span className="truncate">
                          {question.source_quiz_title
                            ? `المصدر: ${question.source_quiz_title}`
                            : ""}
                          {question.source_course_id &&
                            ` - كورس رقم ${question.source_course_id}`}
                        </span>
                      </div>
                      {question.source_course_id &&
                        question.source_lecture_id && (
                          <Link
                            href={`/courses/${question.source_course_id}/lecture/${question.source_lecture_id}`}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                          >
                            <Icon
                              icon="solar:arrow-left-bold"
                              className="w-3 h-3"
                            />
                            <span>الانتقال للمحتوى</span>
                          </Link>
                        )}
                    </div>
                  )}
                </div>
              )
            )
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <Icon
                icon="solar:clipboard-remove-bold-duotone"
                className="w-24 h-24 mx-auto mb-6 text-gray-400"
              />
              <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                لا توجد أسئلة متاحة للمراجعة
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            href="/practice-quiz"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Icon
              icon="solar:arrow-right-linear"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span>العودة للاختبارات التدريبية</span>
          </Link>
          <Link
            href="/practice-quiz"
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Icon
              icon="solar:add-circle-bold"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span>إنشاء اختبار جديد</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PracticeQuizResultPage;
