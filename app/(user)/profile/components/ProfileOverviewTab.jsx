import { Icon } from "@iconify/react";

const ProfileOverviewTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          نظرة عامة على الحساب
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          مرحباً بك في ملفك الشخصي، {user?.display_name || user?.full_name}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <Icon icon="solar:wallet-bold" className="w-12 h-12" />
            <span className="text-sm opacity-90">الرصيد المتاح</span>
          </div>
          <p className="text-3xl font-bold">{user?.wallet_balance || 0} ج.م</p>
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
};

export default ProfileOverviewTab;
