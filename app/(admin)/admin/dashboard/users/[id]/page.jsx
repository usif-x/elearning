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
            setQuizAttempts({
              items: data.items || data,
              total: data.total || data.length,
              page,
              size: 10,
            });
            break;
          }
          case "generated-questions": {
            const data = await getUserGeneratedQuestions(id, {
              page,
              size: 10,
            });
            setGeneratedQuestions({
              items: data.items || data,
              total: data.total || data.length,
              page,
              size: 10,
            });
            break;
          }
          case "usage": {
            const data = await getUserUsage(id, { page, size: 10 });
            setUsageHistory({
              items: data.items || data,
              total: data.total || data.length,
              page,
              size: 10,
            });
            break;
          }
          case "practice-quizzes": {
            const data = await getUserPracticeQuizzes(id, { page, size: 10 });
            setPracticeQuizzes({
              items: data.items || data,
              total: data.total || data.length,
              page,
              size: 10,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="w-12 h-12 text-sky-500 mx-auto mb-4 animate-spin"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل بيانات المستخدم...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600">
          <p className="mb-4">خطأ: {error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            العودة
          </button>
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
    { id: "overview", label: "نظرة عامة", icon: "material-symbols:dashboard" },
    {
      id: "quiz-attempts",
      label: "محاولات الاختبارات",
      icon: "material-symbols:quiz",
    },
    {
      id: "generated-questions",
      label: "الأسئلة المنشأة",
      icon: "material-symbols:help-outline",
    },
    { id: "usage", label: "سجل الاستخدام", icon: "material-symbols:history" },
    {
      id: "practice-quizzes",
      label: "اختبارات الممارسة",
      icon: "material-symbols:school",
    },
  ];

  const Pagination = ({ data, onPageChange }) => {
    const totalPages = Math.ceil(data.total / data.size) || 1;
    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          disabled={data.page <= 1}
          onClick={() => onPageChange(data.page - 1)}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
        >
          السابق
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          صفحة {data.page} من {totalPages}
        </span>
        <button
          disabled={data.page >= totalPages}
          onClick={() => onPageChange(data.page + 1)}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              بيانات المستخدم
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              عرض تفاصيل حساب وإحصاءات المستخدم
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              العودة
            </button>
            <button
              onClick={() => fetchUser()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              تحديث
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {user.profile_picture ? (
                  <Image
                    src={user.profile_picture}
                    alt={user.full_name || "avatar"}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Icon
                      icon="material-symbols:person"
                      className="w-12 h-12 text-gray-500"
                    />
                  </div>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.full_name || "-"}
                </h2>
                <p className="text-sm text-gray-500">{user.email || "-"}</p>
                <div className="flex items-center gap-2 mt-2">
                  {user.is_active && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                      نشط
                    </span>
                  )}
                  {user.is_verified && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                      موثق
                    </span>
                  )}
                  {user.status && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                      {user.status}
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
                icon="material-symbols:phone"
              />
              <InfoCard
                label="هاتف ولي الأمر"
                value={user.parent_phone}
                icon="material-symbols:phone-in-talk"
              />
              <InfoCard
                label="الرقم الأكاديمي"
                value={user.academic_id}
                icon="material-symbols:badge"
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
                icon="material-symbols:person"
              />
              <InfoCard
                label="رصيد المحفظة"
                value={`${user.wallet_balance || 0} جنيه`}
                icon="material-symbols:wallet"
              />
              <InfoCard
                label="تيليجرام"
                value={
                  user.telegram_username ? `@${user.telegram_username}` : "-"
                }
                icon="mdi:telegram"
              />
              <InfoCard
                label="تاريخ الإنشاء"
                value={formatDate(user.created_at)}
                icon="material-symbols:calendar-today"
              />
              <InfoCard
                label="آخر تسجيل دخول"
                value={formatDate(user.last_login)}
                icon="material-symbols:login"
              />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow">
          <div className="flex overflow-x-auto border-b dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
              <div className="flex items-center justify-center py-12">
                <Icon
                  icon="eos-icons:loading"
                  className="w-8 h-8 text-green-500 animate-spin"
                />
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
                        icon="material-symbols:quiz"
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
                        icon="material-symbols:history"
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
                        icon="material-symbols:help-outline"
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
                        icon="material-symbols:school"
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
                      icon="material-symbols:book"
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
                    {quizAttempts.items.length === 0 ? (
                      <EmptyState message="لا توجد محاولات اختبارات" />
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-right">
                                  الاختبار
                                </th>
                                <th className="px-4 py-3 text-right">الكورس</th>
                                <th className="px-4 py-3 text-right">الدرجة</th>
                                <th className="px-4 py-3 text-right">الحالة</th>
                                <th className="px-4 py-3 text-right">
                                  التاريخ
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                              {quizAttempts.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <td className="px-4 py-3">
                                    {item.quiz_title || item.quiz_id}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.course_title || item.course_id || "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.score ?? "-"} /{" "}
                                    {item.total_marks ?? "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded-full ${
                                        item.status === "completed"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {item.status === "completed"
                                        ? "مكتمل"
                                        : "قيد التنفيذ"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {formatDate(
                                      item.started_at || item.created_at
                                    )}
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
                    {generatedQuestions.items.length === 0 ? (
                      <EmptyState message="لا توجد أسئلة منشأة" />
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-right">
                                  العنوان
                                </th>
                                <th className="px-4 py-3 text-right">
                                  عدد الأسئلة
                                </th>
                                <th className="px-4 py-3 text-right">الحالة</th>
                                <th className="px-4 py-3 text-right">
                                  التاريخ
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                              {generatedQuestions.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <td className="px-4 py-3">
                                    {item.title || "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.questions_count ??
                                      item.total_questions ??
                                      "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded-full ${
                                        item.is_public
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {item.is_public ? "عام" : "خاص"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
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
                  <div>
                    {usageHistory.items.length === 0 ? (
                      <EmptyState message="لا يوجد سجل استخدام" />
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-right">
                                  التاريخ
                                </th>
                                <th className="px-4 py-3 text-right">
                                  الدقائق
                                </th>
                                <th className="px-4 py-3 text-right">النشاط</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                              {usageHistory.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <td className="px-4 py-3">
                                    {formatDate(item.date || item.created_at)}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.minutes ?? item.duration ?? "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.activity_type || item.action || "-"}
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
                    {practiceQuizzes.items.length === 0 ? (
                      <EmptyState message="لا توجد اختبارات ممارسة" />
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-right">
                                  العنوان
                                </th>
                                <th className="px-4 py-3 text-right">
                                  عدد الأسئلة
                                </th>
                                <th className="px-4 py-3 text-right">الدرجة</th>
                                <th className="px-4 py-3 text-right">الحالة</th>
                                <th className="px-4 py-3 text-right">
                                  التاريخ
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                              {practiceQuizzes.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <td className="px-4 py-3">
                                    {item.title || "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.questions_count ??
                                      item.total_questions ??
                                      "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.score ?? "-"} /{" "}
                                    {item.total_marks ?? "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded-full ${
                                        item.status === "completed" ||
                                        item.is_completed
                                          ? "bg-green-100 text-green-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {item.status === "completed" ||
                                      item.is_completed
                                        ? "مكتمل"
                                        : "غير مكتمل"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
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
    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon icon={icon} className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="font-medium text-gray-900 dark:text-white text-sm">
        {value || "-"}
      </p>
    </div>
  );
}

function StatsSection({ title, icon, children }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon={icon} className="w-5 h-5 text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="font-bold text-gray-900 dark:text-white">{value ?? "-"}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12">
      <Icon
        icon="material-symbols:inbox"
        className="w-16 h-16 text-gray-300 mx-auto mb-4"
      />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
