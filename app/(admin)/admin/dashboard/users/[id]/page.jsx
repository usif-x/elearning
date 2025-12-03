"use client";

import {
  getUserDetails,
  getUserGeneratedQuestions,
  getUserPracticeQuizzes,
  getUserQuizAttempts,
  getUserUsage,
} from "@/services/admin/User";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminUserDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Paginated data states
  const [quizAttempts, setQuizAttempts] = useState({
    items: [],
    total: 0,
    page: 1,
    size: 10,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState({
    items: [],
    total: 0,
    page: 1,
    size: 10,
  });
  const [usageHistory, setUsageHistory] = useState({
    items: [],
    total: 0,
    page: 1,
    size: 10,
  });
  const [practiceQuizzes, setPracticeQuizzes] = useState({
    items: [],
    total: 0,
    page: 1,
    size: 10,
  });
  const [tabLoading, setTabLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserDetails(id);
      setUser(data);
    } catch (err) {
      console.error("Failed to load user details:", err);
      setError(
        err?.response?.data?.detail ||
          err.message ||
          "فشل في جلب بيانات المستخدم"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTabData = useCallback(
    async (tab, page = 1) => {
      setTabLoading(true);
      try {
        switch (tab) {
          case "quiz-attempts": {
            const data = await getUserQuizAttempts(id, { page, size: 10 });
            // API returns { attempts: [...], total, page, size, total_pages }
            const items = data?.attempts || [];
            setQuizAttempts({
              items,
              total: data?.total || items.length,
              page: data?.page || page,
              size: data?.size || 10,
              totalPages: data?.total_pages || 1,
            });
            break;
          }
          case "generated-questions": {
            const data = await getUserGeneratedQuestions(id, {
              page,
              size: 10,
            });
            // API returns { questions: [...], total, page, size, total_pages }
            const items = data?.questions || [];
            setGeneratedQuestions({
              items,
              total: data?.total || items.length,
              page: data?.page || page,
              size: data?.size || 10,
              totalPages: data?.total_pages || 1,
            });
            break;
          }
          case "usage": {
            const data = await getUserUsage(id, { page, size: 10 });
            // API returns { usage: [...], total_days, page, size, total_pages }
            const items = data?.usage || [];
            setUsageHistory({
              items,
              total: data?.total_days || items.length,
              page: data?.page || page,
              size: data?.size || 10,
              totalPages: data?.total_pages || 1,
            });
            break;
          }
          case "practice-quizzes": {
            const data = await getUserPracticeQuizzes(id, { page, size: 10 });
            // API returns { practice_quizzes: [...], total, page, size, total_pages }
            const items = data?.practice_quizzes || [];
            setPracticeQuizzes({
              items,
              total: data?.total || items.length,
              page: data?.page || page,
              size: data?.size || 10,
              totalPages: data?.total_pages || 1,
            });
            break;
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${tab}:`, err);
      } finally {
        setTabLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (id) fetchUser();
  }, [id, fetchUser]);

  useEffect(() => {
    if (id && activeTab !== "overview") {
      fetchTabData(activeTab, 1);
    }
  }, [id, activeTab, fetchTabData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                جاري تحميل بيانات المستخدم...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="solar:danger-triangle-bold-duotone"
                  className="w-8 h-8 text-red-500"
                />
              </div>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-medium"
              >
                العودة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("ar-EG");
    } catch {
      return iso;
    }
  };

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: "solar:chart-2-bold-duotone" },
    {
      id: "quiz-attempts",
      label: "محاولات الاختبارات",
      icon: "solar:document-bold-duotone",
    },
    {
      id: "generated-questions",
      label: "الأسئلة المنشأة",
      icon: "solar:question-circle-bold-duotone",
    },

    {
      id: "practice-quizzes",
      label: "اختبارات الممارسة",
      icon: "solar:notebook-bold-duotone",
    },
    { id: "usage", label: "سجل الاستخدام", icon: "solar:history-bold-duotone" },
  ];

  const Pagination = ({ data, onPageChange }) => {
    const totalPages =
      data.totalPages || Math.ceil(data.total / data.size) || 1;
    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          عرض {data.items?.length || 0} من أصل{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {data.total}
          </span>
        </span>
        <div className="flex gap-2">
          <button
            disabled={data.page <= 1}
            onClick={() => onPageChange(data.page - 1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            السابق
          </button>
          <span className="flex items-center px-4 py-2 text-sm font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
            {data.page}
          </span>
          <button
            disabled={data.page >= totalPages}
            onClick={() => onPageChange(data.page + 1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            التالي
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pt-24 pb-12"
      dir="rtl"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon
                icon="solar:user-id-bold-duotone"
                className="text-blue-600"
              />
              بيانات المستخدم
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              عرض تفاصيل حساب وإحصاءات المستخدم
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm font-medium"
            >
              <Icon icon="solar:arrow-right-linear" className="w-5 h-5" />
              العودة
            </button>
            <button
              onClick={() => fetchUser()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-medium"
            >
              <Icon icon="solar:refresh-linear" className="w-5 h-5" />
              تحديث
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                {user.profile_picture ? (
                  <Image
                    src={user.profile_picture}
                    alt={user.full_name || "avatar"}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      icon="solar:user-bold-duotone"
                      className="w-10 h-10 text-blue-500"
                    />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.full_name || "-"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email || "-"}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {user.is_active ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                      نشط
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800">
                      غير نشط
                    </span>
                  )}
                  {user.is_verified && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                      موثق
                    </span>
                  )}
                  {user.status && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                      {user.status === "student"
                        ? "طالب"
                        : user.status === "teacher"
                        ? "مدرس"
                        : user.status === "admin"
                        ? "مدير"
                        : user.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard
                label="رقم الهاتف"
                value={user.phone_number}
                icon="solar:phone-calling-bold-duotone"
              />
              <InfoCard
                label="هاتف ولي الأمر"
                value={user.parent_phone}
                icon="solar:phone-bold-duotone"
              />
              <InfoCard
                label="الرقم الأكاديمي"
                value={user.academic_id}
                icon="solar:card-bold-duotone"
              />
              <InfoCard
                label="الجنس"
                value={
                  user.sex === "male"
                    ? "ذكر"
                    : user.sex === "female"
                    ? "أنثى"
                    : "-"
                }
                icon="solar:user-bold-duotone"
              />
              <InfoCard
                label="رصيد المحفظة"
                value={`${user.wallet_balance || 0} جنيه`}
                icon="solar:wallet-bold-duotone"
              />
              <InfoCard
                label="تيليجرام"
                value={
                  user.telegram_username ? `@${user.telegram_username}` : "-"
                }
                icon="logos:telegram"
              />
              <InfoCard
                label="تاريخ الإنشاء"
                value={formatDate(user.created_at)}
                icon="solar:calendar-bold-duotone"
              />
              <InfoCard
                label="آخر تسجيل دخول"
                value={formatDate(user.last_login)}
                icon="solar:login-2-bold-duotone"
              />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Icon icon={tab.icon} className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {tabLoading && activeTab !== "overview" ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    جاري التحميل...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Quiz Stats */}
                      <StatsSection
                        title="إحصاءات الاختبارات"
                        icon="solar:document-bold-duotone"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <Stat
                            title="إجمالي المحاولات"
                            value={user.quiz_stats?.total_attempts}
                          />
                          <Stat
                            title="المكتملة"
                            value={user.quiz_stats?.completed_attempts}
                          />
                          <Stat
                            title="متوسط الدرجة"
                            value={user.quiz_stats?.avg_score?.toFixed(1)}
                          />
                          <Stat
                            title="دقة الإجابة (%)"
                            value={user.quiz_stats?.accuracy_rate?.toFixed(1)}
                          />
                          <Stat
                            title="أعلى درجة"
                            value={user.quiz_stats?.highest_score}
                          />
                          <Stat
                            title="أدنى درجة"
                            value={user.quiz_stats?.lowest_score}
                          />
                        </div>
                      </StatsSection>

                      {/* Usage Stats */}
                      <StatsSection
                        title="سجل الاستخدام"
                        icon="solar:history-bold-duotone"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <Stat
                            title="أيام نشطة"
                            value={user.usage_stats?.total_days_active}
                          />
                          <Stat
                            title="إجمالي الدقائق"
                            value={user.usage_stats?.total_minutes}
                          />
                          <Stat
                            title="إجمالي الساعات"
                            value={user.usage_stats?.total_hours?.toFixed(1)}
                          />
                          <Stat
                            title="متوسط دقيقة/يوم"
                            value={user.usage_stats?.avg_minutes_per_day?.toFixed(
                              1
                            )}
                          />
                        </div>
                      </StatsSection>

                      {/* Generated Questions Stats */}
                      <StatsSection
                        title="الأسئلة المنشأة"
                        icon="solar:question-circle-bold-duotone"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <Stat
                            title="مجموع المجموعات"
                            value={
                              user.generated_questions_stats
                                ?.total_sets_generated
                            }
                          />
                          <Stat
                            title="إجمالي الأسئلة"
                            value={
                              user.generated_questions_stats
                                ?.total_questions_generated
                            }
                          />
                          <Stat
                            title="عام"
                            value={user.generated_questions_stats?.public_count}
                          />
                          <Stat
                            title="خاص"
                            value={
                              user.generated_questions_stats?.private_count
                            }
                          />
                        </div>
                      </StatsSection>

                      {/* Practice Quiz Stats */}
                      <StatsSection
                        title="اختبارات الممارسة"
                        icon="solar:notebook-bold-duotone"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <Stat
                            title="الإجمالي"
                            value={
                              user.practice_quiz_stats?.total_practice_quizzes
                            }
                          />
                          <Stat
                            title="مكتملة"
                            value={user.practice_quiz_stats?.completed_count}
                          />
                          <Stat
                            title="غير مكتملة"
                            value={user.practice_quiz_stats?.incomplete_count}
                          />
                          <Stat
                            title="متوسط الدرجة"
                            value={user.practice_quiz_stats?.avg_score?.toFixed(
                              1
                            )}
                          />
                        </div>
                      </StatsSection>
                    </div>

                    {/* Enrollment Stats */}
                    <StatsSection
                      title="إحصاءات التسجيل"
                      icon="solar:book-2-bold-duotone"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Stat
                          title="مقيد بالكورسات"
                          value={user.enrollment_stats?.total_enrolled_courses}
                        />
                        <Stat
                          title="مكتمل"
                          value={user.enrollment_stats?.completed_courses}
                        />
                        <Stat
                          title="قيد التنفيذ"
                          value={user.enrollment_stats?.in_progress_courses}
                        />
                        <Stat
                          title="متوسط التقدم (%)"
                          value={user.enrollment_stats?.avg_progress?.toFixed(
                            1
                          )}
                        />
                      </div>
                    </StatsSection>
                  </div>
                )}

                {/* Quiz Attempts Tab */}
                {activeTab === "quiz-attempts" && (
                  <div>
                    {!Array.isArray(quizAttempts.items) ||
                    quizAttempts.items.length === 0 ? (
                      <EmptyState message="لا توجد محاولات اختبارات" />
                    ) : (
                      <>
                        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700">
                          <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50/80 dark:bg-gray-700/50">
                              <tr>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الاختبار
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الدرجة
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الإجابات الصحيحة
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الوقت
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الحالة
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  التاريخ
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {quizAttempts.items.map((item, idx) => (
                                <tr
                                  key={item.id || idx}
                                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    {item.quiz_title || "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        (item.score ?? 0) >= 80
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : (item.score ?? 0) >= 50
                                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      }`}
                                    >
                                      {item.score ?? "-"}%
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">
                                      {item.correct_answers ?? "-"}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500">
                                      {" "}
                                      /{" "}
                                    </span>
                                    <span>{item.total_questions ?? "-"}</span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    {item.time_taken != null
                                      ? `${item.time_taken} د`
                                      : "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                        item.is_completed === 1 ||
                                        item.is_completed === true
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      }`}
                                    >
                                      {item.is_completed === 1 ||
                                      item.is_completed === true
                                        ? "مكتمل"
                                        : "قيد التنفيذ"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                    {formatDate(item.started_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Pagination
                          data={quizAttempts}
                          onPageChange={(p) => fetchTabData("quiz-attempts", p)}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Generated Questions Tab */}
                {activeTab === "generated-questions" && (
                  <div>
                    {!Array.isArray(generatedQuestions.items) ||
                    generatedQuestions.items.length === 0 ? (
                      <EmptyState message="لا توجد أسئلة منشأة" />
                    ) : (
                      <>
                        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                          <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                              <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  العنوان
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  الموضوع
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  عدد الأسئلة
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  الصعوبة
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  المحاولات
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  الحالة
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  التاريخ
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {generatedQuestions.items.map((item, idx) => (
                                <tr
                                  key={item.id || idx}
                                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    {item.title || "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                    {item.topic || "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                    {item.total_questions ?? "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                        item.difficulty === "hard"
                                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800"
                                          : item.difficulty === "medium"
                                          ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800"
                                          : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800"
                                      }`}
                                    >
                                      {item.difficulty === "hard"
                                        ? "صعب"
                                        : item.difficulty === "medium"
                                        ? "متوسط"
                                        : "سهل"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                    {item.attempt_count ?? 0}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                        item.is_public
                                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800"
                                          : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                                      }`}
                                    >
                                      {item.is_public ? "عام" : "خاص"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">
                                    {formatDate(item.created_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Pagination
                          data={generatedQuestions}
                          onPageChange={(p) =>
                            fetchTabData("generated-questions", p)
                          }
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Usage History Tab */}
                {activeTab === "usage" && (
                  <div className="space-y-6">
                    {/* Usage Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            icon="solar:calendar-bold-duotone"
                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          />
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            أيام نشطة
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {usageHistory.total || 0}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-4 border border-green-100 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            icon="solar:clock-circle-bold-duotone"
                            className="w-5 h-5 text-green-600 dark:text-green-400"
                          />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            إجمالي الدقائق
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.usage_stats?.total_minutes || 0}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            icon="solar:hourglass-bold-duotone"
                            className="w-5 h-5 text-purple-600 dark:text-purple-400"
                          />
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                            إجمالي الساعات
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.usage_stats?.total_hours?.toFixed(1) || 0}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-2xl p-4 border border-orange-100 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            icon="solar:chart-2-bold-duotone"
                            className="w-5 h-5 text-orange-600 dark:text-orange-400"
                          />
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            متوسط دقيقة/يوم
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.usage_stats?.avg_minutes_per_day?.toFixed(1) ||
                            0}
                        </p>
                      </div>
                    </div>

                    {!Array.isArray(usageHistory.items) ||
                    usageHistory.items.length === 0 ? (
                      <EmptyState message="لا يوجد سجل استخدام" />
                    ) : (
                      <>
                        {/* Usage Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <Icon
                                icon="solar:chart-bold-duotone"
                                className="w-5 h-5 text-blue-600"
                              />
                              مخطط الاستخدام اليومي
                            </h3>
                          </div>
                          <UsageChart data={usageHistory.items} />
                        </div>

                        {/* Usage Table */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50/80 dark:bg-gray-700/50">
                              <tr>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  التاريخ
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الدقائق المستخدمة
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {usageHistory.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    {formatDate(item.date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
                                      {item.minutes_spent ?? 0} دقيقة
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Pagination
                          data={usageHistory}
                          onPageChange={(p) => fetchTabData("usage", p)}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Practice Quizzes Tab */}
                {activeTab === "practice-quizzes" && (
                  <div>
                    {!Array.isArray(practiceQuizzes.items) ||
                    practiceQuizzes.items.length === 0 ? (
                      <EmptyState message="لا توجد اختبارات ممارسة" />
                    ) : (
                      <>
                        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50/80 dark:bg-gray-700/50">
                              <tr>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  العنوان
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  عدد الأسئلة
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الدرجة
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الإجابات الصحيحة
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الوقت
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  الحالة
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                                  التاريخ
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {practiceQuizzes.items.map((item, idx) => (
                                <tr
                                  key={item.id || idx}
                                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    {item.title || "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    {item.total_questions ?? "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        (item.score ?? 0) >= 80
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : (item.score ?? 0) >= 50
                                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      }`}
                                    >
                                      {item.score ?? "-"}%
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">
                                      {item.correct_answers ?? "-"}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500">
                                      {" "}
                                      /{" "}
                                    </span>
                                    <span>{item.total_questions ?? "-"}</span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    {item.time_taken != null
                                      ? `${item.time_taken} ث`
                                      : "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                        item.is_completed === true
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      }`}
                                    >
                                      {item.is_completed === true
                                        ? "مكتمل"
                                        : "غير مكتمل"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                    {formatDate(item.created_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Pagination
                          data={practiceQuizzes}
                          onPageChange={(p) =>
                            fetchTabData("practice-quizzes", p)
                          }
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-gray-50/80 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon icon={icon} className="w-4 h-4 text-blue-500" />
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {label}
        </span>
      </div>
      <p className="font-semibold text-gray-900 dark:text-white text-sm">
        {value || "-"}
      </p>
    </div>
  );
}

function StatsSection({ title, icon, children }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Icon
            icon={icon}
            className="w-5 h-5 text-blue-600 dark:text-blue-400"
          />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
        {title}
      </p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">
        {value ?? "-"}
      </p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon="solar:inbox-bold-duotone"
          className="w-10 h-10 text-gray-400"
        />
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );
}

function UsageChart({ data }) {
  if (!data || data.length === 0) return null;

  // Sort data by date (oldest first) and take last 14 days
  const chartData = [...data]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14)
    .map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "short",
      }),
      minutes: item.minutes_spent || 0,
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {label}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
            {payload[0].value} دقيقة
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
            className="dark:opacity-20"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(value) => `${value}`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#colorMinutes)"
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{
              r: 6,
              fill: "#2563eb",
              strokeWidth: 2,
              stroke: "#fff",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
