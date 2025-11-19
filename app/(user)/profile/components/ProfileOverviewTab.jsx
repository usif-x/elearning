import { Icon } from "@iconify/react";

const ProfileOverviewTab = ({ user }) => {
  const displayName = user?.display_name || user?.full_name || "المستخدم";

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Icon icon="solar:user-bold" className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              مرحباً {displayName}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              أهلاً بك في لوحة تحكم حسابك الشخصي
            </p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm text-blue-100">
            📊 هنا يمكنك متابعة إحصائياتك، إدارة إعداداتك، وعرض تقدمك في المنصة
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Icon icon="solar:wallet-bold" className="w-10 h-10" />
            <span className="text-sm opacity-90">الرصيد المتاح</span>
          </div>
          <p className="text-2xl font-bold">{user?.wallet_balance || 0} ج.م</p>
          <p className="text-xs opacity-75 mt-1">قريباً - المزيد من المميزات</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Icon icon="solar:book-bookmark-bold" className="w-10 h-10" />
            <span className="text-sm opacity-90">الكورسات المفعلة</span>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs opacity-75 mt-1">قريباً - عرض الكورسات</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Icon icon="solar:quiz-bold" className="w-10 h-10" />
            <span className="text-sm opacity-90">الاختبارات المكتملة</span>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs opacity-75 mt-1">
            قريباً - إحصائيات الاختبارات
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Icon icon="solar:chart-square-bold" className="w-10 h-10" />
            <span className="text-sm opacity-90">نقاط التقدم</span>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs opacity-75 mt-1">قريباً - نظام النقاط</p>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Icon
              icon="solar:clock-circle-bold"
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            مميزات قادمة قريباً
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <Icon
                icon="solar:chart-2-bold"
                className="w-5 h-5 text-green-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                إحصائيات مفصلة للأداء والتقدم
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <Icon
                icon="solar:calendar-bold"
                className="w-5 h-5 text-purple-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                تتبع الجدول الزمني والمواعيد
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <Icon
                icon="solar:medal-bold"
                className="w-5 h-5 text-yellow-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                شهادات وإنجازات المستخدم
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <Icon
                icon="solar:settings-bold"
                className="w-5 h-5 text-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                إعدادات متقدمة للتخصيص
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            🚀 نحن نعمل باستمرار على إضافة مميزات جديدة لتحسين تجربتك في المنصة
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverviewTab;
