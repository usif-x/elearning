"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { getData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, userType, admin } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (userType !== "admin") {
      router.push("/profile");
    }
  }, [isAuthenticated, userType, router]);

  useEffect(() => {
    // fetch analytics when authenticated admin accesses the page
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getData("/analytics/", true); // auth=true
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

    if (isAuthenticated && userType === "admin") {
      fetchAnalytics();
    }
  }, [isAuthenticated, userType]);

  if (!isAuthenticated || userType !== "admin") {
    return null;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          لوحة التحكم
        </h1>
        <p className="text-gray-600 dark:text-gray-400">إحصائيات المنصة</p>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
          جاري جلب الإحصائيات...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center text-red-600">
          خطأ: {error}
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المستخدمين"
            value={analytics.total_users}
            icon="solar:users-group-rounded-bold-duotone"
            color="bg-blue-100 text-blue-500"
          />

          <StatCard
            title="المستخدمين النشطين"
            value={analytics.total_active_users}
            icon="solar:clock-bold-duotone"
            color="bg-green-100 text-green-500"
          />

          <StatCard
            title="إجمالي الكورسات"
            value={analytics.total_courses}
            icon="solar:book-bold-duotone"
            color="bg-purple-100 text-purple-500"
          />

          <StatCard
            title="إجمالي التسجيلات"
            value={analytics.total_enrollments}
            icon="solar:bag-bold-duotone"
            color="bg-amber-100 text-amber-500"
          />

          <StatCard
            title="إجمالي المحاضرات"
            value={analytics.total_lectures}
            icon="solar:video-bold-duotone"
            color="bg-sky-100 text-sky-500"
          />

          <StatCard
            title="إجمالي التعليقات"
            value={analytics.total_comments}
            icon="solar:chat-bold-duotone"
            color="bg-pink-100 text-pink-500"
          />

          <StatCard
            title="إجمالي الاختبارات"
            value={analytics.total_practice_quizzes}
            icon="solar:clipboard-bold-duotone"
            color="bg-lime-100 text-lime-700"
          />

          <StatCard
            title="محاولات الاختبار"
            value={analytics.total_quiz_attempts}
            icon="solar:quiz-bold"
            color="bg-emerald-100 text-emerald-600"
          />

          <StatCard
            title="أسئلة المستخدمين"
            value={analytics.total_user_questions}
            icon="solar:question-bold"
            color="bg-gray-100 text-gray-700"
          />
        </div>
      )}

      {/* Refresh Button */}
      <div className="mb-8">
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await getData("/analytics/", true);
              setAnalytics(data);
            } catch (err) {
              setError(
                err?.response?.data?.detail ||
                  err.message ||
                  "خطأ في جلب الإحصائيات"
              );
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          تحديث الإحصائيات
        </button>
      </div>
    </div>
  );
}

// Small presentational component for stats
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${color.split(" ")[0]} dark:${
            color.split(" ")[0]
          } `}
        >
          <Icon icon={icon} className={`w-8 h-8 ${color.split(" ")[1]}`} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
    </div>
  );
}
