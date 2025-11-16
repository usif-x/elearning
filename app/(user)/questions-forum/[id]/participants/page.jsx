"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getQuestionSetParticipants } from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ParticipantsPage = () => {
  const params = useParams();
  const router = useRouter();
  const questionSetId = params.id;

  const [participants, setParticipants] = useState([]);
  const [questionSetInfo, setQuestionSetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    fetchParticipants();
  }, [questionSetId, currentPage]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const data = await getQuestionSetParticipants(questionSetId, {
        page: currentPage,
        size: 20,
      });
      setParticipants(data.participants || []);
      setQuestionSetInfo({
        title: data.question_set_title,
        totalAttempts: data.total_attempts,
      });
      setTotalParticipants(data.total_participants || 0);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("حدث خطأ أثناء تحميل المشاركين");
      router.push("/questions-forum");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <Icon icon="solar:cup-bold" className="text-yellow-500 text-xl" />
        );
      case 2:
        return <Icon icon="solar:cup-bold" className="text-gray-400 text-xl" />;
      case 3:
        return (
          <Icon icon="solar:cup-bold" className="text-amber-600 text-xl" />
        );
      default:
        return (
          <span className="text-gray-500 font-bold w-6 text-center">
            #{rank}
          </span>
        );
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-500";
      default:
        return "bg-gray-100 dark:bg-gray-700";
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
              <Icon
                icon="solar:cup-bold-duotone"
                className="w-12 h-12 text-white"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                لوحة الصدارة
              </h1>
              {questionSetInfo && (
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {questionSetInfo.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {questionSetInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 text-center">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl mb-4">
                <Icon
                  icon="solar:user-bold"
                  className="w-8 h-8 text-blue-500"
                />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {totalParticipants}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي المشاركين
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 text-center">
              <div className="inline-flex p-3 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-xl mb-4">
                <Icon
                  icon="solar:play-circle-bold"
                  className="w-8 h-8 text-green-500"
                />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {questionSetInfo.totalAttempts}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي المحاولات
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 text-center">
              <div className="inline-flex p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl mb-4">
                <Icon
                  icon="solar:medal-star-bold"
                  className="w-8 h-8 text-purple-500"
                />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {participants.length > 0
                  ? Math.max(...participants.map((p) => p.best_score))
                  : 0}
                %
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                أعلى نتيجة
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 text-center">
              <div className="inline-flex p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl mb-4">
                <Icon
                  icon="solar:chart-square-bold"
                  className="w-8 h-8 text-amber-500"
                />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {participants.length > 0
                  ? (
                      participants.reduce((sum, p) => sum + p.best_score, 0) /
                      participants.length
                    ).toFixed(1)
                  : 0}
                %
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                متوسط النتائج
              </p>
            </div>
          </div>
        )}

        {/* Participants List */}
        <div className="space-y-6">
          {participants.length > 0 ? (
            participants.map((participant) => (
              <div
                key={`${participant.user_id}-${participant.rank}`}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 ${
                  participant.rank <= 3
                    ? "ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900"
                    : ""
                } ${
                  participant.rank === 1
                    ? "ring-yellow-400"
                    : participant.rank === 2
                    ? "ring-gray-400"
                    : participant.rank === 3
                    ? "ring-amber-400"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg ${
                        participant.rank === 1
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                          : participant.rank === 2
                          ? "bg-gradient-to-br from-gray-300 to-gray-400"
                          : participant.rank === 3
                          ? "bg-gradient-to-br from-amber-400 to-amber-500"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
                      }`}
                    >
                      {participant.rank <= 3 ? (
                        <Icon
                          icon="solar:cup-bold"
                          className="w-8 h-8 text-white"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-700 dark:text-gray-200">
                          #{participant.rank}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {participant.user_name}
                        </h3>
                        {participant.rank <= 3 && (
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              participant.rank === 1
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : participant.rank === 2
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}
                          >
                            المركز {participant.rank}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Icon
                          icon="solar:play-circle-bold"
                          className="w-4 h-4"
                        />
                        <span>{participant.total_attempts} محاولة</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                      {participant.best_score}%
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Icon
                        icon="solar:clock-circle-bold"
                        className="w-4 h-4"
                      />
                      <span>
                        آخر محاولة:{" "}
                        {new Date(
                          participant.last_attempt_at
                        ).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
                <Icon
                  icon="solar:cup-bold"
                  className="w-16 h-16 text-gray-400"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                لا يوجد مشاركون بعد
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                كن أول من يحاول هذا الاختبار!
              </p>
              <Link
                href={`/questions-forum/${questionSetId}/attempt`}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                <Icon icon="solar:play-circle-bold" className="w-6 h-6" />
                <span>ابدأ المحاولة</span>
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/questions-forum"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
          >
            <Icon icon="solar:home-bold" className="w-6 h-6" />
            <span>العودة للمنتدى</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;
