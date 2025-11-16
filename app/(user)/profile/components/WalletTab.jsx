import { Icon } from "@iconify/react";

const WalletTab = ({ user }) => {
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
};

export default WalletTab;
