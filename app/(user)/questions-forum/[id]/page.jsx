"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getPublicQuestionSetDetail,
  startPublicQuestionAttempt,
} from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PublicQuestionSetPage = () => {
  const params = useParams();
  const router = useRouter();
  const questionSetId = params.id;

  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingAttempt, setStartingAttempt] = useState(false);
  const [resumingAttempt, setResumingAttempt] = useState(false);

  useEffect(() => {
    fetchQuestionSet();
  }, [questionSetId]);

  const fetchQuestionSet = async () => {
    setLoading(true);
    try {
      const data = await getPublicQuestionSetDetail(questionSetId);
      setQuestionSet(data);
    } catch (error) {
      console.error("Error fetching question set:", error);
      toast.error("حدث خطأ أثناء تحميل مجموعة الأسئلة");
      router.push("/questions-forum");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttempt = async () => {
    setStartingAttempt(true);
    try {
      const attempt = await startPublicQuestionAttempt(questionSetId);
      toast.success("تم بدء المحاولة بنجاح!");
      router.push(`/questions-forum/${attempt.id}/attempt`);
    } catch (error) {
      console.error("Error starting attempt:", error);
      toast.error("حدث خطأ أثناء بدء المحاولة");
    } finally {
      setStartingAttempt(false);
    }
  };

  const handleResumeAttempt = async () => {
    setResumingAttempt(true);
    try {
      // Navigate directly to the pending attempt
      router.push(`/questions-forum/${questionSet.pending_attempt_id}/attempt`);
    } catch (error) {
      console.error("Error resuming attempt:", error);
      toast.error("حدث خطأ أثناء استئناف المحاولة");
    } finally {
      setResumingAttempt(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return {
          bg: "from-green-50 to-green-100",
          border: "border-green-200",
          text: "text-green-600",
          dark: {
            bg: "from-green-900/30 to-green-800/30",
            border: "border-green-700",
            text: "text-green-400",
          },
        };
      case "medium":
        return {
          bg: "from-yellow-50 to-yellow-100",
          border: "border-yellow-200",
          text: "text-yellow-600",
          dark: {
            bg: "from-yellow-900/30 to-yellow-800/30",
            border: "border-yellow-700",
            text: "text-yellow-400",
          },
        };
      case "hard":
        return {
          bg: "from-red-50 to-red-100",
          border: "border-red-200",
          text: "text-red-600",
          dark: {
            bg: "from-red-900/30 to-red-800/30",
            border: "border-red-700",
            text: "text-red-400",
          },
        };
      default:
        return {
          bg: "from-gray-50 to-gray-100",
          border: "border-gray-200",
          text: "text-gray-600",
          dark: {
            bg: "from-gray-900/30 to-gray-800/30",
            border: "border-gray-700",
            text: "text-gray-400",
          },
        };
    }
  };

  const getQuestionTypeText = (type) => {
    switch (type) {
      case "multiple_choice":
        return "اختيار متعدد";
      case "true_false":
        return "صح أم خطأ";
      case "short_answer":
        return "إجابة قصيرة";
      case "mixed":
        return "مختلط";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
              <Icon
                icon="solar:document-bold"
                className="w-16 h-16 text-gray-400"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              لم يتم العثور على مجموعة الأسئلة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              قد تكون مجموعة الأسئلة غير موجودة أو غير متاحة للعامة
            </p>
            <Link
              href="/questions-forum"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
            >
              <Icon icon="solar:arrow-right-bold" className="w-6 h-6" />
              <span>العودة إلى منتدى الأسئلة</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const difficultyColors = getDifficultyColor(questionSet.difficulty);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <Link
            href="/questions-forum"
            className="inline-flex items-center gap-3 px-4 py-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all duration-200 border border-blue-100 dark:border-gray-700 mb-6"
          >
            <Icon icon="solar:alt-arrow-right-bold" className="text-lg" />
            <span className="font-medium">العودة للمنتدى</span>
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <Icon
                icon="solar:document-text-bold"
                className="text-3xl text-white"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {questionSet.title}
            </h1>
            {questionSet.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {questionSet.description}
              </p>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {questionSet.title}
                </h2>
                {questionSet.topic && (
                  <p className="text-purple-200 text-lg">
                    الموضوع: {questionSet.topic}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {questionSet.user_has_pending_attempt ? (
                  <button
                    onClick={handleResumeAttempt}
                    disabled={resumingAttempt}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-lg min-w-[200px]"
                  >
                    {resumingAttempt ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Icon
                          icon="solar:play-circle-bold"
                          className="w-6 h-6"
                        />
                        <span>استئناف المحاولة</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleStartAttempt}
                    disabled={startingAttempt}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-lg min-w-[200px]"
                  >
                    {startingAttempt ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Icon
                          icon="solar:play-circle-bold"
                          className="w-6 h-6"
                        />
                        <span>بدء المحاولة</span>
                      </>
                    )}
                  </button>
                )}

                <Link
                  href={`/questions-forum/${questionSetId}/participants`}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg min-w-[200px]"
                >
                  <Icon icon="solar:cup-bold" className="w-6 h-6" />
                  <span>تصنيف المشاركين</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Questions */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6 text-center border border-blue-200 dark:border-blue-700">
                <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800/50 dark:to-blue-700/50 rounded-xl mb-4">
                  <Icon
                    icon="solar:question-circle-bold"
                    className="w-8 h-8 text-blue-600"
                  />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {questionSet.total_questions}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                  عدد الأسئلة
                </div>
              </div>

              {/* Attempt Count */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-6 text-center border border-green-200 dark:border-green-700">
                <div className="inline-flex p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800/50 dark:to-green-700/50 rounded-xl mb-4">
                  <Icon
                    icon="solar:users-group-two-rounded-bold"
                    className="w-8 h-8 text-green-600"
                  />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {questionSet.attempt_count}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 font-semibold">
                  عدد المحاولات
                </div>
              </div>

              {/* Difficulty */}
              <div
                className={`bg-gradient-to-br ${difficultyColors.bg} dark:${difficultyColors.dark.bg} rounded-2xl p-6 text-center border ${difficultyColors.border} dark:${difficultyColors.dark.border}`}
              >
                <div
                  className={`inline-flex p-3 bg-gradient-to-br ${difficultyColors.bg
                    .replace("50", "100")
                    .replace("100", "200")} dark:${difficultyColors.dark.bg
                    .replace("900/30", "800/50")
                    .replace("800/30", "700/50")} rounded-xl mb-4`}
                >
                  <Icon
                    icon="solar:chart-square-bold"
                    className={`w-8 h-8 ${difficultyColors.text}`}
                  />
                </div>
                <div
                  className={`text-3xl font-bold ${difficultyColors.text} dark:${difficultyColors.dark.text} mb-1`}
                >
                  {questionSet.difficulty === "easy"
                    ? "سهل"
                    : questionSet.difficulty === "medium"
                    ? "متوسط"
                    : "صعب"}
                </div>
                <div
                  className={`text-sm font-semibold ${difficultyColors.text.replace(
                    "600",
                    "700"
                  )} dark:${difficultyColors.dark.text.replace("400", "300")}`}
                >
                  مستوى الصعوبة
                </div>
              </div>

              {/* Question Type */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-6 text-center border border-purple-200 dark:border-purple-700">
                <div className="inline-flex p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800/50 dark:to-purple-700/50 rounded-xl mb-4">
                  <Icon
                    icon="solar:document-text-bold"
                    className="w-8 h-8 text-purple-600"
                  />
                </div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {getQuestionTypeText(questionSet.question_type)}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                  نوع الأسئلة
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Creator Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Icon
                    icon="solar:user-circle-bold"
                    className="text-blue-500"
                  />
                  معلومات المنشئ
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">
                      المنشئ:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {questionSet.creator_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">
                      تاريخ الإنشاء:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(questionSet.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      المصدر:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {questionSet.source_type === "pdf" ? "ملف PDF" : "نص"}
                      </span>
                      {questionSet.source_type === "pdf" && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/storage/user_questions/${questionSet.source_file_name}`}
                          type="_blank"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                        >
                          <Icon
                            icon="solar:download-bold"
                            className="w-4 h-4"
                          />
                          تحميل
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Progress */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Icon
                    icon="solar:graph-up-bold"
                    className="text-indigo-500"
                  />
                  تقدمك
                </h3>
                <div className="space-y-3">
                  {questionSet.user_has_attempted ? (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-indigo-200 dark:border-indigo-600">
                        <span className="text-gray-600 dark:text-gray-400">
                          أفضل نتيجة:
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {questionSet.user_best_score}%
                        </span>
                      </div>
                      {questionSet.user_has_pending_attempt && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            محاولة قيد التقدم:
                          </span>
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                            منذ{" "}
                            {formatDate(questionSet.pending_attempt_started_at)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Icon
                        icon="solar:file-text-bold"
                        className="w-12 h-12 text-indigo-400 mx-auto mb-3"
                      />
                      <p className="text-gray-600 dark:text-gray-400">
                        لم تقم بمحاولة هذه المجموعة بعد
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Attempt Notice */}
            {questionSet.user_has_pending_attempt && (
              <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <Icon
                    icon="solar:clock-circle-bold"
                    className="text-yellow-600 dark:text-yellow-400 text-2xl mt-1 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-lg mb-2">
                      لديك محاولة قيد التقدم
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      يمكنك استئناف محاولتك السابقة التي بدأت في{" "}
                      {formatDate(questionSet.pending_attempt_started_at)}. سيتم
                      استئناف المحاولة من حيث توقفت.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Icon
                  icon="solar:info-circle-bold"
                  className="text-blue-600 dark:text-blue-400 text-2xl mt-1 flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-blue-800 dark:text-blue-200 text-lg mb-3">
                    تعليمات المحاولة
                  </h4>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="text-green-500"
                      />
                      يمكنك حفظ المحاولة والعودة إليها لاحقاً
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="text-green-500"
                      />
                      سيتم حساب النتيجة النهائية بعد إنهاء المحاولة
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="text-green-500"
                      />
                      يمكنك محاولة هذه المجموعة عدة مرات لتحسين نتيجتك
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            إحصائيات المجموعة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-700">
              <Icon
                icon="solar:users-group-rounded-bold"
                className="w-12 h-12 text-blue-600 mx-auto mb-3"
              />
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {questionSet.attempt_count}
              </div>
              <div className="text-blue-700 dark:text-blue-300 font-semibold">
                إجمالي المحاولات
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-700">
              <Icon
                icon="solar:question-circle-bold"
                className="w-12 h-12 text-green-600 mx-auto mb-3"
              />
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {questionSet.total_questions}
              </div>
              <div className="text-green-700 dark:text-green-300 font-semibold">
                عدد الأسئلة
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200 dark:border-purple-700">
              <Icon
                icon="solar:medal-ribbons-star-bold"
                className="w-12 h-12 text-purple-600 mx-auto mb-3"
              />
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {questionSet.is_public ? "عامة" : "خاصة"}
              </div>
              <div className="text-purple-700 dark:text-purple-300 font-semibold">
                نوع المجموعة
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicQuestionSetPage;
