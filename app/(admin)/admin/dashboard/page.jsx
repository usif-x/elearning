"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, userType, admin } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (userType !== "admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, userType, router]);

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
        <p className="text-gray-600 dark:text-gray-400">
          مرحباً بك في لوحة التحكم الإدارية
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Icon
                icon="solar:users-group-rounded-bold-duotone"
                className="w-8 h-8 text-blue-500"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            1,234
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            إجمالي الطلاب
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Icon
                icon="solar:book-bold-duotone"
                className="w-8 h-8 text-green-500"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            45
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            الكورسات النشطة
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Icon
                icon="solar:user-speak-bold-duotone"
                className="w-8 h-8 text-purple-500"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            23
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">المدرسين</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Icon
                icon="solar:wallet-bold-duotone"
                className="w-8 h-8 text-amber-500"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            $12,450
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            إجمالي الإيرادات
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          النشاطات الأخيرة
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Icon icon="solar:user-bold" className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  طالب جديد انضم للمنصة
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  منذ {item} ساعات
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
