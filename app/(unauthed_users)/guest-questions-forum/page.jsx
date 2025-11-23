"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { getPublicQuestionSets } from "../../../services/QuestionsForum";

const PublicQuestionsForumPage = () => {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestionSets, setTotalQuestionSets] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    fetchQuestionSets();
  }, [currentPage, selectedDifficulty]);

  useEffect(() => {
    // Reset to page 1 when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchQuestionSets();
    }
  }, [searchTerm]);

  const fetchQuestionSets = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        search: searchTerm || null,
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : null,
      };

      const response = await getPublicQuestionSets(params);

      setQuestionSets(response.question_sets || []);
      setTotalPages(response.total_pages || 1);
      setTotalQuestionSets(response.total || 0);
    } catch (error) {
      console.error("Error fetching public question sets:", error);
      toast.error("حدث خطأ أثناء تحميل مجموعات الأسئلة");
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-6">
            <Icon
              icon="solar:question-circle-bold-duotone"
              className="w-12 h-12 text-blue-500"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            منتدى الأسئلة العامة
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            استكشف مجموعات الأسئلة العامة المتنوعة واختبر معرفتك في مواضيع
            مختلفة
          </p>
          <div className="mt-6">
            <Link
              href="/guest-questions-forum/attempts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Icon icon="solar:chart-square-bold" className="w-5 h-5" />
              <span>عرض نتائجي</span>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Icon
                  icon="solar:magnifer-linear"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="البحث في مجموعات الأسئلة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDifficulty("all")}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  selectedDifficulty === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedDifficulty("easy")}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  selectedDifficulty === "easy"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                سهل
              </button>
              <button
                onClick={() => setSelectedDifficulty("medium")}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  selectedDifficulty === "medium"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                متوسط
              </button>
              <button
                onClick={() => setSelectedDifficulty("hard")}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  selectedDifficulty === "hard"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                صعب
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            عرض {questionSets.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{" "}
            - {Math.min(currentPage * pageSize, totalQuestionSets)} من{" "}
            {totalQuestionSets} مجموعة أسئلة
          </p>
        </div>

        {/* Question Sets Grid */}
        {questionSets.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
              <Icon
                icon="solar:question-circle-bold"
                className="w-16 h-16 text-gray-400"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {searchTerm || selectedDifficulty !== "all"
                ? "لا توجد نتائج"
                : "لا توجد مجموعات أسئلة عامة"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              {searchTerm || selectedDifficulty !== "all"
                ? "جرب تغيير معايير البحث أو المرشحات"
                : "لم يتم العثور على أي مجموعات أسئلة عامة"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {questionSets.map((questionSet) => (
              <div
                key={questionSet.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                {/* Header with Image/Icon */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                      <Icon
                        icon="solar:question-circle-bold"
                        className="w-6 h-6 text-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                          questionSet.difficulty
                        )}`}
                      >
                        {getDifficultyText(questionSet.difficulty)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {questionSet.title}
                  </h3>

                  {questionSet.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {questionSet.description}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon
                        icon="solar:question-square-bold"
                        className="w-4 h-4"
                      />
                      <span>{questionSet.total_questions} سؤال</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon icon="solar:play-circle-bold" className="w-4 h-4" />
                      <span>{questionSet.attempt_count} محاولة</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon icon="solar:user-bold" className="w-4 h-4" />
                      <span>{questionSet.creator_name || "مجهول"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon icon="solar:tag-bold" className="w-4 h-4" />
                      <span>
                        {getQuestionTypeText(questionSet.question_type)}
                      </span>
                    </div>
                  </div>

                  {/* Attempt Status for authenticated users */}
                  {questionSet.user_has_attempted && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon
                          icon="solar:check-circle-bold"
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-green-800 dark:text-green-200 font-medium">
                          تم المحاولة - أفضل نتيجة:{" "}
                          {questionSet.user_best_score}%
                        </span>
                      </div>
                    </div>
                  )}

                  {questionSet.user_has_pending_attempt && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon
                          icon="solar:clock-circle-bold"
                          className="w-4 h-4 text-yellow-600"
                        />
                        <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                          محاولة معلقة
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    href={`/guest-questions-forum/${questionSet.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-[1.02]"
                  >
                    <Icon icon="solar:play-circle-bold" className="w-5 h-5" />
                    <span>
                      {questionSet.user_has_pending_attempt
                        ? "متابعة المحاولة"
                        : questionSet.user_has_attempted
                        ? "إعادة المحاولة"
                        : "بدء المحاولة"}
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
              <span>السابق</span>
            </button>

            <div className="flex gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                      currentPage === pageNumber
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>التالي</span>
              <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicQuestionsForumPage;
