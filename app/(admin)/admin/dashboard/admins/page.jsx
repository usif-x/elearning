"use client";

import { deleteAdmin, listAdmins } from "@/services/admin/Admin";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إدارة المشرفين
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            قائمة المشرفين في النظام
          </p>
        </div>
        <Link
          href="/admin/dashboard/admins/create"
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg"
        >
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          إضافة مشرف
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {admins.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              icon="solar:user-bold"
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد مشرفين
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ابدأ بإضافة مشرف جديد
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    #
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    الاسم
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    اسم المستخدم
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    البريد
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    المستوى
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {admins.map((admin, idx) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-6 py-4">{admin.name}</td>
                    <td className="px-6 py-4">{admin.username}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">{admin.level}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Link
                        href={`/admin/dashboard/admins/${admin.id}`}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="عرض"
                      >
                        <Icon icon="solar:eye-bold" className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/dashboard/admins/${admin.id}/edit`}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Icon icon="solar:pen-bold" className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={deleteLoading === admin.id}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple pagination controls (if needed) */}
      {total > pageSize && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            إجمالي المشرفين: {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              الأول
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              السابق
            </button>
            <span className="px-3 py-2">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsPage;
