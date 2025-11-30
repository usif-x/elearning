"use client";

import {
  deleteUser,
  getUsers,
  updateUser,
  updateUserActivation,
  updateUserStatus,
} from "@/services/admin/User";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Helper to generate initials for Avatar
const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function UsersManagementPage() {
  // --- State Management ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Data Fetching ---
  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pagination.pageSize,
        search: search || undefined,
      };

      const response = await getUsers(params);
      setUsers(response.users || []);
      setTotalPages(response.total_pages || 0);
      setTotalUsers(response.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("حدث خطأ أثناء تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.pageIndex + 1, globalFilter);
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (globalFilter !== undefined) {
        fetchUsers(1, globalFilter);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [globalFilter]);

  // --- Actions Handlers ---

  // 1. Activation Toggle
  const handleToggleActivation = async (userId, currentStatus) => {
    try {
      const result = await Swal.fire({
        title: currentStatus ? "إلغاء تفعيل المستخدم؟" : "تفعيل المستخدم؟",
        text: currentStatus
          ? "سيتم منع المستخدم من تسجيل الدخول"
          : "سيتم السماح للمستخدم بتسجيل الدخول",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: currentStatus ? "#d33" : "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: currentStatus
          ? "نعم، عطل الحساب"
          : "نعم، فعل الحساب",
        cancelButtonText: "تراجع",
        customClass: { popup: "font-arabic" },
      });

      if (result.isConfirmed) {
        await updateUserActivation(userId, !currentStatus);
        toast.success(
          currentStatus ? "تم إلغاء تفعيل المستخدم" : "تم تفعيل المستخدم"
        );
        fetchUsers(pagination.pageIndex + 1, globalFilter);
      }
    } catch (error) {
      console.error("Error updating user activation:", error);
      toast.error("فشل تحديث حالة التفعيل");
    }
  };

  // 2. Update Role/Status
  const handleUpdateStatus = async (userId, currentStatus) => {
    try {
      const { value: newStatus } = await Swal.fire({
        title: "تغيير صلاحية المستخدم",
        input: "select",
        inputOptions: {
          student: "طالب (Student)",
          teacher: "مدرس (Teacher)",
          admin: "مدير (Admin)",
          moderator: "مشرف (Moderator)",
        },
        inputValue: currentStatus,
        showCancelButton: true,
        confirmButtonText: "حفظ التغيير",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#3b82f6",
      });

      if (newStatus && newStatus !== currentStatus) {
        await updateUserStatus(userId, newStatus);
        toast.success("تم تحديث الصلاحية بنجاح");
        fetchUsers(pagination.pageIndex + 1, globalFilter);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("فشل تحديث الصلاحية");
    }
  };

  // 3. Delete User
  const handleDeleteUser = async (userId, userName) => {
    try {
      const result = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: `سيتم حذف المستخدم "${userName}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`,
        icon: "error",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "حذف نهائي",
        cancelButtonText: "إلغاء",
      });

      if (result.isConfirmed) {
        await deleteUser(userId);
        toast.success("تم حذف المستخدم بنجاح");
        fetchUsers(pagination.pageIndex + 1, globalFilter);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("فشل حذف المستخدم");
    }
  };

  // 4. Edit User
  const handleEditClick = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const payload = {
        full_name: editingUser.full_name,
        email: editingUser.email,
        phone_number: editingUser.phone_number,
        telegram_id: editingUser.telegram_id,
      };

      await updateUser(editingUser.id, payload);
      toast.success("تم تحديث بيانات المستخدم بنجاح");
      setIsEditModalOpen(false);
      fetchUsers(pagination.pageIndex + 1, globalFilter);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Table Configuration ---
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 60,
        cell: ({ getValue }) => (
          <span
            className="text-xs font-mono text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(getValue());
              toast.info("تم نسخ المعرف");
            }}
            title="اضغط للنسخ"
          >
            #{getValue()}
          </span>
        ),
      },
      {
        accessorKey: "full_name",
        header: "المستخدم",
        cell: ({ row }) => {
          const name = row.original.full_name || "مستخدم غير معروف";
          const email = row.original.email;
          return (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shadow-sm border border-blue-100 dark:border-blue-800">
                {getInitials(name)}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone_number",
        header: "معلومات الاتصال",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Icon icon="solar:phone-calling-linear" className="w-4 h-4 text-gray-400" />
              <span className="font-mono" dir="ltr">
                {row.original.phone_number || "-"}
              </span>
            </div>
            {row.original.telegram_id && (
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <Icon icon="logos:telegram" className="w-3.5 h-3.5" />
                <span>
                  {row.original.telegram_username || "متصل بتيليجرام"}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "الصلاحية",
        cell: ({ getValue }) => {
          const status = getValue();
          const styles = {
            student: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
            teacher: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800",
            admin: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800",
            moderator: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800",
          };
          const labels = {
            student: "طالب",
            teacher: "مدرس",
            admin: "مدير",
            moderator: "مشرف",
          };

          return (
            <span
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                styles[status] || "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600"
              }`}
            >
              {labels[status] || status}
            </span>
          );
        },
      },
      {
        accessorKey: "wallet_balance",
        header: "الرصيد",
        cell: ({ getValue }) => (
          <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg w-fit border border-emerald-100 dark:border-emerald-800">
            {parseFloat(getValue() || 0).toFixed(2)} ج.م
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: "الحالة",
        cell: ({ getValue, row }) => {
          const isActive = getValue();
          return (
            <div className="flex items-center">
              <button
                onClick={() =>
                  handleToggleActivation(row.original.id, isActive)
                }
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
                title={isActive ? "اضغط للتعطيل" : "اضغط للتفعيل"}
              >
                <span
                  className={`${
                    isActive ? "translate-x-1" : "translate-x-7"
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform`}
                />
              </button>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Edit Action */}
            <button
              onClick={() => handleEditClick(row.original)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
              title="تعديل البيانات"
            >
              <Icon
                icon="solar:pen-bold"
                className="w-5 h-5"
              />
            </button>

            {/* Change Role Action */}
            <button
              onClick={() =>
                handleUpdateStatus(row.original.id, row.original.status)
              }
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"
              title="تغيير الصلاحية"
            >
              <Icon icon="solar:user-id-bold" className="w-5 h-5" />
            </button>

            {/* Delete Action */}
            <button
              onClick={() =>
                handleDeleteUser(row.original.id, row.original.full_name)
              }
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              title="حذف المستخدم"
            >
              <Icon
                icon="solar:trash-bin-trash-bold"
                className="w-5 h-5"
              />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: { globalFilter, pagination },
    manualPagination: true,
    pageCount: totalPages,
  });

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                إدارة المستخدمين
              </h1>
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800">
                {totalUsers} مستخدم
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              عرض وإدارة حسابات الطلاب والمدرسين والإداريين
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <Icon
                icon="solar:magnifer-linear"
                className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              />
            </div>
            <input
              type="text"
              className="w-full lg:w-96 pl-4 pr-11 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm"
              placeholder="بحث بالاسم، البريد، أو الهاتف..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                جاري تحميل المستخدمين...
              </span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200 group"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {users.length === 0 && !loading && (
                <div className="p-16 text-center">
                  <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon
                      icon="solar:user-cross-bold"
                      className="w-12 h-12 text-gray-400"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    لا توجد نتائج
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    حاول تغيير كلمات البحث أو تصفية النتائج
                  </p>
                </div>
              )}

              {/* Pagination */}
              {users.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/50">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    عرض {users.length} من أصل <span className="font-bold text-gray-900 dark:text-white">{totalUsers}</span> مستخدم
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      السابق
                    </button>
                    <span className="flex items-center px-4 py-2 text-sm font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
                      {pagination.pageIndex + 1}
                    </span>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- Edit User Modal --- */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700"
            role="dialog"
          >
            <form onSubmit={handleSaveEdit}>
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="solar:pen-bold"
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    تعديل بيانات المستخدم
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                  <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.full_name || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="example@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      value={editingUser.phone_number || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phone_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-mono placeholder:text-gray-400"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      معرف التيليجرام
                    </label>
                    <input
                      type="text"
                      value={editingUser.telegram_id || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          telegram_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-mono placeholder:text-gray-400"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                >
                  {isSaving ? (
                    <>
                      <Icon icon="svg-spinners:ring-resize" className="w-4 h-4" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                      حفظ التغييرات
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
