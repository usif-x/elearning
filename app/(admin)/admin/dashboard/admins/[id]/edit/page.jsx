"use client";

import {
  getAdmin,
  resetAdminPassword,
  updateAdmin,
} from "@/services/admin/Admin";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditAdminPage = () => {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    telegram_id: "",
    level: 1,
    is_verified: true,
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchAdmin();
  }, [adminId]);

  const fetchAdmin = async () => {
    try {
      const response = await getAdmin(adminId);
      setAdmin(response);
      setFormData({
        name: response.name || "",
        username: response.username || "",
        email: response.email || "",
        telegram_id: response.telegram_id || "",
        level: response.level || 1,
        is_verified: response.is_verified || false,
      });
    } catch (error) {
      console.error("Error fetching admin:", error);
      alert("حدث خطأ أثناء تحميل بيانات المشرف");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdmin(adminId, formData);
      alert("تم تحديث المشرف بنجاح");
      router.push("/admin/dashboard/admins");
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("حدث خطأ أثناء تحديث المشرف");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      alert("يرجى إدخال كلمة مرور جديدة");
      return;
    }
    if (newPassword.length < 8) {
      alert("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setResetLoading(true);
    try {
      await resetAdminPassword(adminId, newPassword);
      alert("تم إعادة تعيين كلمة المرور بنجاح");
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("حدث خطأ أثناء إعادة تعيين كلمة المرور");
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon
            icon="solar:user-bold"
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            المشرف غير موجود
          </h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Icon
                icon="solar:user-edit-bold"
                className="w-6 h-6 text-white"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                تعديل المشرف
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                تعديل بيانات المشرف: {admin.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Update Profile Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon
                icon="solar:user-bold"
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                تعديل البيانات
              </h2>
            </div>

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
                  onChange={(e) =>
                    handleChange("level", Number(e.target.value))
                  }
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
                      يمكن للمشرف تسجيل الدخول
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
              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Reset Password */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon
                icon="solar:lock-password-bold"
                className="w-5 h-5 text-red-600 dark:text-red-400"
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                إعادة تعيين كلمة المرور
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  كلمة المرور الجديدة <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="أدخل كلمة مرور جديدة"
                  minLength={8}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  كلمة المرور يجب أن تكون 8 أحرف على الأقل
                </p>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={
                  resetLoading || !newPassword.trim() || newPassword.length < 8
                }
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {resetLoading ? (
                  <>
                    <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                    جاري إعادة التعيين...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:lock-password-bold" className="w-5 h-5" />
                    إعادة تعيين كلمة المرور
                  </>
                )}
              </button>
            </div>

            {/* Admin Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                معلومات المشرف
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    تاريخ الإنشاء:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(admin.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    آخر تحديث:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(admin.updated_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    المعرف:
                  </span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {admin.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAdminPage;
