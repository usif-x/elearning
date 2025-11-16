const PersonalInfoTab = ({ user }) => {
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
};

export default PersonalInfoTab;
