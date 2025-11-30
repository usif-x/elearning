"use client";

import {
  getLecture,
  updateContent,
  updateLecture,
} from "@/services/admin/Lecutre";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const AdminLectureDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;
  const lectureId = params?.lectureId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lecture, setLecture] = useState(null);
  const [error, setError] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    position: 1,
  });
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchLecture = async () => {
    if (!courseId || !lectureId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getLecture(courseId, lectureId);
      const sortedContents = Array.isArray(data?.contents)
        ? [...data.contents].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0)
          )
        : [];
      const normalized = { ...data, contents: sortedContents };
      setLecture(normalized);
      setEditForm({
        name: data?.name || "",
        description: data?.description || "",
        position: Number(data?.position) || 1,
      });
    } catch (e) {
      console.error(e);
      setError("فشل تحميل بيانات المحاضرة");
      toast.error("فشل تحميل بيانات المحاضرة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecture();
  }, [courseId, lectureId]);

  const handleChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!courseId || !lectureId) return;
    if (!editForm.name?.trim()) {
      toast.error("يرجى إدخال اسم المحاضرة");
      return;
    }
    setSaving(true);
    try {
      await updateLecture(courseId, lectureId, editForm);
      toast.success("تم حفظ بيانات المحاضرة");
      await fetchLecture();
    } catch (e) {
      console.error(e);
      toast.error("فشل حفظ بيانات المحاضرة");
    } finally {
      setSaving(false);
    }
  };

  const moveContentUp = async (index) => {
    if (!lecture || index <= 0) return;
    const a = lecture.contents[index - 1];
    const b = lecture.contents[index];
    try {
      await updateContent(courseId, lectureId, a.id, { position: b.position });
      await updateContent(courseId, lectureId, b.id, { position: a.position });
      toast.success("تم تعديل ترتيب المحتوى");
      await fetchLecture();
    } catch (e) {
      console.error(e);
      toast.error("فشل تعديل الترتيب");
    }
  };

  const moveContentDown = async (index) => {
    if (!lecture || index >= lecture.contents.length - 1) return;
    const a = lecture.contents[index];
    const b = lecture.contents[index + 1];
    try {
      await updateContent(courseId, lectureId, a.id, { position: b.position });
      await updateContent(courseId, lectureId, b.id, { position: a.position });
      toast.success("تم تعديل ترتيب المحتوى");
      await fetchLecture();
    } catch (e) {
      console.error(e);
      toast.error("فشل تعديل الترتيب");
    }
  };

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

  const filteredContents = useMemo(() => {
    const list = Array.isArray(lecture?.contents) ? lecture.contents : [];
    const q = query.trim().toLowerCase();
    const byQuery = q
      ? list.filter((c) => (c?.title || "").toLowerCase().includes(q))
      : list;
    if (typeFilter === "all") return byQuery;
    return byQuery.filter(
      (c) => (c?.content_type || "").toLowerCase() === typeFilter
    );
  }, [lecture, query, typeFilter]);

  const typeCounts = useMemo(() => {
    const list = Array.isArray(lecture?.contents) ? lecture.contents : [];
    return list.reduce((acc, c) => {
      const t = (c.content_type || "other").toLowerCase();
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
  }, [lecture]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            جاري تحميل بيانات المحاضرة...
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
                  تفاصيل المحاضرة
                </h1>
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800">
                  #{lecture?.position}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-100 dark:border-emerald-800">
                  {Array.isArray(lecture?.contents) ? lecture.contents.length : 0} محتوى
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                إدارة وتحرير بيانات المحاضرة والمحتوى
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
            >
              <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
              إدارة المحتوى
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Edit Form */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Icon
                    icon="solar:pen-bold"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  تعديل المحاضرة
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    اسم المحاضرة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="أدخل اسم المحاضرة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 min-h-[120px] resize-none"
                    placeholder="وصف المحاضرة (اختياري)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={editForm.position}
                    onChange={(e) => handleChange("position", Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                    min={1}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => router.push(`/admin/dashboard/courses/${courseId}/lectures`)}
                    className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editForm.name?.trim()}
                    className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Icon icon="svg-spinners:ring-resize" className="w-4 h-4" />
                        <span>جاري...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                        <span>حفظ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Content List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Content Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                      <Icon
                        icon="solar:layers-minimalistic-bold"
                        className="w-5 h-5 text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        محتوى المحاضرة
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        إدارة وتنظيم محتوى المحاضرة
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="البحث..."
                        className="w-full sm:w-48 pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white text-sm"
                      />
                      <Icon
                        icon="solar:magnifer-linear"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      />
                    </div>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">الكل</option>
                      <option value="video">فيديو</option>
                      <option value="photo">صورة</option>
                      <option value="file">ملف</option>
                      <option value="audio">صوت</option>
                      <option value="link">رابط</option>
                      <option value="quiz">اختبار</option>
                    </select>
                  </div>
                </div>

                {/* Type Counts */}
                {Object.keys(typeCounts).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(typeCounts).map(([type, count]) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-gray-600"
                      >
                        <Icon icon={contentIcon(type)} className="w-3.5 h-3.5" />
                        <span className="capitalize">{type}</span>
                        <span className="bg-white dark:bg-gray-600 px-1.5 rounded-md text-[10px] font-bold">
                          {count}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content List */}
              {filteredContents.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon
                      icon="solar:layers-minimalistic-bold"
                      className="w-12 h-12 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {query || typeFilter !== "all" ? "لا توجد نتائج" : "لا يوجد محتوى"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                    {query || typeFilter !== "all"
                      ? "جرب تغيير معايير البحث"
                      : "ابدأ بإضافة محتوى جديد للمحاضرة"}
                  </p>
                  {!query && typeFilter === "all" && (
                    <Link
                      href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content`}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Icon icon="solar:add-circle-bold" className="w-6 h-6" />
                      إضافة محتوى
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredContents.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200 group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1 pt-1">
                          <button
                            onClick={() => moveContentUp(idx)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Icon icon="solar:alt-arrow-up-bold" className="w-4 h-4" />
                          </button>
                          <span className="text-center text-xs font-bold text-gray-400 font-mono">
                            {c.position}
                          </span>
                          <button
                            onClick={() => moveContentDown(idx)}
                            disabled={idx === filteredContents.length - 1}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Icon icon="solar:alt-arrow-down-bold" className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Content Icon */}
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                          <Icon
                            icon={contentIcon(c.content_type)}
                            className="w-6 h-6 text-blue-600 dark:text-blue-400"
                          />
                        </div>

                        {/* Content Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                              {c.title || c.content_type}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium shrink-0">
                              {c.content_type}
                            </span>
                            {c.content_type === "quiz" && c.quiz_duration && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs shrink-0">
                                <Icon icon="solar:clock-circle-bold" className="w-3 h-3" />
                                {c.quiz_duration} دقيقة
                              </span>
                            )}
                          </div>
                          {c.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {c.description}
                            </p>
                          )}
                        </div>

                        {/* Action Button */}
                        <Link
                          href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content/${c.id}`}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all shrink-0"
                          title="تعديل"
                        >
                          <Icon icon="solar:pen-bold" className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLectureDetailPage;
