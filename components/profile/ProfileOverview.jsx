// components/profile/ProfileOverview.jsx
import { Icon } from "@iconify/react";

const ProfileOverview = ({ user, onNavigate }) => {
  const stats = [
    {
      label: "الدورات المكتملة",
      value: "12",
      icon: "solar:bookmark-check-bold",
      color: "green",
    },
    {
      label: "الدورات الجارية",
      value: "3",
      icon: "solar:play-circle-bold",
      color: "blue",
    },
    {
      label: "ساعات التعلم",
      value: "45",
      icon: "solar:clock-circle-bold",
      color: "purple",
    },
    {
      label: "الشهادات",
      value: "8",
      icon: "solar:medal-ribbon-bold",
      color: "yellow",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white/20">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon icon="solar:user-bold" className="w-10 h-10" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          مرحباً، {user?.display_name || user?.full_name}
        </h2>
        <p className="text-blue-100">استمر في رحلة التعلم وحقق أهدافك</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900 flex items-center justify-center mb-3`}
            >
              <Icon
                icon={stat.icon}
                className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate("profile_analytics")}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform transition-colors">
            <Icon
              icon="solar:chart-bold"
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              إحصائياتي
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تتبع تقدمك ونشاطك
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("profile_information")}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:scale-110 transition-transform transition-colors">
            <Icon
              icon="solar:user-id-bold"
              className="w-6 h-6 text-green-600 dark:text-green-400"
            />
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              معلوماتي الشخصية
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              إدارة بياناتك الشخصية
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("profile_security")}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center group-hover:scale-110 transition-transform transition-colors">
            <Icon
              icon="solar:shield-check-bold"
              className="w-6 h-6 text-red-600 dark:text-red-400"
            />
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              الأمان والخصوصية
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              حماية حسابك
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

// components/profile/ProfileAnalyticsManage.jsx
const ProfileAnalyticsManage = ({ user }) => {
  const learningData = [
    { month: "يناير", hours: 20 },
    { month: "فبراير", hours: 35 },
    { month: "مارس", hours: 28 },
    { month: "أبريل", hours: 42 },
    { month: "مايو", hours: 38 },
    { month: "يونيو", hours: 45 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon icon="solar:chart-bold" className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          إحصائيات التعلم
        </h2>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <Icon icon="solar:time-bold" className="w-8 h-8 mb-4" />
          <h3 className="text-3xl font-bold">156</h3>
          <p className="text-blue-100">ساعة تعلم</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
          <Icon icon="solar:bookmark-check-bold" className="w-8 h-8 mb-4" />
          <h3 className="text-3xl font-bold">24</h3>
          <p className="text-green-100">دورة مكتملة</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <Icon icon="solar:medal-ribbon-bold" className="w-8 h-8 mb-4" />
          <h3 className="text-3xl font-bold">18</h3>
          <p className="text-purple-100">شهادة حصلت عليها</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <Icon icon="solar:star-bold" className="w-8 h-8 mb-4" />
          <h3 className="text-3xl font-bold">4.8</h3>
          <p className="text-orange-100">متوسط التقييم</p>
        </div>
      </div>

      {/* Learning Progress Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          تقدم التعلم الشهري
        </h3>
        <div className="h-64 flex items-end gap-4 justify-between">
          {learningData.map((data, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-12 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                style={{ height: `${(data.hours / 50) * 200}px` }}
              ></div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {data.month}
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {data.hours}س
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// components/profile/ProfileInformationManage.jsx
const ProfileInformationManage = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    display_name: user?.display_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    parent_phone_number: user?.parent_phone_number || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call API to update user info
    onUpdate(formData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon icon="solar:user-id-bold" className="w-8 h-8 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          معلوماتي الشخصية
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسم العرض
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
};

export { ProfileAnalyticsManage, ProfileInformationManage, ProfileOverview };
