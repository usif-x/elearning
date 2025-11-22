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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            جاري تحميل بيانات المحاضرة...
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
                    تفاصيل المحاضرة
                  </h1>
                  {lecture?.id && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                      #{lecture.position}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                      {Array.isArray(lecture?.contents)
                        ? lecture.contents.length
                        : 0}{" "}
                      محتوى
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  إدارة وتحرير بيانات المحاضرة والمحتوى المرتبط بها
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
                  <Link
                    href={`/admin/dashboard/courses/${courseId}/lectures`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    المحاضرات
                  </Link>
                  <Icon
                    icon="solar:alt-arrow-left-bold"
                    className="w-4 h-4 mx-2"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {lecture?.name || "بدون اسم"}
                  </span>
                </nav>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Icon icon="solar:book-bold" className="w-5 h-5" />
                  إدارة المحتوى
                </Link>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  اسم المحاضرة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="أدخل اسم المحاضرة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  الوصف
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px] resize-none"
                  placeholder="وصف المحاضرة (اختياري)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  الترتيب
                </label>
                <input
                  type="number"
                  value={editForm.position}
                  onChange={(e) =>
                    handleChange("position", Number(e.target.value))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="1"
                  min={1}
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !editForm.name?.trim()}
                  className="flex-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الحفظ...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-4 h-4"
                      />
                      حفظ التغييرات
                    </div>
                  )}
                </button>
                <button
                  onClick={() =>
                    router.push(`/admin/dashboard/courses/${courseId}/lectures`)
                  }
                  className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Content Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Icon
                        icon="solar:book-bold"
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        محتوى المحاضرة
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        إدارة وتنظيم محتوى المحاضرة
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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
                          placeholder="البحث في المحتوى..."
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

                    {/* Type Filter */}
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                    >
                      <option value="all">جميع الأنواع</option>
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
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium"
                    >
                      <Icon icon={contentIcon(type)} className="w-4 h-4" />
                      {type}: {count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content List */}
              {filteredContents.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon
                      icon="solar:book-bold"
                      className="w-10 h-10 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {query || typeFilter !== "all"
                      ? "لا توجد نتائج"
                      : "لا يوجد محتوى"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {query || typeFilter !== "all"
                      ? "جرب تغيير معايير البحث"
                      : "ابدأ بإضافة محتوى جديد للمحاضرة"}
                  </p>
                  {!query && typeFilter === "all" && (
                    <Link
                      href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                      إضافة محتوى
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContents.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-6">
                        {/* Content Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            {/* Order Controls */}
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveContentUp(idx)}
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
                                onClick={() => moveContentDown(idx)}
                                disabled={idx === filteredContents.length - 1}
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
                              #{c.position}
                            </span>

                            {/* Content Type Icon */}
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Icon
                                icon={contentIcon(c.content_type)}
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                              />
                            </div>

                            {/* Content Title */}
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {c.title || c.content_type}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium">
                                  {c.content_type}
                                </span>
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
                          </div>

                          {/* Description */}
                          {c.description && (
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {c.description}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-center"
                          >
                            <Icon icon="solar:book-bold" className="w-4 h-4" />
                            إدارة
                          </Link>
                        </div>
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
