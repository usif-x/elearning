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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
            العودة
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Icon
                icon="solar:user-plus-bold"
                className="w-6 h-6 text-white"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                إضافة مشرف جديد
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                إنشاء حساب مشرف جديد في النظام
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="أدخل الاسم الكامل"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                اسم المستخدم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                كلمة المرور <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="أدخل كلمة المرور"
                required
                minLength={8}
              />
            </div>

            {/* Telegram ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                معرف التليجرام
              </label>
              <input
                type="text"
                value={formData.telegram_id}
                onChange={(e) => handleChange("telegram_id", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="أدخل معرف التليجرام (اختياري)"
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                مستوى الصلاحيات <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleChange("level", Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
              >
                <option value={1}>مستوى 1 - أساسي</option>
                <option value={2}>مستوى 2 - متوسط</option>
                <option value={3}>مستوى 3 - متقدم</option>
                <option value={999}>مستوى 999 - سوبر أدمن</option>
              </select>
            </div>

            {/* Is Verified */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/60 rounded-xl">
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    حساب مفعل
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    يمكن للمشرف تسجيل الدخول فوراً
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange("is_verified", !formData.is_verified)
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.is_verified
                    ? "bg-green-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.is_verified ? "right-0.5" : "right-6"
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.name ||
                  !formData.username ||
                  !formData.email ||
                  !formData.password
                }
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminPage;
