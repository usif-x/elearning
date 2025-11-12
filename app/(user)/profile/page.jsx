"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useState } from "react";

const UserProfile = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");

  const profileTabs = [
    {
      id: "overview",
      label: "نظرة عامة",
      icon: "solar:user-id-bold",
    },
    {
      id: "personal-info",
      label: "المعلومات الشخصية",
      icon: "solar:card-bold",
    },
    {
      id: "security",
      label: "الأمان والخصوصية",
      icon: "solar:shield-keyhole-bold",
    },
    {
      id: "notifications",
      label: "الإشعارات",
      icon: "solar:bell-bold",
    },
    {
      id: "wallet",
      label: "المحفظة",
      icon: "solar:wallet-bold",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                نظرة عامة على الحساب
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                مرحباً بك في ملفك الشخصي،{" "}
                {user?.display_name || user?.full_name}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <Icon icon="solar:wallet-bold" className="w-12 h-12" />
                  <span className="text-sm opacity-90">الرصيد المتاح</span>
                </div>
                <p className="text-3xl font-bold">
                  {user?.wallet_balance || 0} ج.م
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <Icon icon="solar:book-bookmark-bold" className="w-12 h-12" />
                  <span className="text-sm opacity-90">الكورسات المفعلة</span>
                </div>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </div>
        );

      case "personal-info":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              المعلومات الشخصية
            </h2>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  الاسم الكامل
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.full_name || "غير محدد"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  الاسم المعروض
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.display_name || "غير محدد"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  البريد الإلكتروني
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.email || "غير محدد"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  رقم الهاتف
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.phone_number || "غير محدد"}
                </p>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              الأمان والخصوصية
            </h2>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon
                    icon="solar:verified-check-bold"
                    className="w-8 h-8 text-green-500"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      حالة التوثيق
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.is_verified ? "حساب موثق" : "حساب غير موثق"}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    user?.is_verified
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}
                >
                  {user?.is_verified ? "موثق" : "غير موثق"}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon icon="bxl:telegram" className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      حساب تيليجرام
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.telegram_username
                        ? `@${user.telegram_username}`
                        : "غير مربوط"}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    user?.telegram_verified
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {user?.telegram_verified ? "مربوط" : "غير مربوط"}
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              إعدادات الإشعارات
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              قريباً... سيتم إضافة خيارات التحكم في الإشعارات
            </p>
          </div>
        );

      case "wallet":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              محفظتي
            </h2>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Icon icon="solar:wallet-bold" className="w-12 h-12" />
                <div>
                  <p className="text-sm opacity-90">الرصيد الحالي</p>
                  <p className="text-4xl font-bold">
                    {user?.wallet_balance || 0} ج.م
                  </p>
                </div>
              </div>
              <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                شحن المحفظة
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                آخر المعاملات
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                لا توجد معاملات حتى الآن
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Navigation Section */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden sticky top-24">
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-4 border-white/30 mb-4">
                    {user?.profile_picture ? (
                      <Image
                        src={user.profile_picture}
                        alt={user.full_name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/10">
                        <Icon icon="solar:user-bold" className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold mb-1">
                    {user?.display_name || user?.full_name || "مستخدم"}
                  </h2>

                  {user?.phone_number && (
                    <p className="text-sm opacity-90 mb-2">
                      {user.phone_number}
                    </p>
                  )}

                  {user?.status && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm">
                      {user.status === "student" ? "طالب" : user.status}
                    </span>
                  )}
                </div>

                {/* Verification Badges */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-1">
                    <Icon
                      icon={
                        user?.is_verified
                          ? "solar:verified-check-bold"
                          : "solar:verified-close-bold"
                      }
                      className={`w-5 h-5 ${
                        user?.is_verified ? "text-green-300" : "text-red-300"
                      }`}
                    />
                    <span className="text-xs">
                      {user?.is_verified ? "موثق" : "غير موثق"}
                    </span>
                  </div>
                  {user?.telegram_verified && (
                    <div className="flex items-center gap-1">
                      <Icon
                        icon="bxl:telegram"
                        className="w-5 h-5 text-blue-300"
                      />
                      <span className="text-xs">تيليجرام</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-2">
                {profileTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-sky-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon icon={tab.icon} className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
