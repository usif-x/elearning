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
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            جاري تحميل البيانات...
          </span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="solar:user-cross-bold"
              className="w-10 h-10 text-red-600 dark:text-red-400"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            المشرف غير موجود
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            لم يتم العثور على المشرف المطلوب
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
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
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                <Icon
                  icon="solar:user-edit-bold"
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                تعديل المشرف
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              تعديل بيانات المشرف: <span className="font-semibold text-gray-700 dark:text-gray-300">{admin.name}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Update Profile Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Icon
                  icon="solar:user-bold"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                تعديل البيانات
              </h2>
            </div>

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

                {/* Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    مستوى الصلاحيات <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      handleChange("level", Number(e.target.value))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                  >
                    <option value={1}>مستوى 1 - أساسي</option>
                    <option value={2}>مستوى 2 - متوسط</option>
                    <option value={3}>مستوى 3 - متقدم</option>
                    <option value={999}>مستوى 999 - سوبر أدمن</option>
                  </select>
                </div>
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
                      يمكن للمشرف تسجيل الدخول
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
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
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
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reset Password */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                  <Icon
                    icon="solar:lock-password-bold"
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  إعادة تعيين كلمة المرور
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="8 أحرف على الأقل"
                    minLength={8}
                  />
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={
                    resetLoading || !newPassword.trim() || newPassword.length < 8
                  }
                  className="w-full px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                      جاري...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:lock-password-bold" className="w-5 h-5" />
                      إعادة التعيين
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Admin Info */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <Icon
                    icon="solar:info-circle-bold"
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  معلومات المشرف
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">
                    تاريخ الإنشاء:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(admin.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">
                    آخر تحديث:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(admin.updated_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400">
                    المعرف:
                  </span>
                  <span className="text-gray-900 dark:text-white font-mono text-xs">
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
