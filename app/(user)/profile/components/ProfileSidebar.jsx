import { Icon } from "@iconify/react";
import Image from "next/image";

const ProfileSidebar = ({ user, profileTabs, activeTab, setActiveTab }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden lg:sticky lg:top-24">
      {/* User Info Card */}
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-4 sm:p-6 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-4 border-white/30 mb-3 sm:mb-4">
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
                <Icon
                  icon="solar:user-bold"
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold mb-1">
            {user?.display_name || user?.full_name || "مستخدم"}
          </h2>

          {user?.phone_number && (
            <p className="text-xs sm:text-sm opacity-90 mb-2">
              {user.phone_number}
            </p>
          )}

          {user?.status && (
            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm">
              {user.status === "student" ? "طالب" : user.status}
            </span>
          )}
        </div>

        {/* Verification Badges */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20">
          <div className="flex items-center gap-1">
            <Icon
              icon={
                user?.is_verified
                  ? "solar:verified-check-bold"
                  : "solar:verified-close-bold"
              }
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                user?.is_verified ? "text-green-300" : "text-red-300"
              }`}
            />
            <span className="text-[10px] sm:text-xs">
              {user?.is_verified ? "موثق" : "غير موثق"}
            </span>
          </div>
          {user?.telegram_verified && (
            <div className="flex items-center gap-1">
              <Icon
                icon="bxl:telegram"
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300"
              />
              <span className="text-[10px] sm:text-xs">تيليجرام</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-300 text-sm sm:text-base ${
              activeTab === tab.id
                ? "bg-sky-500 text-white shadow-lg"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Icon
              icon={tab.icon}
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
            />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileSidebar;
