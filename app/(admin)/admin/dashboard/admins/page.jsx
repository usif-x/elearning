"use client";

import { deleteAdmin, listAdmins } from "@/services/admin/Admin";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchAdmins();
  }, [currentPage]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await listAdmins(currentPage, pageSize);
      setAdmins(res.admins || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (admin) => {
    if (!confirm(`هل أنت متأكد من حذف المشرف ${admin.name}؟`)) return;
    setDeleteLoading(admin.id);
    try {
      await deleteAdmin(admin.id);
      fetchAdmins();
    } catch (err) {
      console.error("Error deleting admin:", err);
      alert("حدث خطأ أثناء حذف المشرف");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getLevelBadge = (level) => {
    if (level >= 999) {
      return (
        <span className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-100 dark:border-purple-800">
          سوبر أدمن
        </span>
      );
    } else if (level >= 3) {
      return (
        <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-800">
          متقدم
        </span>
      );
    } else if (level >= 2) {
      return (
        <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-800">
          متوسط
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold border border-gray-200 dark:border-gray-600">
        أساسي
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            جاري تحميل المشرفين...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                إدارة المشرفين
              </h1>
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800">
                {total} مشرف
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              قائمة المشرفين في النظام وإدارة صلاحياتهم
            </p>
          </div>
          <Link
            href="/admin/dashboard/admins/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5"
          >
            <Icon icon="solar:user-plus-bold" className="w-5 h-5" />
            إضافة مشرف
          </Link>
        </div>

        {/* Admins Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {admins.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                لا توجد مشرفين
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                ابدأ بإضافة مشرف جديد للنظام
              </p>
              <Link
                href="/admin/dashboard/admins/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transform hover:-translate-y-1 transition-all"
              >
                <Icon icon="solar:user-plus-bold" className="w-6 h-6" />
                إضافة المشرف الأول
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                      #
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                      المشرف
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                      اسم المستخدم
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                      المستوى
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {admins.map((admin, idx) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                            <Icon
                              icon="solar:user-bold"
                              className="w-5 h-5 text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {admin.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {admin.username}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {admin.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getLevelBadge(admin.level)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Link
                            href={`/admin/dashboard/admins/${admin.id}`}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="عرض"
                          >
                            <Icon icon="solar:eye-bold" className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/dashboard/admins/${admin.id}/edit`}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                            title="تعديل"
                          >
                            <Icon icon="solar:pen-bold" className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(admin)}
                            disabled={deleteLoading === admin.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
                            title="حذف"
                          >
                            {deleteLoading === admin.id ? (
                              <Icon
                                icon="svg-spinners:ring-resize"
                                className="w-5 h-5"
                              />
                            ) : (
                              <Icon
                                icon="solar:trash-bin-trash-bold"
                                className="w-5 h-5"
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              إجمالي المشرفين: <span className="font-bold text-gray-900 dark:text-white">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                الأول
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <span className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * pageSize >= total}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminsPage;
