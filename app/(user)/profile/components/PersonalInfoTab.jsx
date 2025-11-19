import { getCurrentUserProfile } from "@/services/User";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const PersonalInfoTab = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const userData = await getCurrentUserProfile();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Fallback to initial user data if API fails
      setUser(initialUser);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          المعلومات الشخصية
        </h2>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Icon
                icon="solar:user-id-bold"
                className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              جاري تحميل البيانات...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          المعلومات الشخصية
        </h2>
        <button
          onClick={loadUserProfile}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Icon icon="solar:refresh-bold" className="w-4 h-4" />
          تحديث
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            المعلومات الأساسية
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                رقم هاتف الوالد
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.parent_phone_number || "غير محدد"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                النوع
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.status === "student"
                  ? "طالب"
                  : user?.status === "teacher"
                  ? "معلم"
                  : "غير محدد"}
              </p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            حالة الحساب
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  الحساب نشط
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.is_active ? "نعم" : "لا"}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  user?.is_active ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  موثق
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.is_verified ? "نعم" : "لا"}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  user?.is_verified ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                رصيد المحفظة
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.wallet_balance
                  ? `${user.wallet_balance} جنيه`
                  : "0 جنيه"}
              </p>
            </div>
          </div>
        </div>

        {/* Telegram Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            معلومات تيليجرام
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                معرف تيليجرام
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.telegram_id || "غير محدد"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                اسم المستخدم
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.telegram_username
                  ? `@${user.telegram_username}`
                  : "غير محدد"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                الاسم الأول
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.telegram_first_name || "غير محدد"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  موثق عبر تيليجرام
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.telegram_verified ? "نعم" : "لا"}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  user?.telegram_verified ? "bg-blue-500" : "bg-gray-500"
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Account Activity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            نشاط الحساب
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                تاريخ التسجيل
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "غير محدد"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                آخر نشاط
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.last_login
                  ? new Date(user.last_login).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "غير محدد"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                آخر تحديث
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user?.updated_at
                  ? new Date(user.updated_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "غير محدد"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                طرق تسجيل الدخول
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.login_methods?.map((method, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-sm"
                  >
                    {method === "email"
                      ? "البريد الإلكتروني"
                      : method === "phone"
                      ? "الهاتف"
                      : method === "telegram"
                      ? "تيليجرام"
                      : method}
                  </span>
                )) || "غير محدد"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
