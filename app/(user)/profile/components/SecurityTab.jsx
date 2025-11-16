import { Icon } from "@iconify/react";

const SecurityTab = ({ user }) => {
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
};

export default SecurityTab;
