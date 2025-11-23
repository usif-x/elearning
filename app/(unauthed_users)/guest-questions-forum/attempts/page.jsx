"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getGuestAttempts } from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const GuestAttemptsPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleSearch = async (page = 1) => {
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
      const response = await getGuestAttempts(phoneNumber, {
        page,
        size: 20,
      });

      setAttempts(response.attempts || []);
      setCurrentPage(response.page || 1);
      setTotalPages(response.total_pages || 1);
      setTotalAttempts(response.total || 0);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching guest attempts:", error);
      toast.error("حدث خطأ أثناء البحث عن المحاولات");
      setAttempts([]);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      handleSearch(page);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "غير محدد";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (attempt) => {
    if (attempt.is_completed) {
      return attempt.score >= 80
        ? "text-green-600 bg-green-100 dark:bg-green-900/30"
        : attempt.score >= 60
        ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
        : "text-red-600 bg-red-100 dark:bg-red-900/30";
    }
    return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
  };

  const getStatusText = (attempt) => {
    if (attempt.is_completed) {
      return "مكتملة";
    }
    return "غير مكتملة";
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "hard":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-6">
            <Icon
              icon="solar:document-bold-duotone"
              className="w-12 h-12 text-blue-500"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            محاولاتي السابقة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            عرض جميع محاولاتك في الاختبارات
          </p>
        </div>

        {/* Phone Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto">
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
                onClick={() => handleSearch(1)}
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
                    <span>البحث عن المحاولات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <>
            {attempts.length > 0 ? (
              <>
                {/* Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        تم العثور على {totalAttempts} محاولة
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        عرض {attempts.length} محاولة في الصفحة الحالية
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        الصفحة {currentPage} من {totalPages}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attempts List */}
                <div className="space-y-6 mb-8">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {attempt.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                attempt
                              )}`}
                            >
                              {getStatusText(attempt)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon="solar:hashtag-bold"
                                className="w-4 h-4 text-gray-400"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                المحاولة #{attempt.id}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Icon
                                icon="solar:question-circle-bold"
                                className="w-4 h-4 text-gray-400"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {attempt.total_questions} سؤال
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Icon
                                icon="solar:clock-circle-bold"
                                className="w-4 h-4 text-gray-400"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTime(attempt.time_taken)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Icon
                                icon="solar:calendar-bold"
                                className="w-4 h-4 text-gray-400"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(
                                  attempt.started_at
                                ).toLocaleDateString("ar-SA")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                attempt.difficulty
                              )}`}
                            >
                              {attempt.difficulty === "easy"
                                ? "سهل"
                                : attempt.difficulty === "medium"
                                ? "متوسط"
                                : attempt.difficulty === "hard"
                                ? "صعب"
                                : attempt.difficulty}
                            </span>

                            {attempt.topic && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30">
                                {attempt.topic}
                              </span>
                            )}
                          </div>

                          {attempt.is_completed && attempt.score !== null && (
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div
                                  className={`text-2xl font-bold ${
                                    attempt.score >= 80
                                      ? "text-green-600"
                                      : attempt.score >= 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {attempt.score}%
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  النتيجة النهائية
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {attempt.correct_answers}/
                                  {attempt.total_questions}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  إجابات صحيحة
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {attempt.is_completed ? (
                            <Link
                              href={`/guest-questions-forum/attempts/${attempt.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                            >
                              <Icon icon="solar:eye-bold" className="w-4 h-4" />
                              <span>عرض النتائج</span>
                            </Link>
                          ) : (
                            <Link
                              href={`/guest-questions-forum/${attempt.question_set_id}/attempt`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                            >
                              <Icon
                                icon="solar:play-bold"
                                className="w-4 h-4"
                              />
                              <span>متابعة الاختبار</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || searching}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon
                        icon="solar:alt-arrow-right-bold"
                        className="w-5 h-5"
                      />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={searching}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || searching}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon
                        icon="solar:alt-arrow-left-bold"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
                  <Icon
                    icon="solar:document-bold"
                    className="w-16 h-16 text-gray-400"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  لا توجد محاولات
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  لم يتم العثور على أي محاولات لهذا الرقم
                </p>
                <Link
                  href="/guest-questions-forum"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                  <span>ابدأ اختبار جديد</span>
                </Link>
              </div>
            )}
          </>
        )}

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
};

export default GuestAttemptsPage;
