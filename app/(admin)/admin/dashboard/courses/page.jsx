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
          <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Icon icon="solar:book-bold" className="w-4 h-4" />
            الدورة
          </span>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center gap-4 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                {course.image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${course.image}`}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 flex items-center justify-center">
                    <Icon
                      icon="solar:book-bold"
                      className="w-6 h-6 text-red-500 dark:text-red-400"
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {course.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
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
          <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Icon icon="solar:document-bold" className="w-4 h-4" />
            الوصف
          </span>
        ),
        cell: ({ row }) => (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md leading-relaxed">
            {row.original.description || "لا يوجد وصف"}
          </p>
        ),
      },
      {
        id: "price",
        accessorKey: "price",
        header: () => (
          <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Icon icon="solar:wallet-bold" className="w-4 h-4" />
            السعر
          </span>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ${course.price || 0}
              </span>
              {course.price_before_discount > 0 &&
                course.price_before_discount !== course.price && (
                  <span className="text-xs text-gray-400 line-through">
                    ${course.price_before_discount}
                  </span>
                )}
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "sellable",
        header: () => (
          <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
            الحالة
          </span>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  course.sellable
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    course.sellable ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                {course.sellable ? "نشط" : "مسودة"}
              </span>
              {course.is_free && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30">
                  مجاني
                </span>
              )}
              {course.is_pinned && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30">
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
          <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Icon icon="solar:settings-bold" className="w-4 h-4" />
            الإجراءات
          </span>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/dashboard/courses/${course.id}`}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                title="عرض التفاصيل"
              >
                <Icon icon="solar:eye-bold" className="w-5 h-5" />
              </Link>
              <button
                onClick={() => handleEditClick(course)}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                title="تعديل"
              >
                <Icon icon="solar:pen-bold" className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(course)}
                disabled={deleteLoading === course.id}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
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
    <div className="p-6 space-y-8 min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            إدارة الدورات
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            إدارة ومراقبة جميع الدورات التدريبية في المنصة
          </p>
        </div>
        <Link
          href="/admin/dashboard/courses/manage"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          إضافة دورة جديدة
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon
                icon="solar:book-bold"
                className="w-7 h-7 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                إجمالي الدورات
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon
                icon="solar:play-circle-bold"
                className="w-7 h-7 text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                الدورات النشطة
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon
                icon="solar:document-bold"
                className="w-7 h-7 text-yellow-600 dark:text-yellow-400"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                مسودات
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.draft}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative group">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors"
              />
              <input
                type="text"
                placeholder="البحث عن دورة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900 dark:text-white transition-all duration-300"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                filterStatus === "all"
                  ? "bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                filterStatus === "active"
                  ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              نشط ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus("draft")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                filterStatus === "draft"
                  ? "bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              مسودة ({stats.draft})
            </button>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="solar:book-bold"
                className="w-10 h-10 text-gray-400"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchTerm || filterStatus !== "all"
                ? "لا توجد نتائج مطابقة"
                : "لا توجد دورات حتى الآن"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || filterStatus !== "all"
                ? "حاول البحث بكلمات مختلفة أو تغيير الفلتر المستخدم"
                : "ابدأ بإضافة دورتك الأولى وقم بإدارة المحتوى التعليمي الخاص بك"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link
                href="/admin/dashboard/courses/manage"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/20"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                إضافة دورة جديدة
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-5 text-right text-sm font-semibold text-gray-900 dark:text-white first:rounded-tr-2xl last:rounded-tl-2xl"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            className="inline-flex items-center gap-2 group hover:text-red-600 transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === "asc" ? (
                              <Icon
                                icon="solar:arrow-up-bold"
                                className="w-4 h-4 text-red-600"
                              />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <Icon
                                icon="solar:arrow-down-bold"
                                className="w-4 h-4 text-red-600"
                              />
                            ) : (
                              <Icon
                                icon="solar:sort-outline"
                                className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            )}
                          </button>
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
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors duration-200"
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            عرض <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> -{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * pageSize, totalCourses)}</span> من{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{totalCourses}</span> دورة
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="الصفحة الأولى"
            >
              <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="السابق"
            >
              <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-10 rounded-xl font-semibold text-sm transition-all ${
                        currentPage === page
                          ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
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
                    <span key={page} className="px-1 text-gray-400">
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
              className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="التالي"
            >
              <Icon icon="solar:arrow-left-bold" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="الصفحة الأخيرة"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-2">
                <Icon
                  icon="solar:trash-bin-trash-bold"
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                تأكيد الحذف
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                هل أنت متأكد من حذف الدورة <span className="font-semibold text-gray-900 dark:text-white">"{courseToDelete?.name}"</span>؟ 
                <br />
                لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCourseToDelete(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
              >
                {deleteLoading ? "جاري الحذف..." : "حذف الدورة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto transform transition-all scale-100">
            <div className="flex items-center gap-5 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
              <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                <Icon
                  icon="solar:pen-bold"
                  className="w-7 h-7 text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  تعديل الدورة
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {courseToEdit?.name}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Course Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  اسم الدورة *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleEditFormChange("name", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white transition-all"
                  placeholder="أدخل اسم الدورة"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    handleEditFormChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white resize-none transition-all"
                  placeholder="أدخل وصف الدورة"
                />
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    السعر الحالي
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
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
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white transition-all text-left dir-ltr"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    السعر قبل الخصم
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
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
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white transition-all text-left dir-ltr"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid gap-4">
                {/* Sellable */}
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        الدورة نشطة
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        متاحة للبيع والتسجيل
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleEditFormChange("sellable", !editFormData.sellable)
                    }
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      editFormData.sellable
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                        editFormData.sellable ? "right-1" : "right-8"
                      }`}
                    />
                  </button>
                </div>

                {/* Is Free */}
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="solar:gift-bold"
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        دورة مجانية
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        متاحة بدون دفع
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleEditFormChange("is_free", !editFormData.is_free)
                    }
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      editFormData.is_free
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                        editFormData.is_free ? "right-1" : "right-8"
                      }`}
                    />
                  </button>
                </div>

                {/* Is Pinned */}
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="solar:pin-bold"
                        className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        دورة مثبتة
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تظهر في أعلى القائمة
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleEditFormChange("is_pinned", !editFormData.is_pinned)
                    }
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      editFormData.is_pinned
                        ? "bg-purple-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                        editFormData.is_pinned ? "right-1" : "right-8"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCourseToEdit(null);
                }}
                disabled={editLoading}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleEditConfirm}
                disabled={editLoading || !editFormData.name}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
