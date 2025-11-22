"use client";

import {
  deleteCourse,
  listCourses,
  updateCourse,
} from "@/services/admin/Course";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: 0,
    price_before_discount: 0,
    is_free: false,
    is_pinned: false,
    sellable: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const pageSize = 10;
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, [currentPage, filterStatus]);

  useEffect(() => {
    // Reset to page 1 when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchCourses();
    }
  }, [searchTerm]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const sellableFilter =
        filterStatus === "active"
          ? true
          : filterStatus === "draft"
          ? false
          : null;
      const response = await listCourses(currentPage, pageSize, {
        search: searchTerm || null,
        sellable: sellableFilter,
      });

      setCourses(response.courses || []);
      setTotalPages(response.total_pages || 1);
      setTotalCourses(response.total || 0);

      // Calculate stats from total
      const total = response.total || 0;
      // For stats, we need to fetch all courses count
      const statsResponse = await listCourses(1, 50);
      const allCourses = statsResponse.courses || [];
      const active =
        allCourses.filter((course) => course.sellable)?.length || 0;
      const draft = allCourses.length - active;
      setStats({ total: allCourses.length, active, draft });
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleEditClick = (course) => {
    setCourseToEdit(course);
    setEditFormData({
      name: course.name || "",
      description: course.description || "",
      price: course.price || 0,
      price_before_discount: course.price_before_discount || 0,
      is_free: course.is_free || false,
      is_pinned: course.is_pinned || false,
      sellable: course.sellable || false,
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditConfirm = async () => {
    if (!courseToEdit) return;

    setEditLoading(true);
    try {
      await updateCourse(courseToEdit.id, editFormData);
      setShowEditModal(false);
      setCourseToEdit(null);
      // Refetch courses to update the list
      fetchCourses();
    } catch (error) {
      console.error("Error updating course:", error);
      alert("حدث خطأ أثناء تحديث الدورة");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    setDeleteLoading(courseToDelete.id);
    try {
      await deleteCourse(courseToDelete.id);
      setShowDeleteModal(false);
      setCourseToDelete(null);
      // Refetch courses to update the list and stats
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("حدث خطأ أثناء حذف الدورة");
    } finally {
      setDeleteLoading(null);
    }
  };

  // TanStack Table configuration
  const columns = useMemo(
    () => [
      {
        id: "course",
        accessorKey: "name",
        header: () => (
          <span className="inline-flex items-center gap-2">
            <Icon icon="solar:book-bold" className="w-4 h-4" />
            الدورة
          </span>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center gap-3">
              {course.image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${course.image}`}
                  alt={course.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon
                    icon="solar:book-bold"
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {course.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {course.id}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "description",
        accessorKey: "description",
        header: () => (
          <span className="inline-flex items-center gap-2">
            <Icon icon="solar:document-bold" className="w-4 h-4" />
            الوصف
          </span>
        ),
        cell: ({ row }) => (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md">
            {row.original.description || "لا يوجد وصف"}
          </p>
        ),
      },
      {
        id: "price",
        accessorKey: "price",
        header: () => (
          <span className="inline-flex items-center gap-2">
            <Icon icon="solar:wallet-bold" className="w-4 h-4" />
            السعر
          </span>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                ${course.price || 0}
              </p>
              {course.price_before_discount > 0 &&
                course.price_before_discount !== course.price && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
                    ${course.price_before_discount}
                  </p>
                )}
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "sellable",
        header: () => (
          <span className="inline-flex items-center gap-2">
            <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
            الحالة
          </span>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  course.sellable
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {course.sellable ? "نشط" : "مسودة"}
              </span>
              {course.is_free && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  مجاني
                </span>
              )}
              {course.is_pinned && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  مثبت
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="inline-flex items-center gap-2">
            <Icon icon="solar:settings-bold" className="w-4 h-4" />
            الإجراءات
          </span>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/dashboard/courses/${course.id}`}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="عرض التفاصيل"
              >
                <Icon icon="solar:eye-bold" className="w-5 h-5" />
              </Link>
              <button
                onClick={() => handleEditClick(course)}
                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="تعديل"
              >
                <Icon icon="solar:pen-bold" className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(course)}
                disabled={deleteLoading === course.id}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                title="حذف"
              >
                {deleteLoading === course.id ? (
                  <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                ) : (
                  <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                )}
              </button>
            </div>
          );
        },
      },
    ],
    [deleteLoading]
  );

  const [sorting, setSorting] = useState([]);

  const filteredCourses = courses;

  const table = useReactTable({
    data: filteredCourses,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إدارة الدورات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            إدارة ومراقبة جميع الدورات التدريبية
          </p>
        </div>
        <Link
          href="/admin/dashboard/courses/manage"
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg"
        >
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          إضافة دورة جديدة
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Icon
                icon="solar:book-bold"
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي الدورات
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Icon
                icon="solar:play-circle-bold"
                className="w-6 h-6 text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                الدورات النشطة
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Icon
                icon="solar:document-bold"
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مسودات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.draft}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                type="text"
                placeholder="البحث عن دورة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                filterStatus === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              نشط ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus("draft")}
              className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                filterStatus === "draft"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              مسودة ({stats.draft})
            </button>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              icon="solar:book-bold"
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || filterStatus !== "all"
                ? "لا توجد نتائج"
                : "لا توجد دورات"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "جرب تغيير معايير البحث أو الفلتر"
                : "ابدأ بإضافة دورة تدريبية جديدة"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link
                href="/admin/dashboard/courses/manage"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                إضافة دورة جديدة
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            className="inline-flex items-center gap-2"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === "asc" ? (
                              <Icon
                                icon="solar:arrow-up-bold"
                                className="w-4 h-4"
                              />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <Icon
                                icon="solar:arrow-down-bold"
                                className="w-4 h-4"
                              />
                            ) : (
                              <Icon
                                icon="solar:sort-outline"
                                className="w-4 h-4 text-gray-400"
                              />
                            )}
                          </button>
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
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
      </div>

      {/* Pagination */}
      {filteredCourses.length > 0 && totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              عرض {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, totalCourses)} من {totalCourses}{" "}
              دورة
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="الصفحة الأولى"
              >
                <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="السابق"
              >
                <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? "bg-red-600 text-white"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="التالي"
              >
                <Icon icon="solar:arrow-left-bold" className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="الصفحة الأخيرة"
              >
                <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Icon
                  icon="solar:trash-bin-trash-bold"
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                تأكيد الحذف
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              هل أنت متأكد من حذف الدورة "{courseToDelete?.name}"؟ لا يمكن
              التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "جاري الحذف..." : "حذف"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCourseToDelete(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Icon
                  icon="solar:pen-bold"
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  تعديل الدورة
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {courseToEdit?.name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم الدورة *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleEditFormChange("name", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="أدخل اسم الدورة"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    handleEditFormChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white resize-none"
                  placeholder="أدخل وصف الدورة"
                />
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر الحالي
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) =>
                      handleEditFormChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر قبل الخصم
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.price_before_discount}
                    onChange={(e) =>
                      handleEditFormChange(
                        "price_before_discount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {/* Sellable */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        الدورة نشطة
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        متاحة للبيع والتسجيل
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleEditFormChange("sellable", !editFormData.sellable)
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      editFormData.sellable
                        ? "bg-green-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        editFormData.sellable ? "right-0.5" : "right-6"
                      }`}
                    />
                  </button>
                </div>

                {/* Is Free */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="solar:gift-bold"
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        دورة مجانية
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        متاحة بدون دفع
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleEditFormChange("is_free", !editFormData.is_free)
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      editFormData.is_free
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        editFormData.is_free ? "right-0.5" : "right-6"
                      }`}
                    />
                  </button>
                </div>

                {/* Is Pinned */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="solar:pin-bold"
                      className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        دورة مثبتة
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        تظهر في أعلى القائمة
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleEditFormChange("is_pinned", !editFormData.is_pinned)
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      editFormData.is_pinned
                        ? "bg-purple-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        editFormData.is_pinned ? "right-0.5" : "right-6"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditConfirm}
                disabled={editLoading || !editFormData.name}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {editLoading ? (
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
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCourseToEdit(null);
                }}
                disabled={editLoading}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
