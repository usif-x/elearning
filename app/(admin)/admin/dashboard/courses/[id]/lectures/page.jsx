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
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            جاري تحميل المحاضرات...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="solar:danger-circle-bold"
              className="w-10 h-10 text-red-600 dark:text-red-400"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            خطأ في التحميل
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-500/20"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <Icon
                icon="solar:arrow-right-bold"
                className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  إدارة المحاضرات
                </h1>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800">
                    {totalLectures} محاضرة
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-100 dark:border-emerald-800">
                    {totalContents} محتوى
                  </span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                تنظيم وترتيب محتوى الدورة التدريبية
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <Icon
                  icon="solar:magnifer-linear"
                  className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="البحث في المحاضرات..."
                className="w-full sm:w-64 pl-4 pr-11 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition-all shadow-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                إضافة محاضرة
              </button>

              <Link
                href={`/admin/dashboard/courses/${courseId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              >
                <Icon icon="solar:settings-bold" className="w-5 h-5" />
                الإعدادات
              </Link>
            </div>
          </div>
        </div>

        {/* Lectures List */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {lectures.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon
                  icon="solar:notebook-minimalistic-bold"
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                لا توجد محاضرات
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                ابدأ بإضافة المحاضرة الأولى لبناء محتوى الدورة التدريبية
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 transform hover:-translate-y-1"
              >
                <Icon icon="solar:add-circle-bold" className="w-6 h-6" />
                إضافة المحاضرة الأولى
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayedLectures.map((lec, idx) => (
                <div
                  key={lec.id}
                  className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200 group"
                >
                  <div className="flex items-start gap-6">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Icon icon="solar:alt-arrow-up-bold" className="w-5 h-5" />
                      </button>
                      <span className="text-center text-sm font-bold text-gray-400 font-mono">
                        {lec.position}
                      </span>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === displayedLectures.length - 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Icon icon="solar:alt-arrow-down-bold" className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/dashboard/courses/${courseId}/lectures/${lec.id}`}
                            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {lec.name}
                          </Link>
                          <button
                            onClick={() => toggleExpand(lec.id)}
                            className={`p-1.5 rounded-lg transition-all duration-300 ${
                              expanded.has(lec.id)
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <Icon
                              icon="solar:alt-arrow-down-bold"
                              className={`w-5 h-5 transition-transform duration-300 ${
                                expanded.has(lec.id) ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => openEdit(lec)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="تعديل"
                          >
                            <Icon icon="solar:pen-bold" className="w-5 h-5" />
                          </button>
                          <Link
                            href={`/admin/dashboard/courses/${courseId}/lectures/${lec.id}/content`}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="المحتوى"
                          >
                            <Icon icon="solar:layers-minimalistic-bold" className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => confirmDelete(lec)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="حذف"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {lec.description && (
                        <p className="text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                          {lec.description}
                        </p>
                      )}

                      {/* Content Summary Pills */}
                      {Array.isArray(lec.contents) && lec.contents.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const counts = lec.contents.reduce((acc, c) => {
                              const t = (c.content_type || "other").toLowerCase();
                              acc[t] = (acc[t] || 0) + 1;
                              return acc;
                            }, {});
                            return Object.entries(counts).map(([type, count]) => (
                              <span
                                key={type}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-gray-600"
                              >
                                <Icon
                                  icon={contentIcon(type)}
                                  className="w-3.5 h-3.5"
                                />
                                <span className="capitalize">{type}</span>
                                <span className="bg-white dark:bg-gray-600 px-1.5 rounded-md text-[10px] font-bold">
                                  {count}
                                </span>
                              </span>
                            ));
                          })()}
                        </div>
                      )}

                      {/* Expanded Content View */}
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          expanded.has(lec.id)
                            ? "grid-rows-[1fr] opacity-100 mt-6"
                            : "grid-rows-[0fr] opacity-0 mt-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                محتوى المحاضرة
                              </h4>
                              <Link
                                href={`/admin/dashboard/courses/${courseId}/lectures/${lec.id}/content`}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                إدارة المحتوى كامل
                              </Link>
                            </div>
                            
                            {Array.isArray(lec.contents) && lec.contents.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {lec.contents
                                  .slice()
                                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                                  .map((c) => (
                                    <div
                                      key={c.id}
                                      className="group/item bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                          <Icon
                                            icon={contentIcon(c.content_type)}
                                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-400">
                                              #{c.position}
                                            </span>
                                            <Link
                                              href={`/admin/dashboard/courses/${courseId}/lectures/${lec.id}/content/${c.id}`}
                                              className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                                            >
                                              <Icon icon="solar:pen-bold" className="w-3.5 h-3.5 text-gray-500" />
                                            </Link>
                                          </div>
                                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {c.title || c.content_type}
                                          </p>
                                          {c.content_type === "quiz" && c.quiz_duration && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                              <Icon icon="solar:clock-circle-bold" className="w-3 h-3" />
                                              <span>{c.quiz_duration} دقيقة</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                                لا يوجد محتوى مضاف بعد
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-hidden transform transition-all scale-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Icon
                      icon={editMode ? "solar:pen-bold" : "solar:add-circle-bold"}
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editMode ? "تعديل المحاضرة" : "إضافة محاضرة جديدة"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {editMode ? "تحديث بيانات المحاضرة الحالية" : "إدخال تفاصيل المحاضرة الجديدة"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    اسم المحاضرة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lectureForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="مثال: مقدمة في أساسيات البرمجة"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    الوصف
                  </label>
                  <textarea
                    value={lectureForm.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 min-h-[120px] resize-none"
                    placeholder="اكتب وصفاً مختصراً لمحتوى المحاضرة..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    الترتيب
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={lectureForm.position}
                      onChange={(e) => handleFormChange("position", Number(e.target.value))}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                      min={1}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Icon icon="solar:sort-vertical-bold" className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                <button
                  onClick={() => setFormOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !lectureForm.name?.trim()}
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Icon
                        icon={editMode ? "solar:check-circle-bold" : "solar:add-circle-bold"}
                        className="w-5 h-5"
                      />
                      <span>{editMode ? "حفظ التعديلات" : "إنشاء المحاضرة"}</span>
                    </>
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
