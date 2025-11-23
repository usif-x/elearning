"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getPublicQuestionSetDetail } from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PublicQuestionSetDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchQuestionSetDetail();
    }
  }, [params.id]);

  const fetchQuestionSetDetail = async () => {
    setLoading(true);
    try {
      const response = await getPublicQuestionSetDetail(params.id);
      setQuestionSet(response);
    } catch (error) {
      console.error("Error fetching question set detail:", error);
      toast.error("حدث خطأ أثناء تحميل تفاصيل مجموعة الأسئلة");
      router.push("/guest-questions-forum");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "سهل";
      case "medium":
        return "متوسط";
      case "hard":
        return "صعب";
      default:
        return difficulty;
    }
  };

  const getQuestionTypeText = (questionType) => {
    switch (questionType) {
      case "multiple_choice":
        return "اختيار متعدد";
      case "true_false":
        return "صح/خطأ";
      case "mixed":
        return "مختلط";
      default:
        return questionType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
              <Icon
                icon="solar:question-circle-bold"
                className="w-16 h-16 text-gray-400"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              مجموعة الأسئلة غير موجودة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              المجموعة المطلوبة غير متوفرة أو تم حذفها
            </p>
            <Link
              href="/guest-questions-forum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
              <span>العودة للمنتدى</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link
            href="/guest-questions-forum"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            منتدى الأسئلة العامة
          </Link>
          <Icon icon="solar:alt-arrow-left-bold" className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">
            {questionSet.title}
          </span>
        </nav>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Icon
                icon="solar:question-circle-bold"
                className="w-8 h-8 text-blue-500"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {questionSet.title}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    questionSet.difficulty
                  )}`}
                >
                  {getDifficultyText(questionSet.difficulty)}
                </span>
              </div>

              {questionSet.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {questionSet.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questionSet.total_questions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    عدد الأسئلة
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questionSet.attempt_count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    عدد المحاولات
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questionSet.average_score?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    متوسط النتيجة
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getQuestionTypeText(questionSet.question_type)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    نوع الأسئلة
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 flex items-center justify-center">
                  <Icon
                    icon="solar:user-bold"
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {questionSet.creator_name || "مجهول"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    منشئ المجموعة
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 mb-8 border border-blue-200 dark:border-blue-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Icon
                icon="solar:info-circle-bold"
                className="w-6 h-6 text-blue-500"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                كيفية المشاركة
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• يمكنك المشاركة كضيف بدون تسجيل حساب</li>
                <li>• ستحتاج إلى إدخال رقم هاتفك لتسجيل محاولتك</li>
                <li>• يمكنك مراجعة نتائجك لاحقاً باستخدام رقم الهاتف</li>
                <li>
                  • كل محاولة تحتوي على {questionSet.total_questions} سؤال
                </li>
                <li>
                  • لديك {questionSet.time_limit || "غير محدود"} دقيقة لإكمال
                  المحاولة
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/guest-questions-forum/${questionSet.id}/attempt`}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
          >
            <Icon icon="solar:play-circle-bold" className="w-6 h-6" />
            <span>ابدأ المحاولة الآن</span>
          </Link>

          <Link
            href="/guest-questions-forum"
            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-lg"
          >
            العودة للمنتدى
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicQuestionSetDetailPage;
