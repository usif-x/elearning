"use client";

import { getAdmin } from "@/services/admin/Admin";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AdminDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id;

  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    fetchAdmin();
  }, [adminId]);

  const fetchAdmin = async () => {
    try {
      const response = await getAdmin(adminId);
      setAdmin(response);
    } catch (error) {
      console.error("Error fetching admin:", error);
      alert("حدث خطأ أثناء تحميل بيانات المشرف");
    } finally {
      setLoading(false);
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

  const getLevelBadge = (level) => {
    switch (level) {
      case 999:
        return {
          text: "سوبر أدمن",
          color: "from-red-500 to-pink-600",
          icon: "solar:crown-bold",
        };
      case 3:
        return {
          text: "متقدم",
          color: "from-purple-500 to-indigo-600",
          icon: "solar:shield-bold",
        };
      case 2:
        return {
          text: "متوسط",
          color: "from-blue-500 to-cyan-600",
          icon: "solar:star-bold",
        };
      default:
        return {
          text: "أساسي",
          color: "from-gray-500 to-slate-600",
          icon: "solar:user-bold",
        };
    }
  };

  const levelInfo = getLevelBadge(admin.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
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
              <Icon icon="solar:user-bold" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                تفاصيل المشرف
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                عرض معلومات المشرف: {admin.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="solar:user-bold"
                    className="w-10 h-10 text-white"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {admin.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  @{admin.username}
                </p>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium bg-gradient-to-r ${levelInfo.color}`}
                >
                  <Icon icon={levelInfo.icon} className="w-4 h-4" />
                  {levelInfo.text}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href={`/admin/dashboard/admins/${admin.id}/edit`}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Icon icon="solar:pen-bold" className="w-5 h-5" />
                  تعديل المشرف
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                  حذف المشرف
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Icon
                  icon="solar:info-circle-bold"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  المعلومات الأساسية
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    الاسم الكامل
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {admin.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    اسم المستخدم
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    @{admin.username}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    البريد الإلكتروني
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {admin.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    معرف التليجرام
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {admin.telegram_id || "غير محدد"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    مستوى الصلاحيات
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${levelInfo.color}`}
                  >
                    <Icon icon={levelInfo.icon} className="w-4 h-4" />
                    {levelInfo.text}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    حالة الحساب
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      admin.is_verified
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    <Icon
                      icon={
                        admin.is_verified
                          ? "solar:check-circle-bold"
                          : "solar:close-circle-bold"
                      }
                      className="w-4 h-4"
                    />
                    {admin.is_verified ? "مفعل" : "غير مفعل"}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Icon
                  icon="solar:calendar-bold"
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  معلومات الحساب
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    تاريخ الإنشاء
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(admin.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    آخر تحديث
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(admin.updated_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    معرف المشرف
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    {admin.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Icon
                  icon="solar:settings-bold"
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  الإجراءات
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href={`/admin/dashboard/admins/${admin.id}/edit`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Icon icon="solar:pen-bold" className="w-5 h-5" />
                  <span className="font-medium">تعديل البيانات</span>
                </Link>

                <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <Icon icon="solar:lock-password-bold" className="w-5 h-5" />
                  <span className="font-medium">إعادة تعيين كلمة المرور</span>
                </button>

                <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                  <Icon icon="solar:shield-cross-bold" className="w-5 h-5" />
                  <span className="font-medium">إلغاء تفعيل الحساب</span>
                </button>

                <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                  <span className="font-medium">حذف المشرف</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetailsPage;
