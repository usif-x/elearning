"use client";

import Button from "@/components/ui/Button";
import { useAuthStore } from "@/hooks/useAuth";
import { getData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, userType } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topUsers, setTopUsers] = useState(null);
  const [topUsersLoading, setTopUsersLoading] = useState(false);
  const [activeTopUsersPeriod, setActiveTopUsersPeriod] = useState("today");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getData("/analytics/", true);
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(
        err?.response?.data?.detail || err.message || "خطأ في جلب الإحصائيات"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTopUsers = async (period) => {
    try {
      setTopUsersLoading(true);
      const data = await getData(`/usage/top/${period}`, false);
      setTopUsers(data);
    } catch (err) {
      console.error("Failed to load top users:", err);
    } finally {
      setTopUsersLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (userType !== "admin") {
      router.push("/profile");
    } else {
      fetchAnalytics();
      fetchTopUsers("today");
    }
  }, [isAuthenticated, userType, router]);

  useEffect(() => {
    if (isAuthenticated && userType === "admin") {
      fetchTopUsers(activeTopUsersPeriod);
    }
  }, [activeTopUsersPeriod]);

  if (!isAuthenticated || userType !== "admin") {
    return null;
  }

  const stats = analytics
    ? [
        {
          title: "إجمالي المستخدمين",
          value: analytics.total_users,
          icon: "solar:users-group-rounded-bold-duotone",
          color: "blue",
        },
        {
          title: "المستخدمين النشطين",
          value: analytics.total_active_users,
          icon: "nrk:user-loggedin-active",
          color: "green",
        },
        {
          title: "إجمالي الكورسات",
          value: analytics.total_courses,
          icon: "solar:book-bold-duotone",
          color: "purple",
        },
        {
          title: "إجمالي التسجيلات",
          value: analytics.total_enrollments,
          icon: "solar:bag-bold-duotone",
          color: "amber",
        },
        {
          title: "إجمالي المحاضرات",
          value: analytics.total_lectures,
          icon: "mdi:lecture",
          color: "sky",
        },
        {
          title: "إجمالي التعليقات",
          value: analytics.total_comments,
          icon: "mingcute:comment-fill",
          color: "pink",
        },
        {
          title: "إجمالي الاختبارات",
          value: analytics.total_practice_quizzes,
          icon: "solar:clipboard-bold-duotone",
          color: "lime",
        },
        {
          title: "محاولات الاختبار",
          value: analytics.total_quiz_attempts,
          icon: "icon-park-twotone:reload",
          color: "emerald",
        },
        {
          title: "أسئلة المستخدمين",
          value: analytics.total_user_questions,
          icon: "mingcute:user-question-fill",
          color: "indigo",
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            نظرة عامة على أداء المنصة والإحصائيات الحالية
          </p>
        </div>
        <Button
          onClick={fetchAnalytics}
          text="تحديث البيانات"
          icon="solar:refresh-bold"
          color="blue"
          isLoading={loading}
          className="shadow-lg shadow-blue-500/20"
        />
      </div>

      {/* Top Users Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Icon
              icon="solar:cup-star-bold-duotone"
              className="w-8 h-8 text-amber-500"
            />
            أكثر المستخدمين نشاطاً
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            المستخدمون الذين يقضون أطول وقت على المنصة
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-6">
          <div className="flex gap-2 border-b border-gray-100 dark:border-zinc-800">
            {[
              { id: "today", label: "اليوم", icon: "solar:calendar-bold" },
              {
                id: "week",
                label: "هذا الأسبوع",
                icon: "solar:calendar-mark-bold",
              },
              {
                id: "month",
                label: "هذا الشهر",
                icon: "solar:calendar-minimalistic-bold",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTopUsersPeriod(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 ${
                  activeTopUsersPeriod === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon icon={tab.icon} className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Users List */}
        <div className="p-6">
          {topUsersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : topUsers && topUsers.users && topUsers.users.length > 0 ? (
            <div className="space-y-3">
              {topUsers.users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        user.rank === 1
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          : user.rank === 2
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          : user.rank === 3
                          ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                    >
                      {user.rank === 1 ? (
                        <Icon icon="solar:cup-star-bold" className="w-5 h-5" />
                      ) : (
                        `#${user.rank}`
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {user.display_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Icon
                          icon="solar:clock-circle-bold"
                          className="w-4 h-4"
                        />
                        {Math.floor(user.total_minutes / 60)} ساعة و{" "}
                        {user.total_minutes % 60} دقيقة
                      </p>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <button
                    onClick={() =>
                      router.push(`/admin/dashboard/users/${user.user_id}`)
                    }
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Icon icon="solar:eye-bold" className="w-4 h-4" />
                    عرض الملف
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon
                icon="solar:user-cross-bold-duotone"
                className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
              />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                لا توجد بيانات لهذه الفترة
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <Icon icon="solar:danger-circle-bold" className="w-6 h-6" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, index }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    lime: "bg-lime-50 text-lime-600 dark:bg-lime-900/20 dark:text-lime-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  };

  return (
    <div
      className="group relative bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none" />

      <div className="relative flex flex-col h-full justify-between z-10">
        <div className="flex justify-between items-start mb-6">
          <div
            className={`p-4 rounded-2xl ${
              colorStyles[color] || colorStyles.blue
            } group-hover:scale-110 transition-transform duration-300 shadow-sm`}
          >
            <Icon icon={icon} className="w-8 h-8" />
          </div>
        </div>

        <div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            {value}
          </h3>
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-6 h-48 animate-pulse border border-gray-100 dark:border-zinc-800"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl mb-6"></div>
          <div className="h-10 w-24 bg-gray-100 dark:bg-zinc-800 rounded-lg mb-3"></div>
          <div className="h-5 w-32 bg-gray-100 dark:bg-zinc-800 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}
