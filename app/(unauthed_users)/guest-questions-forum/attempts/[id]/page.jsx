"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getGuestAttemptDetail } from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const GuestAttemptResultsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [searching, setSearching] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(true);

  useEffect(() => {
    if (params.id) {
      // If we have an attempt ID, try to fetch it directly
      fetchAttemptDetail();
    }
  }, [params.id]);

  const fetchAttemptDetail = async (phone = null) => {
    setLoading(true);
    try {
      const response = await getGuestAttemptDetail(
        params.id,
        phone || phoneNumber
      );
      setAttempt(response);
      setShowPhoneInput(false);
    } catch (error) {
      console.error("Error fetching attempt detail:", error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        // Need phone number to access
        setShowPhoneInput(true);
      } else {
        toast.error("حدث خطأ أثناء تحميل تفاصيل المحاولة");
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    // Egyptian phone number validation (starts with 01 and 10 digits total)
    const egyptianPhoneRegex = /^01[0-2]\d{8}$/;
    return egyptianPhoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    setPhoneNumber(value);
    setPhoneError("");
  };

  const handleSearchAttempt = async () => {
    if (!phoneNumber) {
      setPhoneError("يرجى إدخال رقم الهاتف");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("يرجى إدخال رقم هاتف مصري صحيح");
      return;
    }

    setSearching(true);
    try {
      await fetchAttemptDetail(phoneNumber);
    } catch (error) {
      setPhoneError("لم يتم العثور على محاولة بهذا الرقم");
    } finally {
      setSearching(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

  if (showPhoneInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-6">
              <Icon
                icon="solar:search-bold-duotone"
                className="w-12 h-12 text-blue-500"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              البحث عن نتائج المحاولة
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              أدخل رقم هاتفك لعرض نتائج محاولتك
            </p>
          </div>

          {/* Phone Input */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Icon
                    icon="solar:phone-bold"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="01012345678"
                    maxLength={11}
                    className={`w-full pr-10 pl-4 py-4 text-lg border rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 transition-colors ${
                      phoneError
                        ? "border-red-300 focus:ring-red-500 text-red-900 dark:text-red-100"
                        : "border-gray-200 dark:border-gray-600 focus:ring-blue-500 text-gray-900 dark:text-white"
                    }`}
                    dir="ltr"
                  />
                </div>
                {phoneError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Icon
                      icon="solar:danger-triangle-bold"
                      className="w-4 h-4"
                    />
                    {phoneError}
                  </p>
                )}
              </div>

              <button
                onClick={handleSearchAttempt}
                disabled={searching || !phoneNumber}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none text-lg"
              >
                {searching ? (
                  <>
                    <LoadingSpinner />
                    <span>جاري البحث...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="solar:search-bold" className="w-6 h-6" />
                    <span>البحث عن النتائج</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <Link
              href="/guest-questions-forum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
              <span>العودة للمنتدى</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt) {
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
              المحاولة غير موجودة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              لم يتم العثور على المحاولة المطلوبة
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

  // Check if attempt is completed
  if (!attempt.is_completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full mb-6">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-16 h-16 text-yellow-500"
              />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              المحاولة غير مكتملة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              هذه المحاولة لم يتم إنهاؤها بعد. يرجى إكمال الاختبار أولاً.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/guest-questions-forum/${attempt.question_set_id}/attempt`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Icon icon="solar:play-circle-bold" className="w-5 h-5" />
                <span>متابعة الاختبار</span>
              </Link>
              <Link
                href="/guest-questions-forum"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              >
                <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
                <span>العودة للمنتدى</span>
              </Link>
            </div>
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
            نتائج المحاولة
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl mb-6">
            <Icon
              icon="solar:chart-square-bold-duotone"
              className="w-12 h-12 text-green-500"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            نتائج المحاولة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {attempt.title}
          </p>
        </div>

        {/* Score Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(
                attempt.score || 0
              )} mb-6`}
            >
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getScoreColor(
                    attempt.score || 0
                  )}`}
                >
                  {attempt.score || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  النتيجة النهائية
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attempt.correct_answers || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  إجابات صحيحة
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(attempt.total_questions || 0) -
                    (attempt.correct_answers || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  إجابات خاطئة
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(attempt.time_taken || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  الوقت المستغرق
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attempt.completed_at
                    ? new Date(attempt.completed_at).toLocaleDateString("ar-EG")
                    : "غير محدد"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  تاريخ الانتهاء
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        {attempt.questions_with_results &&
          attempt.questions_with_results.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                مراجعة الأسئلة
              </h3>

              <div className="space-y-6">
                {attempt.questions_with_results.map((question, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border ${
                      question.is_correct === true
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                        : question.is_correct === false
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
                        : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          question.is_correct === true
                            ? "bg-green-500 text-white"
                            : question.is_correct === false
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {question.question}
                          </h4>
                          {question.is_correct !== null && (
                            <Icon
                              icon={
                                question.is_correct
                                  ? "solar:check-circle-bold"
                                  : "solar:close-circle-bold"
                              }
                              className={`w-5 h-5 ${
                                question.is_correct
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              إجابتك:
                            </span>
                            <span
                              className={`ml-2 ${
                                question.is_correct === true
                                  ? "text-green-600"
                                  : question.is_correct === false
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {question.user_answer !== null &&
                              question.options &&
                              question.options[question.user_answer]
                                ? question.options[question.user_answer]
                                : "لم يتم الإجابة"}
                            </span>
                          </div>

                          {question.is_correct === false && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                الإجابة الصحيحة:
                              </span>
                              <span className="ml-2 text-green-600">
                                {question.options &&
                                question.options[question.correct_answer]
                                  ? question.options[question.correct_answer]
                                  : "غير محدد"}
                              </span>
                            </div>
                          )}

                          {question.explanation_ar && (
                            <div className="text-sm mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                              <span className="font-medium text-blue-700 dark:text-blue-300">
                                الشرح:
                              </span>
                              <span className="ml-2 text-blue-600 dark:text-blue-400">
                                {question.explanation_ar}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/guest-questions-forum/${attempt.question_set_id}`}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
          >
            <Icon icon="solar:refresh-circle-bold" className="w-6 h-6" />
            <span>إعادة المحاولة</span>
          </Link>

          <Link
            href="/guest-questions-forum"
            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-lg text-center"
          >
            العودة للمنتدى
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestAttemptResultsPage;
