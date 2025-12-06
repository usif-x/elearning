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
      <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-sky-200 bg-clip-text text-transparent mb-4">
          المعلومات الشخصية
        </h2>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center animate-in zoom-in duration-700">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 rounded-2xl mb-4 shadow-lg">
              <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl animate-pulse"></div>
              <Icon
                icon="solar:user-id-bold-duotone"
                className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-pulse relative z-10"
              />
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-400 animate-pulse">
              ⏳ جاري تحميل البيانات...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 dark:from-sky-900/20 dark:via-blue-900/20 dark:to-sky-900/20 p-4 sm:p-6 rounded-2xl border-2 border-sky-200/60 dark:border-sky-700 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-sky-600 p-3 rounded-xl shadow-lg">
            <Icon
              icon="solar:user-id-bold-duotone"
              className="w-7 h-7 text-white"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-sky-200 bg-clip-text text-transparent">
            المعلومات الشخصية
          </h2>
        </div>
        <button
          onClick={loadUserProfile}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Icon icon="solar:refresh-bold" className="w-5 h-5" />
          تحديث البيانات
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4 animate-in fade-in slide-in-from-left-3 duration-500">
          <div className="flex items-center gap-3 border-b-2 border-sky-200 dark:border-sky-700 pb-3">
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2 rounded-lg">
              <Icon
                icon="solar:user-bold-duotone"
                className="w-5 h-5 text-white"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-sky-200 bg-clip-text text-transparent">
              المعلومات الأساسية
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group bg-gradient-to-br from-white via-white to-sky-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-100/20 to-transparent dark:from-sky-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-sky-100 dark:bg-sky-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:user-bold-duotone"
                    className="w-5 h-5 text-sky-600 dark:text-sky-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    الاسم الكامل
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {user?.full_name || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:tag-bold-duotone"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    الاسم المعروض
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {user?.display_name || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-green-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-transparent dark:from-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:letter-bold-duotone"
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    البريد الإلكتروني
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {user?.email || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:phone-bold-duotone"
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    رقم الهاتف
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {user?.phone_number || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-orange-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent dark:from-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:phone-calling-bold-duotone"
                    className="w-5 h-5 text-orange-600 dark:text-orange-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    رقم هاتف الوالد
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {user?.parent_phone_number || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:diploma-bold-duotone"
                    className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    النوع
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {user?.status === "student"
                      ? "🎓 طالب"
                      : user?.status === "teacher"
                      ? "👨‍🏫 معلم"
                      : "غير محدد"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-500 delay-100">
          <div className="flex items-center gap-3 border-b-2 border-green-200 dark:border-green-700 pb-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
              <Icon
                icon="solar:shield-check-bold-duotone"
                className="w-5 h-5 text-white"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-green-900 dark:from-white dark:to-emerald-200 bg-clip-text text-transparent">
              حالة الحساب
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`group bg-gradient-to-br from-white via-white ${
                user?.is_active ? "to-green-50/30" : "to-red-50/30"
              } dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 ${
                user?.is_active
                  ? "border-green-200/60 hover:border-green-300"
                  : "border-red-200/60 hover:border-red-300"
              } dark:border-gray-700 transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  user?.is_active ? "from-green-100/20" : "from-red-100/20"
                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`${
                      user?.is_active
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    } p-2 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon
                      icon={
                        user?.is_active
                          ? "solar:verified-check-bold-duotone"
                          : "solar:close-circle-bold-duotone"
                      }
                      className={`w-5 h-5 ${
                        user?.is_active
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                      الحساب نشط
                    </label>
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {user?.is_active ? "✅ نعم" : "❌ لا"}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full ${
                    user?.is_active
                      ? "bg-green-500 shadow-green-500/50"
                      : "bg-red-500 shadow-red-500/50"
                  } shadow-lg ${user?.is_active ? "animate-pulse" : ""}`}
                ></div>
              </div>
            </div>

            <div
              className={`group bg-gradient-to-br from-white via-white ${
                user?.is_verified ? "to-blue-50/30" : "to-gray-50/30"
              } dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 ${
                user?.is_verified
                  ? "border-blue-200/60 hover:border-blue-300"
                  : "border-gray-200/60 hover:border-gray-300"
              } dark:border-gray-700 transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  user?.is_verified ? "from-blue-100/20" : "from-gray-100/20"
                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`${
                      user?.is_verified
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    } p-2 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon
                      icon={
                        user?.is_verified
                          ? "solar:shield-check-bold-duotone"
                          : "solar:shield-warning-bold-duotone"
                      }
                      className={`w-5 h-5 ${
                        user?.is_verified
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                      موثق
                    </label>
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {user?.is_verified ? "✅ نعم" : "⚠️ لا"}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full ${
                    user?.is_verified
                      ? "bg-blue-500 shadow-blue-500/50"
                      : "bg-gray-500 shadow-gray-500/50"
                  } shadow-lg ${user?.is_verified ? "animate-pulse" : ""}`}
                ></div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-yellow-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-yellow-200/60 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 to-transparent dark:from-yellow-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:wallet-bold-duotone"
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    رصيد المحفظة
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">
                    💰{" "}
                    {user?.wallet_balance
                      ? `${user.wallet_balance} جنيه`
                      : "0 جنيه"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Information */}
        <div className="space-y-4 animate-in fade-in slide-in-from-left-3 duration-500 delay-200">
          <div className="flex items-center gap-3 border-b-2 border-cyan-200 dark:border-cyan-700 pb-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
              <Icon
                icon="solar:chat-round-bold-duotone"
                className="w-5 h-5 text-white"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-cyan-900 dark:from-white dark:to-cyan-200 bg-clip-text text-transparent">
              معلومات تيليجرام
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group bg-gradient-to-br from-white via-white to-cyan-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/20 to-transparent dark:from-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:hashtag-bold-duotone"
                    className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    معرف تيليجرام
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {user?.telegram_id || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:mention-circle-bold-duotone"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    اسم المستخدم
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {user?.telegram_username
                      ? `@${user.telegram_username}`
                      : "غير محدد"}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-teal-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-100/20 to-transparent dark:from-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:user-id-bold-duotone"
                    className="w-5 h-5 text-teal-600 dark:text-teal-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    الاسم الأول
                  </label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
                    {user?.telegram_first_name || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`group bg-gradient-to-br from-white via-white ${
                user?.telegram_verified ? "to-blue-50/30" : "to-gray-50/30"
              } dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 ${
                user?.telegram_verified
                  ? "border-blue-200/60 hover:border-blue-300"
                  : "border-gray-200/60 hover:border-gray-300"
              } dark:border-gray-700 transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  user?.telegram_verified
                    ? "from-blue-100/20"
                    : "from-gray-100/20"
                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`${
                      user?.telegram_verified
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    } p-2 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon
                      icon={
                        user?.telegram_verified
                          ? "solar:shield-check-bold-duotone"
                          : "solar:shield-warning-bold-duotone"
                      }
                      className={`w-5 h-5 ${
                        user?.telegram_verified
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                      موثق عبر تيليجرام
                    </label>
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {user?.telegram_verified ? "✅ نعم" : "⚠️ لا"}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full ${
                    user?.telegram_verified
                      ? "bg-blue-500 shadow-blue-500/50"
                      : "bg-gray-500 shadow-gray-500/50"
                  } shadow-lg ${
                    user?.telegram_verified ? "animate-pulse" : ""
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Activity */}
        <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-500 delay-300">
          <div className="flex items-center gap-3 border-b-2 border-violet-200 dark:border-violet-700 pb-3">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-lg">
              <Icon
                icon="solar:history-bold-duotone"
                className="w-5 h-5 text-white"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-violet-900 dark:from-white dark:to-violet-200 bg-clip-text text-transparent">
              نشاط الحساب
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:calendar-add-bold-duotone"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    📅 تاريخ التسجيل
                  </label>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
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
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-green-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-transparent dark:from-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:clock-circle-bold-duotone"
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    🕐 آخر نشاط
                  </label>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
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
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:refresh-circle-bold-duotone"
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    🔄 آخر تحديث
                  </label>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
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
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white via-white to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-xl border-2 border-gray-200/60 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon
                      icon="solar:login-3-bold-duotone"
                      className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    🔐 طرق تسجيل الدخول
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mr-11">
                  {user?.login_methods && user.login_methods.length > 0 ? (
                    user.login_methods.map((method, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs sm:text-sm font-bold border border-indigo-200 dark:border-indigo-700 hover:scale-105 transition-transform duration-200"
                      >
                        {method === "email"
                          ? "📧 البريد"
                          : method === "phone"
                          ? "📱 الهاتف"
                          : method === "telegram"
                          ? "💬 تيليجرام"
                          : method}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      غير محدد
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
