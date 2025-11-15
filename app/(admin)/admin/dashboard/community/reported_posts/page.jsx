"use client";
import {
  deleteReportedPost,
  getReportedPosts,
  passReport,
} from "@/services/Community";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ReportedPostsPage = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000";
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedImage, setExpandedImage] = useState(null);
  const [imageRotation, setImageRotation] = useState(0);

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getReportedPosts(page, 10);
      setReports(data.reports || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching reports:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل البلاغات",
        confirmButtonText: "حسناً",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (reportId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "حذف المنشور",
      text: "هل تريد حذف هذا المنشور المبلغ عنه؟ لا يمكن التراجع عن هذا الإجراء.",
      showCancelButton: true,
      confirmButtonText: "حذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        await deleteReportedPost(reportId);
        setReports(reports.filter((r) => r.id !== reportId));
        setTotal(total - 1);
        Swal.fire({
          icon: "success",
          title: "تم الحذف",
          text: "تم حذف المنشور بنجاح",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting post:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في حذف المنشور",
          confirmButtonText: "حسناً",
        });
      }
    }
  };

  const handlePassReport = async (reportId) => {
    const result = await Swal.fire({
      icon: "question",
      title: "تجاهل البلاغ",
      text: "هل تريد تجاهل هذا البلاغ؟ سيبقى المنشور كما هو.",
      showCancelButton: true,
      confirmButtonText: "تجاهل",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        await passReport(reportId);
        setReports(reports.filter((r) => r.id !== reportId));
        setTotal(total - 1);
        Swal.fire({
          icon: "success",
          title: "تم التجاهل",
          text: "تم تجاهل البلاغ بنجاح",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error passing report:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تجاهل البلاغ",
          confirmButtonText: "حسناً",
        });
      }
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        text: "قيد المراجعة",
        color:
          "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        icon: "solar:clock-circle-bold",
      },
      deleted: {
        text: "تم الحذف",
        color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        icon: "solar:trash-bin-2-bold",
      },
      passed: {
        text: "تم التجاهل",
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        icon: "solar:check-circle-bold",
      },
    };

    const badge = badges[status] || badges.pending;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${badge.color}`}
      >
        <Icon icon={badge.icon} className="w-4 h-4" />
        <span>{badge.text}</span>
      </div>
    );
  };

  const handleImageClick = (image) => {
    setExpandedImage(image);
    setImageRotation(0);
  };

  const handleRotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleCloseModal = () => {
    setExpandedImage(null);
    setImageRotation(0);
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="svg-spinners:180-ring-with-bg"
            className="w-16 h-16 text-sky-500 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل البلاغات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/dashboard/community")}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
          >
            <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
            <span>العودة إلى المجتمعات</span>
          </button>

          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Icon
                    icon="solar:danger-circle-bold-duotone"
                    className="w-12 h-12"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    البلاغات المُبلغ عنها
                  </h1>
                  <p className="text-white/90">
                    إدارة ومراجعة المنشورات المبلغ عنها من قبل المستخدمين
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{total}</div>
                <div className="text-sm text-white/80">إجمالي البلاغات</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length > 0 ? (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Report Header */}
                <div className="bg-red-50 dark:bg-red-900/20 border-b-2 border-red-200 dark:border-red-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {report.reporter?.profile_picture ? (
                        <img
                          src={report.reporter.profile_picture}
                          alt={report.reporter.full_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-red-300 dark:border-red-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                          <Icon icon="solar:user-bold" className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {report.reporter?.full_name || "مستخدم"}
                          </h3>
                          {report.reporter?.telegram_username && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              @{report.reporter.telegram_username}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <Icon
                            icon="solar:calendar-bold"
                            className="w-4 h-4"
                          />
                          <span>{formatTimestamp(report.created_at)}</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
                          <div className="flex items-start gap-2 mb-2">
                            <Icon
                              icon="solar:danger-triangle-bold"
                              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                            />
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                سبب البلاغ:
                              </span>
                            </div>
                          </div>
                          <p
                            className="text-gray-700 dark:text-gray-300 mr-7"
                            dir="rtl"
                          >
                            {report.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(report.report_status)}
                  </div>
                </div>

                {/* Post Content */}
                {report.post && (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                      <Icon icon="solar:post-bold" className="w-4 h-4" />
                      <span>المنشور المُبلغ عنه:</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-4">
                      {/* Post Author */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        {report.post.author?.profile_picture ? (
                          <img
                            src={report.post.author.profile_picture}
                            alt={report.post.author.full_name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
                            <Icon icon="solar:user-bold" className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {report.post.author?.full_name || "مستخدم"}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(report.post.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p
                        className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                        dir="rtl"
                      >
                        {report.post.content}
                      </p>

                      {/* Post Media */}
                      {report.post.media && report.post.media.length > 0 && (
                        <div
                          className={`grid gap-2 ${
                            report.post.media.length === 1
                              ? "grid-cols-1"
                              : "grid-cols-2"
                          }`}
                        >
                          {report.post.media.map((media, index) => {
                            if (media.media_type === "image") {
                              return (
                                <div
                                  key={index}
                                  onClick={() =>
                                    handleImageClick(
                                      `${API_URL}/storage/${media.media_url}`
                                    )
                                  }
                                  className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-sky-500 dark:hover:border-sky-500 transition-colors cursor-pointer group"
                                >
                                  <img
                                    src={`${API_URL}/storage/${media.media_url}`}
                                    alt={`Media ${index + 1}`}
                                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <Icon
                                      icon="solar:eye-bold"
                                      className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}

                      {/* Post Stats */}
                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:heart-bold" className="w-4 h-4" />
                          <span>{report.post.reactions_count || 0} إعجاب</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:chat-round-line-bold"
                            className="w-4 h-4"
                          />
                          <span>{report.post.comments_count || 0} تعليق</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {report.report_status === "pending" && (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handlePassReport(report.id)}
                          className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Icon
                            icon="solar:check-circle-bold"
                            className="w-5 h-5"
                          />
                          <span>تجاهل البلاغ</span>
                        </button>
                        <button
                          onClick={() => handleDeletePost(report.id)}
                          className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Icon
                            icon="solar:trash-bin-2-bold"
                            className="w-5 h-5"
                          />
                          <span>حذف المنشور</span>
                        </button>
                      </div>
                    )}

                    {/* Reviewed Info */}
                    {report.report_status !== "pending" &&
                      report.reviewed_at && (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3 text-sm">
                          <Icon
                            icon="solar:shield-check-bold"
                            className="w-5 h-5 text-sky-500"
                          />
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              تمت المراجعة في:{" "}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatTimestamp(report.reviewed_at)}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Icon
              icon="solar:check-circle-bold-duotone"
              className="w-24 h-24 mx-auto mb-4 text-green-500"
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              لا توجد بلاغات
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              جميع البلاغات تمت مراجعتها أو لا توجد بلاغات جديدة
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === pageNumber
                      ? "bg-sky-500 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Image Expand Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              <Icon
                icon="solar:close-circle-bold"
                className="w-8 h-8 text-white"
              />
            </button>

            <button
              onClick={handleRotateImage}
              className="absolute top-4 left-4 z-10 w-12 h-12 bg-sky-500 hover:bg-sky-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <Icon icon="solar:restart-bold" className="w-6 h-6 text-white" />
            </button>

            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ transform: `rotate(${imageRotation}deg)` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportedPostsPage;
