"use client";

import { getQuizAttemptDetails } from "@/services/QuizAnalytics";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const QuizResultPage = () => {
  const { id: attemptId } = useParams();
  const router = useRouter();
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [explanationLang, setExplanationLang] = useState({});

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        const data = await getQuizAttemptDetails(attemptId);
        setQuizResult(data);
      } catch (error) {
        console.error("Error fetching quiz result:", error);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchQuizResult();
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="w-12 h-12 text-sky-500 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل النتائج...
          </p>
        </div>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">لم يتم العثور على نتائج الاختبار</p>
          <Link
            href="/profile"
            className="mt-4 inline-block text-sky-500 hover:text-sky-600"
          >
            العودة للملف الشخصي
          </Link>
        </div>
      </div>
    );
  }

  const isPassed = quizResult.score >= 50; // Assuming 50% is passing score

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <div
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          dir="rtl"
        >
          <Link
            href="/profile"
            className="hover:text-sky-500 transition-colors"
          >
            الملف الشخصي
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-semibold">
            نتيجة الاختبار
          </span>
        </div>

        {/* Quiz Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
              dir="rtl"
            >
              {quizResult.quiz_title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              تاريخ الإكمال:{" "}
              {new Date(quizResult.completed_at).toLocaleString("ar-EG")}
            </p>
          </div>

          {/* Score Summary */}
          <div className="grid md:grid-cols-4 gap-4">
            <div
              className={`p-6 rounded-xl text-center ${
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
                className={`w-12 h-12 mx-auto mb-2 ${
                  isPassed ? "text-green-500" : "text-red-500"
                }`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                النتيجة النهائية
              </p>
              <p
                className={`text-3xl font-bold ${
                  isPassed ? "text-green-600" : "text-red-600"
                }`}
              >
                {quizResult.score}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {isPassed ? "نجحت ✓" : "راسب ✗"}
              </p>
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/20 p-6 rounded-xl text-center">
              <Icon
                icon="solar:document-text-bold"
                className="w-12 h-12 text-sky-500 mx-auto mb-2"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي الأسئلة
              </p>
              <p className="text-3xl font-bold text-sky-600">
                {quizResult.total_questions}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center">
              <Icon
                icon="solar:check-circle-bold"
                className="w-12 h-12 text-green-500 mx-auto mb-2"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجابات صحيحة
              </p>
              <p className="text-3xl font-bold text-green-600">
                {quizResult.correct_answers}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl text-center">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-12 h-12 text-amber-500 mx-auto mb-2"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                الوقت المستغرق
              </p>
              <p className="text-3xl font-bold text-amber-600">
                {quizResult.time_taken}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                دقيقة
              </p>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="space-y-6">
          <h2
            className="text-2xl font-bold text-gray-900 dark:text-white"
            dir="rtl"
          >
            الأسئلة والإجابات
          </h2>

          {quizResult.questions_with_results &&
            quizResult.questions_with_results.map((question, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
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
                      className="text-lg text-gray-900 dark:text-white leading-relaxed"
                      dir="rtl"
                    >
                      {question.question}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {question.options.map((option, optionIndex) => {
                    const isUserAnswer = question.user_answer === optionIndex;
                    const isCorrectAnswer =
                      question.correct_answer === optionIndex;

                    return (
                      <div
                        key={optionIndex}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isCorrectAnswer
                            ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                            : isUserAnswer && !question.is_correct
                            ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                            : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
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
                            className={`text-base flex-1 ${
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
                            <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              إجابتك
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
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
                  <div className="bg-sky-50 dark:bg-sky-900/20 border-r-4 border-sky-500 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon
                        icon="solar:lightbulb-bolt-bold"
                        className="w-6 h-6 text-sky-500 flex-shrink-0 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sky-900 dark:text-sky-100">
                            التوضيح:
                          </p>
                          {question.explanation_ar &&
                            question.explanation_en && (
                              <button
                                onClick={() =>
                                  setExplanationLang((prev) => ({
                                    ...prev,
                                    [index]: prev[index] === "en" ? "ar" : "en",
                                  }))
                                }
                                className="flex items-center gap-1 text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors"
                              >
                                <Icon
                                  icon="solar:translation-bold"
                                  className="w-4 h-4"
                                />
                                <span>
                                  {explanationLang[index] === "en"
                                    ? "عربي"
                                    : "English"}
                                </span>
                              </button>
                            )}
                        </div>
                        <p
                          className="text-gray-700 dark:text-gray-300 leading-relaxed"
                          dir={explanationLang[index] === "en" ? "ltr" : "rtl"}
                        >
                          {explanationLang[index] === "en"
                            ? question.explanation_en
                            : question.explanation_ar ||
                              question.explanation_en}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/profile"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Icon icon="solar:arrow-right-linear" className="w-5 h-5" />
            <span>العودة للملف الشخصي</span>
          </Link>
          <Link
            href={`/courses/${quizResult.course_id}/lecture/${quizResult.lecture_id}/content/${quizResult.content_id}`}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Icon icon="solar:book-bookmark-bold" className="w-5 h-5" />
            <span>العودة للاختبار</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
