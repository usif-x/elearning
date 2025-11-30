"use client";

import { createAdmin } from "@/services/admin/Admin";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CreateAdminPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    telegram_id: "",
    level: 1,
    is_verified: true,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAdmin(formData);
      router.push("/admin/dashboard/admins");
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("حدث خطأ أثناء إنشاء المشرف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <Icon
              icon="solar:arrow-right-bold"
              className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Icon
                  icon="solar:user-plus-bold"
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                إضافة مشرف جديد
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              إنشاء حساب مشرف جديد في النظام
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="أدخل الاسم الكامل"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  اسم المستخدم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="أدخل كلمة المرور"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  8 أحرف على الأقل
                </p>
              </div>

              {/* Telegram ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  معرف التليجرام
                </label>
                <input
                  type="text"
                  value={formData.telegram_id}
                  onChange={(e) => handleChange("telegram_id", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="اختياري"
                />
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                مستوى الصلاحيات <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleChange("level", Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
              >
                <option value={1}>مستوى 1 - أساسي</option>
                <option value={2}>مستوى 2 - متوسط</option>
                <option value={3}>مستوى 3 - متقدم</option>
                <option value={999}>مستوى 999 - سوبر أدمن</option>
              </select>
            </div>

            {/* Is Verified */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    حساب مفعل
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    يمكن للمشرف تسجيل الدخول فوراً
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange("is_verified", !formData.is_verified)
                }
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.is_verified
                    ? "bg-emerald-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    formData.is_verified ? "right-0.5" : "right-7"
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.name ||
                    !formData.username ||
                    !formData.email ||
                    !formData.password
                  }
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:user-plus-bold" className="w-5 h-5" />
                      إنشاء المشرف
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminPage;
