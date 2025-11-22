"use client";

import {
  createLecture,
  deleteLecture,
  listLectures,
  updateLecture,
} from "@/services/admin/Lecutre";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const AdminLecturesPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    name: "",
    description: "",
    position: 1,
  });

  const totalLectures = lectures.length;

  const fetchLectures = async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    try {
      const data = await listLectures(courseId, 1, 100);
      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.lectures)
        ? data.lectures
        : [];
      const sorted = [...items].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );
      setLectures(sorted);
    } catch (e) {
      console.error(e);
      setError("فشل تحميل المحاضرات");
      toast.error("فشل تحميل المحاضرات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  const openCreate = () => {
    setEditMode(false);
    setCurrentLecture(null);
    setLectureForm({ name: "", description: "", position: totalLectures + 1 });
    setFormOpen(true);
  };

  const openEdit = (lec) => {
    setEditMode(true);
    setCurrentLecture(lec);
    setLectureForm({
      name: lec?.name || "",
      description: lec?.description || "",
      position: Number(lec?.position) || 1,
    });
    setFormOpen(true);
  };

  const handleFormChange = (field, value) => {
    setLectureForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!courseId) return;
    if (!lectureForm.name?.trim()) {
      toast.error("يرجى إدخال اسم المحاضرة");
      return;
    }
    setSaving(true);
    try {
      if (editMode && currentLecture?.id) {
        await updateLecture(courseId, currentLecture.id, lectureForm);
        toast.success("تم تحديث المحاضرة");
      } else {
        await createLecture(courseId, lectureForm);
        toast.success("تم إنشاء المحاضرة");
      }
      setFormOpen(false);
      await fetchLectures();
    } catch (e) {
      console.error(e);
      toast.error("فشل حفظ بيانات المحاضرة");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (lec) => {
    if (!courseId || !lec?.id) return;
    const ok = window.confirm(`هل تريد حذف المحاضرة: ${lec.name}?`);
    if (!ok) return;
    try {
      await deleteLecture(courseId, lec.id);
      toast.success("تم حذف المحاضرة");
      await fetchLectures();
    } catch (e) {
      console.error(e);
      toast.error("فشل حذف المحاضرة");
    }
  };

  const moveUp = async (index) => {
    if (index <= 0) return;
    const a = lectures[index - 1];
    const b = lectures[index];
    try {
      await updateLecture(courseId, a.id, { position: b.position });
      await updateLecture(courseId, b.id, { position: a.position });
      toast.success("تم تعديل ترتيب المحاضرات");
      await fetchLectures();
    } catch (e) {
      console.error(e);
      toast.error("فشل تعديل الترتيب");
    }
  };

  const moveDown = async (index) => {
    if (index >= lectures.length - 1) return;
    const a = lectures[index];
    const b = lectures[index + 1];
    try {
      await updateLecture(courseId, a.id, { position: b.position });
      await updateLecture(courseId, b.id, { position: a.position });
      toast.success("تم تعديل ترتيب المحاضرات");
      await fetchLectures();
    } catch (e) {
      console.error(e);
      toast.error("فشل تعديل الترتيب");
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayedLectures = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? lectures.filter((l) => (l?.name || "").toLowerCase().includes(q))
      : lectures;
    return list;
  }, [lectures, query]);

  const totalContents = useMemo(() => {
    return lectures.reduce(
      (acc, l) => acc + (Array.isArray(l?.contents) ? l.contents.length : 0),
      0
    );
  }, [lectures]);

  const contentIcon = (type) => {
    switch ((type || "").toLowerCase()) {
      case "video":
        return "solar:videocamera-bold";
      case "photo":
        return "solar:gallery-bold";
      case "file":
        return "solar:document-bold";
      case "audio":
        return "solar:music-note-2-bold";
      case "link":
        return "solar:link-bold";
      case "quiz":
        return "solar:checklist-minimalistic-bold";
      default:
        return "solar:menu-dots-bold";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            جاري تحميل المحاضرات...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="solar:danger-circle-bold"
              className="w-8 h-8 text-red-600 dark:text-red-400"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            خطأ في التحميل
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="رجوع"
              >
                <Icon
                  icon="solar:arrow-right-outline"
                  className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    إدارة محاضرات الدورة
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                      {totalLectures} محاضرة
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                      {totalContents} محتوى
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  إدارة وتنظيم محاضرات الدورة التدريبية
                </p>
                <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Link
                    href="/admin/dashboard/courses"
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    الدورات
                  </Link>
                  <Icon
                    icon="solar:alt-arrow-left-bold"
                    className="w-4 h-4 mx-2"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    المحاضرات
                  </span>
                </nav>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Enhanced Search Bar */}
              <div className="relative">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <Icon
                    icon="solar:search-bold"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="البحث في المحاضرات..."
                    className="bg-transparent outline-none flex-1 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Icon
                        icon="solar:close-circle-bold"
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                  إضافة محاضرة
                </button>

                <Link
                  href={`/admin/dashboard/courses/${courseId}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Icon icon="solar:settings-bold" className="w-5 h-5" />
                  إعدادات الدورة
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Lectures List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {lectures.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon
                  icon="solar:book-bold"
                  className="w-10 h-10 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد محاضرات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                ابدأ بإضافة محاضرة جديدة للدورة التدريبية
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                إضافة المحاضرة الأولى
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedLectures.map((lec, idx) => (
                <div
                  key={lec.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Lecture Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="نقل لأعلى"
                          >
                            <Icon
                              icon="solar:arrow-up-bold"
                              className="w-4 h-4"
                            />
                          </button>
                          <button
                            onClick={() => moveDown(idx)}
                            disabled={idx === displayedLectures.length - 1}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="نقل لأسفل"
                          >
                            <Icon
                              icon="solar:arrow-down-bold"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>

                        {/* Position Badge */}
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                          #{lec.position}
                        </span>

                        {/* Lecture Title */}
                        <Link
                          href={`/admin/dashboard/courses/${courseId}/lectures/${lec.id}`}
                          className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {lec.name}
                        </Link>

                        {/* Expand Toggle */}
                        <button
                          onClick={() => toggleExpand(lec.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          title={
                            expanded.has(lec.id)
                              ? "إخفاء المحتوى"
                              : "عرض المحتوى"
                          }
                        >
                          <Icon
                            icon={
                              expanded.has(lec.id)
                                ? "solar:alt-arrow-up-bold"
                                : "solar:alt-arrow-down-bold"
                            }
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                          />
                        </button>
                      </div>

                      {/* Description */}
                      {lec.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                          {lec.description}
                        </p>
                      )}

                      {/* Content Summary */}
                      {Array.isArray(lec.contents) &&
                        lec.contents.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {(() => {
                              const counts = lec.contents.reduce((acc, c) => {
                                const t = (
                                  c.content_type || "other"
                                ).toLowerCase();
                                acc[t] = (acc[t] || 0) + 1;
                                return acc;
                              }, {});
                              return Object.entries(counts).map(
                                ([type, count]) => (
                                  <span
                                    key={type}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium"
                                  >
                                    <Icon
                                      icon={contentIcon(type)}
                                      className="w-4 h-4"
                                    />
                                    {type}: {count}
                                  </span>
                                )
                              );
                            })()}
                          </div>
                        )}

                      {/* Expanded Content */}
                      {expanded.has(lec.id) &&
                        Array.isArray(lec.contents) &&
                        lec.contents.length > 0 && (
                          <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                              محتوى المحاضرة
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {lec.contents
                                .slice()
                                .sort(
                                  (a, b) =>
                                    (a.position ?? 0) - (b.position ?? 0)
                                )
                                .map((c) => (
                                  <div
                                    key={c.id}
                                    className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                          <Icon
                                            icon={contentIcon(c.content_type)}
                                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                          />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                                          {c.title || c.content_type}
                                        </span>
                                      </div>
                                      <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                        #{c.position}
                                      </span>
                                    </div>
                                    {c.description && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                        {c.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Link
                                        href={`/admin/dashboard/courses/${courseId}/lectures/${lec.id}/content`}
                                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                                      >
                                        <Icon
                                          icon="solar:settings-bold"
                                          className="w-3 h-3"
                                        />
                                        إدارة
                                      </Link>
                                      {c.content_type === "quiz" &&
                                        c.quiz_duration != null && (
                                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                            <Icon
                                              icon="solar:clock-circle-bold"
                                              className="w-3 h-3"
                                            />
                                            {c.quiz_duration} دقيقة
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openEdit(lec)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Icon icon="solar:pen-bold" className="w-4 h-4" />
                        تعديل
                      </button>

                      <Link
                        href={`/admin/dashboard/courses/${courseId}/lectures/${lec.id}/content`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-center"
                      >
                        <Icon icon="solar:book-bold" className="w-4 h-4" />
                        المحتوى
                      </Link>

                      <button
                        onClick={() => confirmDelete(lec)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Icon icon="solar:trash-bold" className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Icon
                      icon={
                        editMode ? "solar:pen-bold" : "solar:add-circle-bold"
                      }
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editMode ? "تعديل محاضرة" : "إضافة محاضرة جديدة"}
                  </h2>
                </div>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="إغلاق"
                >
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    اسم المحاضرة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lectureForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="أدخل اسم المحاضرة"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    الوصف
                  </label>
                  <textarea
                    value={lectureForm.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px] resize-none"
                    placeholder="وصف المحاضرة (اختياري)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={lectureForm.position}
                    onChange={(e) =>
                      handleFormChange("position", Number(e.target.value))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="1"
                    min={1}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => setFormOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !lectureForm.name?.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الحفظ...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={
                          editMode
                            ? "solar:check-circle-bold"
                            : "solar:add-circle-bold"
                        }
                        className="w-4 h-4"
                      />
                      {editMode ? "تحديث" : "إنشاء"}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLecturesPage;
