"use client";

import {
  addCommunityMember,
  getCommunityMembers,
  removeCommunityMember,
} from "@/services/Community";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";

const CommunityMembersPage = () => {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    total_pages: 1,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const memberEmailRef = useRef(null);

  useEffect(() => {
    if (communityId) {
      fetchMembers();
    }
  }, [communityId, pagination.page]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getCommunityMembers(
        communityId,
        pagination.page,
        pagination.size
      );
      setMembers(data.members || []);
      setPagination({
        page: data.page || 1,
        size: data.size || 20,
        total: data.total || 0,
        total_pages: data.total_pages || 1,
      });
    } catch (error) {
      console.error("Failed to fetch members", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل تحميل الأعضاء",
        confirmButtonText: "حسناً",
      });
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    const val = memberEmailRef.current?.value?.trim();
    if (!val) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "أدخل البريد الإلكتروني أو معرف المستخدم",
        confirmButtonText: "حسناً",
      });
      return;
    }
    try {
      await addCommunityMember(communityId, val);
      Swal.fire({
        icon: "success",
        title: "نجح!",
        text: "تمت إضافة العضو بنجاح",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      memberEmailRef.current.value = "";
      fetchMembers();
    } catch (error) {
      console.error("Add member error:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل إضافة العضو",
        confirmButtonText: "حسناً",
      });
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: `هل تريد إزالة ${userName || "هذا العضو"} من المجتمع؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، أزله!",
      cancelButtonText: "إلغاء",
    });
    if (!result.isConfirmed) return;
    try {
      await removeCommunityMember(communityId, userId);
      Swal.fire({
        icon: "success",
        title: "تمت الإزالة!",
        text: "تمت إزالة العضو بنجاح",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      fetchMembers();
    } catch (error) {
      console.error("Remove member error:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل إزالة العضو",
        confirmButtonText: "حسناً",
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case "admin":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "moderator":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return "solar:crown-bold";
      case "admin":
        return "solar:shield-check-bold";
      case "moderator":
        return "solar:verified-check-bold";
      default:
        return "solar:user-bold";
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case "owner":
        return "مالك";
      case "admin":
        return "مشرف";
      case "moderator":
        return "وسيط";
      case "member":
        return "عضو";
      default:
        return role;
    }
  };

  const getJoinViaText = (via) => {
    switch (via) {
      case "direct":
        return "مباشر";
      case "invite":
        return "دعوة";
      case "request":
        return "طلب";
      default:
        return via;
    }
  };

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "user",
        header: "العضو",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0 ring-2 ring-violet-200 dark:ring-violet-800">
                {member.user?.profile_picture ? (
                  <img
                    src={member.user.profile_picture}
                    alt={member.user.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon
                    icon="solar:user-bold"
                    className="w-6 h-6 text-violet-500"
                  />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {member.user?.full_name || "مستخدم"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {member.user_id}
                </div>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "role",
        header: "الدور",
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${getRoleBadgeColor(
                role
              )}`}
            >
              <Icon icon={getRoleIcon(role)} className="w-4 h-4" />
              {getRoleText(role)}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "user.telegram_username",
        header: "اسم المستخدم",
        cell: ({ row }) => {
          const username = row.original.user?.telegram_username;
          return username ? (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Icon
                icon="solar:mention-circle-bold-duotone"
                className="w-5 h-5 text-blue-500"
              />
              <span className="font-medium">@{username}</span>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-sm">
              لا يوجد
            </span>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "joined_at",
        header: "تاريخ الانضمام",
        cell: ({ row }) => {
          const date = new Date(row.original.joined_at);
          return (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Icon
                icon="solar:calendar-bold-duotone"
                className="w-5 h-5 text-violet-500"
              />
              <span className="text-sm">
                {date.toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "joined_via",
        header: "الطريقة",
        cell: ({ row }) => {
          const via = row.original.joined_via;
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
              <Icon icon="solar:tag-bold-duotone" className="w-4 h-4" />
              {getJoinViaText(via)}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center justify-center gap-2 text-center">
              {member.role !== "owner" ? (
                <button
                  onClick={() =>
                    handleRemoveMember(member.user_id, member.user?.full_name)
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                >
                  <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                  <span>إزالة</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">
                  <Icon icon="solar:lock-bold" className="w-4 h-4" />
                  محمي
                </span>
              )}

              <Link
                href={`/admin/users/${member.user_id}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
              >
                <Icon icon="solar:eye-bold" className="w-5 h-5" />
                <span>عرض</span>
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: members,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-sm transition-all"
        >
          <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
          <span className="font-medium">رجوع</span>
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Icon
                icon="solar:users-group-rounded-bold"
                className="w-7 h-7 text-white"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                إدارة الأعضاء
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                عرض وإدارة أعضاء المجتمع
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Icon icon="solar:user-plus-bold" className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            إضافة عضو جديد
          </h2>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Icon
              icon="solar:user-id-bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              ref={memberEmailRef}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="البريد الإلكتروني أو معرف المستخدم"
            />
          </div>
          <button
            onClick={handleAddMember}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
            إضافة
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="ابحث عن عضو..."
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg">
            <Icon
              icon="solar:users-group-two-rounded-bold"
              className="w-5 h-5"
            />
            <span>إجمالي الأعضاء: {pagination.total}</span>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              جاري التحميل...
            </p>
          </div>
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <Icon
                  icon="solar:user-speak-rounded-bold-duotone"
                  className="w-12 h-12 text-gray-400"
                />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
              {globalFilter
                ? "لم يتم العثور على أعضاء"
                : "لا يوجد أعضاء حتى الآن"}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {globalFilter ? "جرب كلمات بحث مختلفة" : "ابدأ بإضافة أول عضو"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b-2 border-violet-200 dark:border-violet-800"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-2 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="text-lg">
                                {{
                                  asc: (
                                    <Icon
                                      icon="solar:arrow-up-bold"
                                      className="w-5 h-5 text-violet-500"
                                    />
                                  ),
                                  desc: (
                                    <Icon
                                      icon="solar:arrow-down-bold"
                                      className="w-5 h-5 text-violet-500"
                                    />
                                  ),
                                }[header.column.getIsSorted()] ?? (
                                  <Icon
                                    icon="solar:sort-bold"
                                    className="w-5 h-5 opacity-30"
                                  />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() =>
                setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
              السابق
            </button>
            <span className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold">
              {pagination.page} / {pagination.total_pages}
            </span>
            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(p.total_pages, p.page + 1),
                }))
              }
              disabled={pagination.page === pagination.total_pages}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              التالي
              <Icon icon="solar:arrow-left-bold" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityMembersPage;
