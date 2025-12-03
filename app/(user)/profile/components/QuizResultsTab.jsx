import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

const QuizResultsTab = ({ quizResults, quizLoading }) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "quiz_title",
        header: "الاختبار",
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900 dark:text-white block min-w-[120px] max-w-[200px] truncate">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "score",
        header: "النتيجة",
        cell: ({ getValue }) => {
          const score = getValue();
          return (
            <span
              className={`text-base sm:text-lg font-bold whitespace-nowrap ${
                score >= 50 ? "text-green-500" : "text-red-500"
              }`}
            >
              {score}%
            </span>
          );
        },
      },
      {
        accessorKey: "correct_answers",
        header: "الصحيحة",
        cell: ({ row }) => (
          <span className="text-gray-900 dark:text-white whitespace-nowrap">
            {row.original.correct_answers}/{row.original.total_questions}
          </span>
        ),
      },
      {
        accessorKey: "time_taken",
        header: "الوقت",
        cell: ({ getValue }) => (
          <span className="text-gray-900 dark:text-white whitespace-nowrap">
            {getValue()} د
          </span>
        ),
      },
      {
        accessorKey: "completed_at",
        header: "التاريخ",
        cell: ({ getValue }) => {
          const date = getValue();
          return (
            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm whitespace-nowrap">
              {date
                ? new Date(date).toLocaleDateString("ar-EG", {
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "التفاصيل",
        cell: ({ row }) => {
          const quiz = row.original;
          return quiz.is_completed ? (
            <div className="flex gap-2">
              {/* رابط عرض النتيجة */}
              <Link
                href={`/profile/quiz-result/${quiz.attempt_id}`}
                className="text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 font-medium inline-flex items-center gap-1"
              >
                <Icon icon="solar:eye-bold" className="w-4 h-4" />
                <span className="hidden sm:inline">عرض النتيجة</span>
              </Link>

              {/* رابط الذهاب للـ quiz نفسه */}
              <Link
                href={`/courses/${quiz.course_id}/lecture/${quiz.lecture_id}/content/${quiz.content_id}`}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-medium inline-flex items-center gap-1"
              >
                <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
                <span className="hidden sm:inline">اذهب إلى الكويز</span>
              </Link>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-gray-600 text-xs">
              غير مكتمل
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: quizResults,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          نتائج الاختبارات
        </h2>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <Icon
            icon="solar:clipboard-list-bold"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <span>إجمالي المحاولات: {quizResults.length}</span>
        </div>
      </div>

      {quizLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon icon="eos-icons:loading" className="w-12 h-12 text-sky-500" />
        </div>
      ) : quizResults.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {table.getRowModel().rows.map((row) => {
              const quiz = row.original;
              return (
                <div
                  key={row.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300"
                >
                  {/* Quiz Title */}
                  <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2">
                        {quiz.quiz_title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {quiz.completed_at
                          ? new Date(quiz.completed_at).toLocaleDateString(
                              "ar-EG",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </p>
                    </div>
                    <div
                      className={`text-2xl font-black px-3 py-1 rounded-lg ${
                        quiz.score >= 50
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {quiz.score}%
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                      <Icon
                        icon="solar:checklist-minimalistic-bold-duotone"
                        className="w-5 h-5 text-sky-500"
                      />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          الإجابات
                        </p>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          {quiz.correct_answers}/{quiz.total_questions}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                      <Icon
                        icon="solar:clock-circle-bold-duotone"
                        className="w-5 h-5 text-purple-500"
                      />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          الوقت
                        </p>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          {quiz.time_taken} د
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {quiz.is_completed ? (
                    <div className="flex gap-2">
                      <Link
                        href={`/profile/quiz-result/${quiz.attempt_id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        <Icon icon="solar:eye-bold" className="w-4 h-4" />
                        عرض النتيجة
                      </Link>
                      <Link
                        href={`/courses/${quiz.course_id}/lecture/${quiz.lecture_id}/content/${quiz.content_id}`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        <Icon
                          icon="solar:arrow-right-bold"
                          className="w-4 h-4"
                        />
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-400 dark:text-gray-600 text-sm">
                      غير مكتمل
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block relative">
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm text-right">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          scope="col"
                          className="px-6 py-3 font-semibold"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Page Info and Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span>
                  صفحة {table.getState().pagination.pageIndex + 1} من{" "}
                  {table.getPageCount()}
                </span>
                <span className="hidden sm:inline">
                  • عرض {table.getRowModel().rows.length} من{" "}
                  {quizResults.length} نتيجة
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="الصفحة الأولى"
                >
                  <Icon
                    icon="solar:double-alt-arrow-right-bold"
                    className="w-5 h-5"
                  />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="السابق"
                >
                  <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from(
                    { length: table.getPageCount() },
                    (_, i) => i
                  ).map((pageIndex) => {
                    const currentPage = table.getState().pagination.pageIndex;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageIndex === 0 ||
                      pageIndex === table.getPageCount() - 1 ||
                      Math.abs(pageIndex - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pageIndex}
                          onClick={() => table.setPageIndex(pageIndex)}
                          className={`min-w-[2.5rem] px-3 py-2 rounded-lg border transition-colors ${
                            pageIndex === currentPage
                              ? "bg-sky-500 text-white border-sky-500"
                              : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageIndex + 1}
                        </button>
                      );
                    } else if (
                      pageIndex === currentPage - 2 ||
                      pageIndex === currentPage + 2
                    ) {
                      return (
                        <span
                          key={pageIndex}
                          className="px-2 text-gray-500 dark:text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="التالي"
                >
                  <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="الصفحة الأخيرة"
                >
                  <Icon
                    icon="solar:double-alt-arrow-left-bold"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
              <label
                htmlFor="pageSize"
                className="text-gray-600 dark:text-gray-400 whitespace-nowrap"
              >
                عدد النتائج:
              </label>
              <select
                id="pageSize"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Icon
            icon="solar:clipboard-list-bold-duotone"
            className="w-24 h-24 text-gray-400 mx-auto mb-4"
          />
          <p className="text-gray-500 dark:text-gray-400">
            لم تقم بأي اختبارات حتى الآن
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizResultsTab;
