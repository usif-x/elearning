"use client";

import { deleteData, getData, patchData, postData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2"; // Optional: for nice alerts, or use standard alert()

export default function NotificationsManager() {
  // --- State ---
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ skip: 0, limit: 10 });
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    is_active: true,
  });

  // --- Constants ---
  const NOTIFICATION_TYPES = [
    {
      value: "info",
      label: "معلومة (Info)",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "success",
      label: "نجاح (Success)",
      color: "bg-green-100 text-green-700",
    },
    {
      value: "warning",
      label: "تحذير (Warning)",
      color: "bg-yellow-100 text-yellow-700",
    },
    { value: "error", label: "خطأ (Error)", color: "bg-red-100 text-red-700" },
  ];

  // --- Actions ---

  // 1. Fetch Notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getData(
        `/notifications/?skip=${pagination.skip}&limit=${pagination.limit}`,
        true // auth=true
      );
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pagination.skip]);

  // 2. Handle Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.title || !formData.message) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      if (editingId) {
        // UPDATE (PATCH)
        await patchData(`/notifications/${editingId}`, formData, true);
        Swal.fire("تم التحديث!", "تم تعديل الإشعار بنجاح", "success");
      } else {
        // CREATE (POST)
        await postData("/notifications/", formData, true);
        Swal.fire("تم الإنشاء!", "تم إضافة الإشعار بنجاح", "success");
      }

      closeModal();
      fetchNotifications();
    } catch (error) {
      console.error("Operation failed:", error);
      Swal.fire("خطأ", "حدث خطأ أثناء تنفيذ العملية", "error");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await deleteData(`/notifications/${id}`, true);
        Swal.fire("تم الحذف!", "تم حذف الإشعار.", "success");
        fetchNotifications();
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("خطأ", "فشل حذف الإشعار", "error");
      }
    }
  };

  // --- Helpers ---
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: "", message: "", type: "info", is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (notif) => {
    setEditingId(notif.id);
    setFormData({
      title: notif.title,
      message: notif.message,
      type: notif.type,
      is_active: notif.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handlePageChange = (direction) => {
    setPagination((prev) => ({
      ...prev,
      skip: Math.max(0, prev.skip + direction * prev.limit),
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Icon
              icon="solar:bell-bing-bold-duotone"
              className="text-blue-500"
            />
            إدارة الإشعارات
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            إنشاء وإدارة إشعارات النظام للمستخدمين
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          إشعار جديد
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Icon
              icon="solar:loading-bold-duotone"
              className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3"
            />
            <p className="text-gray-500">جاري التحميل...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Icon
              icon="solar:bell-off-bold-duotone"
              className="w-16 h-16 text-gray-300 mx-auto mb-3"
            />
            <p className="text-gray-500">لا توجد إشعارات مضافة حتى الآن</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">العنوان</th>
                  <th className="px-6 py-4">الرسالة</th>
                  <th className="px-6 py-4">النوع</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notif) => (
                  <tr
                    key={notif.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {notif.title}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {notif.message}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          NOTIFICATION_TYPES.find((t) => t.value === notif.type)
                            ?.color || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {notif.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {notif.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          غير نشط
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(notif)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Icon
                            icon="solar:pen-new-square-bold-duotone"
                            className="w-5 h-5"
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Icon
                            icon="solar:trash-bin-trash-bold-duotone"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={pagination.skip === 0}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            السابق
          </button>
          <span className="text-sm text-gray-500">
            عرض {pagination.skip + 1} - {pagination.skip + notifications.length}
          </span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={notifications.length < pagination.limit}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            التالي
          </button>
        </div>
      </div>

      {/* Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingId ? "تعديل الإشعار" : "إشعار جديد"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="عنوان الإشعار..."
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الرسالة
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="نص الرسالة..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    النوع
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {NOTIFICATION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Is Active */}
                <div className="flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                      تفعيل الإشعار
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors"
                >
                  {editingId ? "حفظ التعديلات" : "إرسال الإشعار"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
