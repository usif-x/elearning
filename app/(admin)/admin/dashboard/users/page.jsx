"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
        customClass: { popup: "font-arabic" }, // Assuming you have a font class
      });

      if (result.isConfirmed) {
        await updateUserActivation(userId, !currentStatus);
        toast.success(
          currentStatus ? "تم إلغاء تفعيل المستخدم" : "تم تفعيل المستخدم"
        );
        // Optimistic update or refetch
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

  // 4. Edit User (The New Action)
  const handleEditClick = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      // Prepare payload - ensure we only send editable fields
      const payload = {
        full_name: editingUser.full_name,
        email: editingUser.email,
        phone_number: editingUser.phone_number,
        telegram_id: editingUser.telegram_id,
        // Add other fields if your API supports them
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
            className="text-xs font-mono text-gray-500 cursor-pointer hover:text-blue-600"
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
              <Icon icon="solar:phone-calling-linear" className="w-3.5 h-3.5" />
              <span className="font-mono" dir="ltr">
                {row.original.phone_number || "-"}
              </span>
            </div>
            {row.original.telegram_id && (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Icon icon="logos:telegram" className="w-3 h-3" />
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
            student: "bg-blue-50 text-blue-700 border-blue-200",
            teacher: "bg-purple-50 text-purple-700 border-purple-200",
            admin: "bg-rose-50 text-rose-700 border-rose-200",
            moderator: "bg-amber-50 text-amber-700 border-amber-200",
          };
          const labels = {
            student: "طالب",
            teacher: "مدرس",
            admin: "مدير",
            moderator: "مشرف",
          };

          return (
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
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
          <div className="font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md w-fit">
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isActive ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"
                }`}
                title={isActive ? "اضغط للتعطيل" : "اضغط للتفعيل"}
              >
                <span
                  className={`${
                    isActive ? "translate-x-1" : "translate-x-6"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
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
          <div className="flex items-center justify-end gap-2">
            {/* View Details Action */}
            <button
              onClick={() =>
                router.push(`/admin/dashboard/users/${row.original.id}`)
              }
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-green-900/30 dark:hover:text-green-400"
              title="عرض التفاصيل"
            >
              <Icon icon="solar:eye-bold-duotone" className="w-5 h-5" />
            </button>

            {/* Edit Action */}
            <button
              onClick={() => handleEditClick(row.original)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
              title="تعديل البيانات"
            >
              <Icon
                icon="solar:pen-new-square-bold-duotone"
                className="w-5 h-5"
              />
            </button>

            {/* Change Role Action */}
            <button
              onClick={() =>
                handleUpdateStatus(row.original.id, row.original.status)
              }
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
              title="تغيير الصلاحية"
            >
              <Icon icon="solar:user-id-bold-duotone" className="w-5 h-5" />
            </button>

            {/* Delete Action */}
            <button
              onClick={() =>
                handleDeleteUser(row.original.id, row.original.full_name)
              }
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="حذف المستخدم"
            >
              <Icon
                icon="solar:trash-bin-trash-bold-duotone"
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon
                icon="solar:users-group-two-rounded-bold-duotone"
                className="text-blue-600"
              />
              إدارة المستخدمين
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              عرض وإدارة حسابات الطلاب والمدرسين والإداريين
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon
                icon="solar:magnifer-linear"
                className="w-5 h-5 text-gray-400"
              />
            </div>
            <input
              type="text"
              className="block w-full p-3 pr-10 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white shadow-sm transition-all"
              placeholder="بحث بالاسم، البريد، أو الهاتف..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="py-32 flex justify-center">
              <LoadingSpinner />
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
                            className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
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
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors"
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
                <div className="text-center py-16">
                  <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      icon="solar:user-cross-bold-duotone"
                      className="w-8 h-8 text-gray-400"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    لا توجد نتائج
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    حاول تغيير كلمات البحث أو تصفية النتائج
                  </p>
                </div>
              )}

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  عرض {users.length} من أصل {totalUsers} مستخدم
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                  >
                    السابق
                  </button>
                  <span className="flex items-center px-4 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                    {pagination.pageIndex + 1}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- Edit User Modal --- */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all"
            role="dialog"
          >
            <form onSubmit={handleSaveEdit}>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Icon
                    icon="solar:pen-new-square-bold-duotone"
                    className="text-blue-600"
                  />
                  تعديل بيانات المستخدم
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التغييرات"
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
