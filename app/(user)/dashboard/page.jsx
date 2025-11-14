"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

// Fake data for dashboard stats
const fakeStats = {
  totalCourses: 8,
  completedCourses: 3,
  totalVideos: 124,
  watchedVideos: 87,
  totalQuizzes: 32,
  completedQuizzes: 24,
  averageQuizScore: 85.5,
  totalStudyHours: 156,
  currentStreak: 12,
};

// Fake data for weekly progress
const weeklyProgress = [
  { day: "السبت", hours: 4.5, videos: 8 },
  { day: "الأحد", hours: 3.2, videos: 6 },
  { day: "الاثنين", hours: 5.8, videos: 10 },
  { day: "الثلاثاء", hours: 2.5, videos: 5 },
  { day: "الأربعاء", hours: 6.2, videos: 12 },
  { day: "الخميس", hours: 4.0, videos: 7 },
  { day: "الجمعة", hours: 3.5, videos: 6 },
];

// Fake data for recent quiz scores
const recentQuizzes = [
  { name: "اختبار الكيمياء العضوية", score: 92, total: 100, date: "منذ يومين" },
  {
    name: "اختبار الفيزياء الحديثة",
    score: 78,
    total: 100,
    date: "منذ 3 أيام",
  },
  { name: "اختبار الرياضيات", score: 88, total: 100, date: "منذ 5 أيام" },
  { name: "اختبار البرمجة", score: 95, total: 100, date: "منذ أسبوع" },
];

// Fake data for course progress
const courseProgress = [
  { name: "الكيمياء العامة", progress: 85, color: "sky" },
  { name: "الفيزياء", progress: 62, color: "purple" },
  { name: "الرياضيات", progress: 95, color: "blue" },
  { name: "البرمجة", progress: 45, color: "green" },
];

export function UserDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const { userType, user } = useAuthStore();

  // Admin view
  if (userType === "admin") {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-flex p-6 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                <Icon
                  icon="solar:shield-user-bold-duotone"
                  className="w-24 h-24 text-red-500"
                />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                مرحباً Admin
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {user?.full_name || user?.display_name || "مدير النظام"}
              </p>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg text-lg"
              >
                <Icon icon="solar:shield-user-bold" className="w-6 h-6" />
                <span>الذهاب إلى لوحة الإدارة</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getColorClasses = (color) => {
    const colors = {
      sky: "bg-sky-500",
      purple: "bg-purple-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      amber: "bg-amber-500",
      red: "bg-red-500",
    };
    return colors[color] || colors.sky;
  };

  const maxHours = Math.max(...weeklyProgress.map((d) => d.hours));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                لوحة التحكم
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                تابع تقدمك الدراسي وإنجازاتك
              </p>
            </div>
            {userType === "admin" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
              >
                <Icon icon="solar:shield-user-bold" className="w-5 h-5" />
                <span>لوحة الإدارة</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Study Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-r-4 border-sky-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                <Icon
                  icon="solar:clock-circle-bold-duotone"
                  className="w-8 h-8 text-sky-500"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                إجمالي
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {fakeStats.totalStudyHours}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ساعة دراسة
            </p>
          </div>

          {/* Videos Watched */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-r-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Icon
                  icon="solar:videocamera-record-bold-duotone"
                  className="w-8 h-8 text-purple-500"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(
                  (fakeStats.watchedVideos / fakeStats.totalVideos) * 100
                )}
                %
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {fakeStats.watchedVideos}/{fakeStats.totalVideos}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              فيديو مشاهد
            </p>
          </div>

          {/* Quizzes Completed */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-r-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Icon
                  icon="solar:clipboard-check-bold-duotone"
                  className="w-8 h-8 text-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(
                  (fakeStats.completedQuizzes / fakeStats.totalQuizzes) * 100
                )}
                %
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {fakeStats.completedQuizzes}/{fakeStats.totalQuizzes}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              اختبار مكتمل
            </p>
          </div>

          {/* Average Quiz Score */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-r-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Icon
                  icon="solar:medal-star-bold-duotone"
                  className="w-8 h-8 text-green-500"
                />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                ممتاز
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {fakeStats.averageQuizScore}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              متوسط درجات الاختبارات
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Study Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  مسيرة الدراسة الأسبوعية
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  عدد ساعات الدراسة والفيديوهات المشاهدة
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPeriod("week")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedPeriod === "week"
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  أسبوع
                </button>
                <button
                  onClick={() => setSelectedPeriod("month")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedPeriod === "month"
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  شهر
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                      {day.day}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-lg transition-all duration-500 flex items-center justify-end px-3"
                          style={{ width: `${(day.hours / maxHours) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white">
                            {day.hours}س
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon
                        icon="solar:videocamera-record-bold"
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-600 dark:text-gray-400 w-8">
                        {day.videos}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-sky-500 to-blue-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ساعات الدراسة
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:videocamera-record-bold"
                  className="w-4 h-4 text-purple-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الفيديوهات
                </span>
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-center">
              <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                <Icon icon="solar:fire-bold" className="w-16 h-16" />
              </div>
              <h3 className="text-5xl font-bold mb-2">
                {fakeStats.currentStreak}
              </h3>
              <p className="text-xl font-semibold mb-4">يوم متتالي</p>
              <p className="text-sm text-white/80">
                استمر في التعلم للحفاظ على سلسلتك!
              </p>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon icon="solar:cup-star-bold" className="w-5 h-5" />
                  <span className="text-sm font-semibold">أفضل سلسلة</span>
                </div>
                <p className="text-3xl font-bold">28 يوم</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Course Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                تقدم الكورسات
              </h2>
              <Icon
                icon="solar:chart-bold-duotone"
                className="w-6 h-6 text-sky-500"
              />
            </div>

            <div className="space-y-6">
              {courseProgress.map((course, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {course.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getColorClasses(
                        course.color
                      )} rounded-full transition-all duration-500`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Progress Circle */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    الإجمالي
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(
                      courseProgress.reduce((acc, c) => acc + c.progress, 0) /
                        courseProgress.length
                    )}
                    %
                  </p>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        40 *
                        (1 -
                          courseProgress.reduce(
                            (acc, c) => acc + c.progress,
                            0
                          ) /
                            courseProgress.length /
                            100)
                      }`}
                      className="text-sky-500 transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      icon="solar:chart-2-bold"
                      className="w-8 h-8 text-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Quiz Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                نتائج الاختبارات الأخيرة
              </h2>
              <Icon
                icon="solar:clipboard-list-bold-duotone"
                className="w-6 h-6 text-blue-500"
              />
            </div>

            <div className="space-y-4">
              {recentQuizzes.map((quiz, index) => {
                const percentage = (quiz.score / quiz.total) * 100;
                const getScoreColor = (percent) => {
                  if (percent >= 90) return "text-green-500";
                  if (percent >= 75) return "text-blue-500";
                  if (percent >= 60) return "text-amber-500";
                  return "text-red-500";
                };

                return (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {quiz.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {quiz.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${getScoreColor(
                            percentage
                          )}`}
                        >
                          {percentage}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {quiz.score}/{quiz.total}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          percentage >= 90
                            ? "bg-green-500"
                            : percentage >= 75
                            ? "bg-blue-500"
                            : percentage >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                        } rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  أعلى درجة
                </p>
                <p className="text-2xl font-bold text-blue-500">95%</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  المتوسط
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {fakeStats.averageQuizScore}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
