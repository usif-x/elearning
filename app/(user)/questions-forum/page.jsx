"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getMyAttempts,
  getMyQuestionSets,
  getPendingAttempts,
  getPublicQuestionSets,
} from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const QuestionsForumPage = () => {
  const [activeTab, setActiveTab] = useState("public");
  const [publicSets, setPublicSets] = useState([]);
  const [mySets, setMySets] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [pendingAttempts, setPendingAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, searchTerm, difficultyFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 12,
      };

      if (searchTerm) params.search = searchTerm;
      if (difficultyFilter) params.difficulty = difficultyFilter;

      switch (activeTab) {
        case "public":
          const publicData = await getPublicQuestionSets(params);
          setPublicSets(publicData.question_sets || []);
          setTotalPages(publicData.total_pages || 1);
          break;
        case "my-sets":
          const mySetsData = await getMyQuestionSets(params);
          setMySets(mySetsData.question_sets || []);
          setTotalPages(mySetsData.total_pages || 1);
          break;
        case "my-attempts":
          const attemptsData = await getMyAttempts(params);
          setMyAttempts(attemptsData.attempts || []);
          setTotalPages(attemptsData.total_pages || 1);
          break;
        case "pending":
          const pendingData = await getPendingAttempts();
          setPendingAttempts(pendingData.pending_attempts || []);
          break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "public", label: "الأسئلة العامة", icon: "solar:eye-bold" },
    { id: "my-sets", label: "أسئلتي", icon: "solar:document-bold" },
    { id: "my-attempts", label: "محاولاتي", icon: "solar:clipboard-list-bold" },
    { id: "pending", label: "محاولات معلقة", icon: "solar:clock-circle-bold" },
  ];

  const renderPublicSets = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {publicSets.map((set) => (
        <div
          key={set.id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {set.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {set.description}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
                set.difficulty === "easy"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : set.difficulty === "medium"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {set.difficulty === "easy"
                ? "سهل"
                : set.difficulty === "medium"
                ? "متوسط"
                : "صعب"}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Icon icon="solar:user-bold" className="w-4 h-4 text-blue-500" />
              <span>{set.creator_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Icon
                icon="solar:question-circle-bold"
                className="w-4 h-4 text-purple-500"
              />
              <span>{set.total_questions} سؤال</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Icon
                icon="solar:play-circle-bold"
                className="w-4 h-4 text-green-500"
              />
              <span>{set.attempt_count} محاولة</span>
            </div>
          </div>

          {set.user_has_attempted && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:medal-star-bold"
                  className="w-5 h-5 text-blue-500"
                />
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  أفضل نتيجة: {set.user_best_score}%
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Link
                href={`/questions-forum/${set.id}/attempt`}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl text-center text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Icon icon="solar:play-circle-bold" className="w-4 h-4" />
                <span>
                  {set.user_has_pending_attempt ? "استكمال" : "بدء المحاولة"}
                </span>
              </Link>

              {/* زر Show بالعربي وبنفس عرض Start */}
              <Link
                href={`/questions-forum/${set.id}`}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:eye" className="w-4 h-4" />
                <span>عرض</span>
              </Link>
            </div>

            {/* زر Participants تحت الزرين */}
            <div className="flex gap-3">
              <Link
                href={`/questions-forum/${set.id}/participants`}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Icon icon="solar:cup-bold" className="w-5 h-5" />
                المشاركين
              </Link>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/questions-forum/${set.id}`;
                  navigator.clipboard.writeText(url).then(() => {
                    toast.success("تم نسخ الرابط!");
                  });
                }}
                className="flex-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-700 dark:text-green-300 p-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Icon icon="solar:share-bold" className="w-5 h-5" />
                مشاركة
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMySets = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mySets.map((set) => (
        <div
          key={set.id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {set.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {set.description}
              </p>
            </div>
            <div className="flex flex-col gap-2 ml-2">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                  set.is_public
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {set.is_public ? "عام" : "خاص"}
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                  set.difficulty === "easy"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : set.difficulty === "medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {set.difficulty === "easy"
                  ? "سهل"
                  : set.difficulty === "medium"
                  ? "متوسط"
                  : "صعب"}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Icon
                icon="solar:question-circle-bold"
                className="w-4 h-4 text-purple-500"
              />
              <span>{set.total_questions} سؤال</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Icon
                icon="solar:play-circle-bold"
                className="w-4 h-4 text-green-500"
              />
              <span>{set.attempt_count} محاولة</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/questions-forum/my/${set.id}`}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl text-center text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Icon icon="solar:eye-bold" className="w-4 h-4" />
              <span>عرض التفاصيل</span>
            </Link>
            <Link
              href={`/questions-forum/${set.id}/attempt`}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Icon icon="solar:play-circle-bold" className="w-5 h-5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMyAttempts = () => (
    <div className="space-y-6">
      {myAttempts.map((attempt) => (
        <div
          key={attempt.id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {attempt.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                الموضوع: {attempt.topic}
              </p>
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {attempt.score}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {attempt.correct_answers}/{attempt.total_questions}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-4 h-4 text-gray-400"
              />
              <span>
                {new Date(attempt.completed_at).toLocaleDateString("ar-EG")}
              </span>
            </div>
            <Link
              href={`/questions-forum/attempts/${attempt.id}`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Icon icon="solar:eye-bold" className="w-4 h-4" />
              <span>عرض التفاصيل</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPendingAttempts = () => (
    <div className="space-y-6">
      {pendingAttempts.map((attempt) => (
        <div
          key={attempt.attempt_id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {attempt.question_set_title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                الموضوع: {attempt.question_set_topic}
              </p>
            </div>
            <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold rounded-full shadow-md">
              معلق
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-4 h-4 text-gray-400"
              />
              <span>
                بدأ في{" "}
                {new Date(attempt.started_at).toLocaleDateString("ar-EG")}
              </span>
            </div>
            <Link
              href={`/questions-forum/${attempt.question_set_id}/attempt`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Icon icon="solar:play-circle-bold" className="w-4 h-4" />
              <span>استكمال المحاولة</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      );
    }

    switch (activeTab) {
      case "public":
        return publicSets.length > 0 ? (
          renderPublicSets()
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full mb-6">
              <Icon
                icon="solar:document-bold"
                className="w-16 h-16 text-blue-500"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              لا توجد أسئلة عامة
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              كن أول من ينشئ مجموعة أسئلة عامة!
            </p>
          </div>
        );
      case "my-sets":
        return mySets.length > 0 ? (
          renderMySets()
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-6">
              <Icon
                icon="solar:document-bold"
                className="w-16 h-16 text-purple-500"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              لم تنشئ أي مجموعة أسئلة بعد
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              ابدأ بإنشاء مجموعة أسئلة جديدة
            </p>
          </div>
        );
      case "my-attempts":
        return myAttempts.length > 0 ? (
          renderMyAttempts()
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-full mb-6">
              <Icon
                icon="solar:clipboard-list-bold"
                className="w-16 h-16 text-green-500"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              لم تحاول أي اختبار بعد
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              ابدأ بمحاولة إحدى الأسئلة المتاحة
            </p>
          </div>
        );
      case "pending":
        return pendingAttempts.length > 0 ? (
          renderPendingAttempts()
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full mb-6">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-16 h-16 text-yellow-500"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              لا توجد محاولات معلقة
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              جميع محاولاتك مكتملة!
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Icon
                  icon="solar:question-circle-bold-duotone"
                  className="w-12 h-12 text-white"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  منتدى الأسئلة
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  أنشئ وشارك أسئلة الاختبار مع المجتمع
                </p>
              </div>
            </div>
            <Link
              href="/questions-forum/create"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 text-lg"
            >
              <Icon icon="solar:add-circle-bold" className="w-6 h-6" />
              <span>إنشاء أسئلة جديدة</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex-1 min-w-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon icon={tab.icon} className="w-5 h-5" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters for public and my-sets tabs */}
        {(activeTab === "public" || activeTab === "my-sets") && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-80">
                <div className="relative">
                  <Icon
                    icon="solar:search-bold"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="البحث في الأسئلة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:filter-bold"
                  className="w-5 h-5 text-gray-500"
                />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">جميع المستويات</option>
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {renderContent()}

        {/* Pagination */}
        {totalPages > 1 && activeTab !== "pending" && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600">
                صفحة {currentPage} من {totalPages}
              </span>
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsForumPage;
