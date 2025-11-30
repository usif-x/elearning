"use client";

import {
  createContent,
  deleteContent,
  generateQuizFromPDF,
  generateQuizFromTopic,
  listContents,
  updateContent,
} from "@/services/admin/Lecutre";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const AdminLectureContentPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;
  const lectureId = params?.lectureId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contents, setContents] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Main Content Form
  // [UPDATED] Set default values for duration and attempts
  const [contentForm, setContentForm] = useState({
    content_type: "video",
    source: "",
    video_platform: "youtube",
    title: "",
    description: "",
    position: 1,
    quiz_duration: 10, // Default 10 mins
    max_attempts: 1, // Default 1 attempt
    passing_score: 50, // Default 50%
    show_correct_answers: 1,
    randomize_questions: 0,
    randomize_options: 0,
  });

  // AI Quiz Generation States
  const [activeTab, setActiveTab] = useState("topic");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Store generated data before saving
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [generatedSourceId, setGeneratedSourceId] = useState(null);

  const [reviewMode, setReviewMode] = useState(false);
  const [currentQuizSettings, setCurrentQuizSettings] = useState({});

  // Topic Form State
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    topic: "",
    num_questions: 5,
    difficulty: "medium",
    // Language removed
    quiz_duration: 10,
    max_attempts: 1,
    passing_score: 50,
    show_correct_answers: 1,
    randomize_questions: 0,
    randomize_options: 0,
  });

  // PDF Form State
  const [pdfForm, setPdfForm] = useState({
    title: "",
    description: "",
    pdf_file: null,
    num_questions: 5,
    difficulty: "medium",
    // Language removed
    quiz_duration: 10,
    max_attempts: 1,
    passing_score: 50,
    show_correct_answers: 1,
    randomize_questions: 0,
    randomize_options: 0,
  });

  const fetchContents = async () => {
    if (!courseId || !lectureId) return;
    setLoading(true);
    setError("");
    try {
      const data = await listContents(courseId, lectureId, 1, 100);

      const items = Array.isArray(data?.contents)
        ? data.contents
        : Array.isArray(data?.items)
        ? data.items
        : [];

      const sorted = [...items].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );
      setContents(sorted);
    } catch (e) {
      console.error(e);
      setError("فشل تحميل المحتوى");
      toast.error("فشل تحميل المحتوى");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [courseId, lectureId]);

  const openCreate = () => {
    setEditMode(false);
    setCurrentItem(null);
    // [UPDATED] Initialize with defaults
    setContentForm({
      content_type: "video",
      source: "",
      video_platform: "youtube",
      title: "",
      description: "",
      position: contents.length + 1,
      quiz_duration: 10, // Default
      max_attempts: 1, // Default
      passing_score: 50, // Default
      show_correct_answers: 1,
      randomize_questions: 0,
      randomize_options: 0,
    });

    // Reset AI States
    setActiveTab("topic");
    setGenerating(false);
    setProgress(0);
    setProgressText("");
    setGeneratedQuestions([]);
    setReviewMode(false);

    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    // [UPDATED] Use existing values or fallback to defaults
    setContentForm({
      content_type: item?.content_type || "video",
      source: item?.source || "",
      video_platform: item?.video_platform || "youtube",
      title: item?.title || "",
      description: item?.description || "",
      position: Number(item?.position) || 1,
      quiz_duration: item?.quiz_duration ?? 10,
      max_attempts: item?.max_attempts ?? 1,
      passing_score: item?.passing_score ?? 50,
      show_correct_answers: item?.show_correct_answers ?? 1,
      randomize_questions: item?.randomize_questions ?? 0,
      randomize_options: item?.randomize_options ?? 0,
    });
    setReviewMode(false);
    setGeneratedQuestions([]);
    setFormOpen(true);
  };

  const handleFormChange = (field, value) => {
    setContentForm((prev) => ({ ...prev, [field]: value }));
  };

  // ==========================================
  // MANUAL CREATION / UPDATE
  // ==========================================
  const handleSubmit = async () => {
    if (!courseId || !lectureId) return;
    if (!contentForm.title?.trim()) {
      toast.error("يرجى إدخال عنوان المحتوى");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...contentForm };

      // [UPDATED] Ensure defaults are sent for ALL content types (Video, Audio, etc.)
      // We do NOT zero these out anymore.
      payload.quiz_duration = Number(payload.quiz_duration) || 10;
      payload.max_attempts = Number(payload.max_attempts) || 1;
      payload.passing_score = Number(payload.passing_score) || 50;

      // Only clear questions array if it's not a quiz
      if (payload.content_type !== "quiz") {
        payload.questions = [];
      }

      if (editMode && currentItem?.id) {
        await updateContent(courseId, lectureId, currentItem.id, payload);
        toast.success("تم تحديث المحتوى");
      } else {
        await createContent(courseId, lectureId, payload);
        toast.success("تم إنشاء المحتوى");
      }
      setFormOpen(false);
      await fetchContents();
    } catch (e) {
      console.error(e);
      toast.error("فشل حفظ المحتوى");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // AI GENERATION LOGIC
  // ==========================================

  const runGenerationProgress = (steps, apiCall) => {
    setGenerating(true);
    setProgress(0);
    setProgressText(steps[0]);

    let currentStep = 0;
    const totalSteps = steps.length;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps - 1) {
        setProgressText(steps[currentStep]);
        setProgress(Math.round((currentStep / totalSteps) * 90));
      }
    }, 1500);

    apiCall()
      .then((response) => {
        clearInterval(interval);
        setProgress(100);
        setProgressText("تم الانتهاء!");

        if (response && response.questions && response.questions.length > 0) {
          setGeneratedQuestions(response.questions);
          setGeneratedSourceId(response.source_id);
          setReviewMode(true);
          toast.success(`تم توليد ${response.questions.length} سؤال`);
        } else {
          toast.warn("لم يقم الذكاء الاصطناعي بتوليد أي أسئلة.");
        }
      })
      .catch((err) => {
        clearInterval(interval);
        console.error(err);
        toast.error(
          err?.response?.data?.detail?.[0]?.msg || "فشل في توليد الأسئلة"
        );
      })
      .finally(() => {
        setGenerating(false);
      });
  };

  // GENERATE FROM TOPIC
  const handleGenerateFromTopic = () => {
    if (!topicForm.topic?.trim() || !topicForm.title?.trim()) {
      toast.error("يرجى إدخال الموضوع والعنوان");
      return;
    }

    setCurrentQuizSettings({
      title: topicForm.title,
      description: topicForm.description,
      quiz_duration: parseInt(topicForm.quiz_duration),
      max_attempts: parseInt(topicForm.max_attempts),
      passing_score: parseInt(topicForm.passing_score),
      show_correct_answers: parseInt(topicForm.show_correct_answers),
      randomize_questions: parseInt(topicForm.randomize_questions),
      randomize_options: parseInt(topicForm.randomize_options),
      position: contents.length + 1,
    });

    const steps = [
      "تحليل الموضوع...",
      "توليد الأسئلة...",
      "تنسيق الإجابات...",
      "المراجعة النهائية...",
    ];

    const apiCall = async () => {
      const payload = {
        lecture_id: parseInt(lectureId),
        topic: topicForm.topic,
        count: parseInt(topicForm.num_questions),
        difficulty: topicForm.difficulty,
        // [UPDATED] Removed 'notes' completely as system prompt handles it
      };
      return await generateQuizFromTopic(courseId, payload);
    };

    runGenerationProgress(steps, apiCall);
  };

  // GENERATE FROM PDF
  const handleGenerateFromPDF = () => {
    if (!pdfForm.pdf_file || !pdfForm.title?.trim()) {
      toast.error("يرجى اختيار ملف PDF وإدخال العنوان");
      return;
    }

    setCurrentQuizSettings({
      title: pdfForm.title,
      description: pdfForm.description,
      quiz_duration: parseInt(pdfForm.quiz_duration),
      max_attempts: parseInt(pdfForm.max_attempts),
      passing_score: parseInt(pdfForm.passing_score),
      show_correct_answers: parseInt(pdfForm.show_correct_answers),
      randomize_questions: parseInt(pdfForm.randomize_questions),
      randomize_options: parseInt(pdfForm.randomize_options),
      position: contents.length + 1,
    });

    const steps = [
      "جاري رفع الملف...",
      "استخراج النصوص...",
      "توليد الأسئلة...",
      "جاري الانتهاء...",
    ];

    const apiCall = async () => {
      const params = {
        lecture_id: parseInt(lectureId),
        count: parseInt(pdfForm.num_questions),
        difficulty: pdfForm.difficulty,
        // [UPDATED] Removed 'notes' completely as system prompt handles it
      };
      return await generateQuizFromPDF(courseId, pdfForm.pdf_file, params);
    };

    runGenerationProgress(steps, apiCall);
  };

  // FINAL SAVE
  const handleCreateFromReviewedQuestions = async () => {
    if (generatedQuestions.length === 0) {
      toast.error("لا توجد أسئلة للإنشاء");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        content_type: "quiz",
        ...currentQuizSettings,
        questions: generatedQuestions,
        source: generatedSourceId ? String(generatedSourceId) : "",
        video_platform: "",
      };

      await createContent(courseId, lectureId, payload);

      toast.success("تم نشر الاختبار بنجاح!");
      setFormOpen(false);
      setReviewMode(false);
      setGeneratedQuestions([]);
      setCurrentQuizSettings({});
      await fetchContents();
    } catch (error) {
      console.error("Error creating quiz content:", error);
      toast.error(
        error?.response?.data?.detail?.[0]?.msg ||
          "حدث خطأ أثناء إنشاء الاختبار"
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (item) => {
    if (!courseId || !lectureId || !item?.id) return;
    const ok = window.confirm(
      `هل تريد حذف المحتوى: ${item.title || item.content_type}?`
    );
    if (!ok) return;
    try {
      await deleteContent(courseId, lectureId, item.id);
      toast.success("تم حذف المحتوى");
      await fetchContents();
    } catch (e) {
      console.error(e);
      toast.error("فشل حذف المحتوى");
    }
  };

  const moveUp = async (index) => {
    if (index <= 0) return;
    const a = contents[index - 1];
    const b = contents[index];
    try {
      await updateContent(courseId, lectureId, a.id, { position: b.position });
      await updateContent(courseId, lectureId, b.id, { position: a.position });
      toast.success("تم تعديل ترتيب المحتوى");
      await fetchContents();
    } catch (e) {
      console.error(e);
      toast.error("فشل تعديل الترتيب");
    }
  };

  const moveDown = async (index) => {
    if (index >= contents.length - 1) return;
    const a = contents[index];
    const b = contents[index + 1];
    try {
      await updateContent(courseId, lectureId, a.id, { position: b.position });
      await updateContent(courseId, lectureId, b.id, { position: a.position });
      toast.success("تم تعديل ترتيب المحتوى");
      await fetchContents();
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

  const displayedContents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? contents.filter((c) => (c?.title || "").toLowerCase().includes(q))
      : contents;
    if (typeFilter === "all") return list;
    return list.filter(
      (c) => (c?.content_type || "").toLowerCase() === typeFilter
    );
  }, [contents, query, typeFilter]);

  if (loading && contents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            جاري تحميل المحتوى...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
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
                  إدارة المحتوى
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-100 dark:border-emerald-800">
                  {contents.length} محتوى
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                إضافة وتنظيم محتوى المحاضرة التدريبية
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
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
                placeholder="البحث في المحتوى..."
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

            {/* Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            >
              <option value="all">جميع الأنواع</option>
              <option value="video">فيديو</option>
              <option value="audio">صوت</option>
              <option value="photo">صورة</option>
              <option value="file">ملف</option>
              <option value="link">رابط</option>
              <option value="quiz">اختبار</option>
            </select>

            {/* Add Button */}
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all"
            >
              <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
              إضافة محتوى
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {contents.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon
                  icon="solar:layers-minimalistic-bold"
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                لا يوجد محتوى
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                ابدأ بإضافة المحتوى الأول لهذه المحاضرة
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transform hover:-translate-y-1 transition-all"
              >
                <Icon icon="solar:add-circle-bold" className="w-6 h-6" />
                إضافة المحتوى الأول
              </button>
            </div>
          ) : displayedContents.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="solar:magnifer-linear"
                  className="w-10 h-10 text-gray-400"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                جرب تغيير معايير البحث أو الفلتر
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayedContents.map((c, idx) => (
                <div
                  key={c.id}
                  className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200 group"
                >
                  <div className="flex items-start gap-6">
                    {/* Sorting Controls */}
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Icon icon="solar:alt-arrow-up-bold" className="w-5 h-5" />
                      </button>
                      <span className="text-center text-sm font-bold text-gray-400 font-mono">
                        {c.position}
                      </span>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === displayedContents.length - 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Icon icon="solar:alt-arrow-down-bold" className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                      <Icon
                        icon={contentIcon(c.content_type)}
                        className="w-7 h-7 text-blue-600 dark:text-blue-400"
                      />
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          {c.title || c.content_type}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium shrink-0 border border-gray-200 dark:border-gray-600">
                          {c.content_type}
                        </span>
                        {c.quiz_duration > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium shrink-0 border border-emerald-200 dark:border-emerald-800">
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                        title="تعديل"
                      >
                        <Icon icon="solar:pen-bold" className="w-5 h-5" />
                      </button>
                      <Link
                        href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content/${c.id}`}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"
                        title="عرض التفاصيل"
                      >
                        <Icon icon="solar:eye-bold" className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => confirmDelete(c)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="حذف"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Form */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Icon
                      icon={
                        reviewMode
                          ? "solar:clipboard-check-bold"
                          : editMode
                          ? "solar:pen-bold"
                          : "solar:add-circle-bold"
                      }
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {reviewMode
                      ? "مراجعة الاختبار"
                      : editMode
                      ? "تعديل المحتوى"
                      : "إضافة محتوى"}
                  </h2>
                </div>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-6 h-6 text-gray-500"
                  />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {reviewMode ? (
                  // --- REVIEW MODE ---
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                      <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-lg">
                        ملخص: {currentQuizSettings.title}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
                        <p>
                          عدد الأسئلة:{" "}
                          <span className="font-bold">
                            {generatedQuestions.length}
                          </span>
                        </p>
                        <p>
                          المدة:{" "}
                          <span className="font-bold">
                            {currentQuizSettings.quiz_duration} دقيقة
                          </span>
                        </p>
                        <p>
                          درجة النجاح:{" "}
                          <span className="font-bold">
                            {currentQuizSettings.passing_score}%
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {generatedQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 dark:border-gray-700 p-5 rounded-xl bg-white dark:bg-gray-800 shadow-sm"
                        >
                          <div className="flex gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm">
                              {i + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white mb-3 text-lg">
                                {q.question}
                              </p>
                              <div className="space-y-2">
                                {q.options.map((opt, oi) => (
                                  <div
                                    key={oi}
                                    className={`flex items-center p-3 rounded-lg border ${
                                      oi === q.correct_answer
                                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                        : "border-gray-100 dark:border-gray-700"
                                    }`}
                                  >
                                    <div
                                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                                        oi === q.correct_answer
                                          ? "border-green-500 bg-green-500 text-white"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {oi === q.correct_answer && (
                                        <Icon icon="solar:check-read-linear" />
                                      )}
                                    </div>
                                    <span
                                      className={
                                        oi === q.correct_answer
                                          ? "font-medium text-green-900 dark:text-green-300"
                                          : "text-gray-700 dark:text-gray-300"
                                      }
                                    >
                                      {opt}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // --- FORM MODE ---
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-900 dark:text-white">
                        نوع المحتوى
                      </label>
                      <select
                        value={contentForm.content_type}
                        onChange={(e) => {
                          handleFormChange("content_type", e.target.value);
                          if (e.target.value !== "quiz") {
                            setGenerating(false);
                            setActiveTab("topic");
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="video">فيديو</option>
                        <option value="audio">صوت</option>{" "}
                        {/* Added Audio Option */}
                        <option value="photo">صورة</option>
                        <option value="file">ملف</option>
                        <option value="link">رابط</option>
                        <option value="quiz">اختبار (AI)</option>
                      </select>
                    </div>

                    {/* Normal Content Form */}
                    {contentForm.content_type !== "quiz" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">العنوان</label>
                          <input
                            type="text"
                            placeholder="عنوان المحتوى"
                            value={contentForm.title}
                            onChange={(e) =>
                              handleFormChange("title", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">الوصف</label>
                          <textarea
                            placeholder="وصف المحتوى"
                            value={contentForm.description}
                            onChange={(e) =>
                              handleFormChange("description", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            المصدر / الرابط
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={contentForm.source}
                            onChange={(e) =>
                              handleFormChange("source", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        {contentForm.content_type === "video" && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              منصة الفيديو
                            </label>
                            <input
                              type="text"
                              placeholder="youtube, vimeo..."
                              value={contentForm.video_platform}
                              onChange={(e) =>
                                handleFormChange(
                                  "video_platform",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quiz AI Form */}
                    {contentForm.content_type === "quiz" && (
                      <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                          <button
                            onClick={() => setActiveTab("topic")}
                            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                              activeTab === "topic"
                                ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300"
                                : "text-gray-500"
                            }`}
                          >
                            موضوع
                          </button>
                          <button
                            onClick={() => setActiveTab("pdf")}
                            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                              activeTab === "pdf"
                                ? "bg-white dark:bg-gray-600 shadow-sm text-purple-600 dark:text-purple-300"
                                : "text-gray-500"
                            }`}
                          >
                            ملف PDF
                          </button>
                        </div>

                        {generating ? (
                          <div className="text-center py-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="font-medium text-blue-800 dark:text-blue-300">
                              {progressText}
                            </p>
                            <div className="w-64 h-2 bg-blue-200 dark:bg-blue-800 rounded-full mx-auto mt-4 overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : activeTab === "topic" ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                العنوان
                              </label>
                              <input
                                type="text"
                                value={topicForm.title}
                                onChange={(e) =>
                                  setTopicForm({
                                    ...topicForm,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                موضوع الاختبار
                              </label>
                              <textarea
                                value={topicForm.topic}
                                onChange={(e) =>
                                  setTopicForm({
                                    ...topicForm,
                                    topic: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 min-h-[120px]"
                                placeholder="اكتب الموضوع أو النص هنا..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  عدد الأسئلة
                                </label>
                                <select
                                  value={topicForm.num_questions}
                                  onChange={(e) =>
                                    setTopicForm({
                                      ...topicForm,
                                      num_questions: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                                >
                                  <option value="5">5 أسئلة</option>
                                  <option value="10">10 أسئلة</option>
                                  <option value="15">15 سؤال</option>
                                  <option value="20">20 سؤال</option>
                                  <option value="25">25 سؤال</option>
                                  <option value="30">30 سؤال</option>
                                  <option value="35">35 سؤال</option>
                                  <option value="40">40 سؤال</option>
                                  <option value="45">45 سؤال</option>
                                  <option value="50">50 سؤال</option>
                                  <option value="55">55 سؤال</option>
                                  <option value="60">60 سؤال</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  الصعوبة
                                </label>
                                <select
                                  value={topicForm.difficulty}
                                  onChange={(e) =>
                                    setTopicForm({
                                      ...topicForm,
                                      difficulty: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                                >
                                  <option value="easy">سهل</option>
                                  <option value="medium">متوسط</option>
                                  <option value="hard">صعب</option>
                                </select>
                              </div>
                            </div>
                            <button
                              onClick={handleGenerateFromTopic}
                              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <Icon
                                icon="solar:magic-stick-3-bold-duotone"
                                className="w-6 h-6"
                              />{" "}
                              توليد الأسئلة (AI)
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                العنوان
                              </label>
                              <input
                                type="text"
                                value={pdfForm.title}
                                onChange={(e) =>
                                  setPdfForm({
                                    ...pdfForm,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                ملف PDF
                              </label>
                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-purple-500 transition-colors bg-gray-50 dark:bg-gray-700">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) =>
                                    setPdfForm({
                                      ...pdfForm,
                                      pdf_file: e.target.files[0],
                                    })
                                  }
                                  className="hidden"
                                  id="pdf-upload"
                                />
                                <label
                                  htmlFor="pdf-upload"
                                  className="cursor-pointer flex flex-col items-center"
                                >
                                  <Icon
                                    icon="solar:file-text-bold-duotone"
                                    className="w-10 h-10 text-purple-500 mb-2"
                                  />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {pdfForm.pdf_file
                                      ? pdfForm.pdf_file.name
                                      : "اضغط لرفع ملف PDF"}
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  عدد الأسئلة
                                </label>
                                <select
                                  value={pdfForm.num_questions}
                                  onChange={(e) =>
                                    setPdfForm({
                                      ...pdfForm,
                                      num_questions: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                                >
                                  <option value="5">5 أسئلة</option>
                                  <option value="10">10 أسئلة</option>
                                  <option value="15">15 سؤال</option>
                                  <option value="20">20 سؤال</option>
                                  <option value="25">25 سؤال</option>
                                  <option value="30">30 سؤال</option>
                                  <option value="35">35 سؤال</option>
                                  <option value="40">40 سؤال</option>
                                  <option value="45">45 سؤال</option>
                                  <option value="50">50 سؤال</option>
                                  <option value="55">55 سؤال</option>
                                  <option value="60">60 سؤال</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  الصعوبة
                                </label>
                                <select
                                  value={pdfForm.difficulty}
                                  onChange={(e) =>
                                    setPdfForm({
                                      ...pdfForm,
                                      difficulty: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700"
                                >
                                  <option value="easy">سهل</option>
                                  <option value="medium">متوسط</option>
                                  <option value="hard">صعب</option>
                                </select>
                              </div>
                            </div>
                            <button
                              onClick={handleGenerateFromPDF}
                              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <Icon
                                icon="solar:magic-stick-3-bold-duotone"
                                className="w-6 h-6"
                              />{" "}
                              توليد من PDF (AI)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                {reviewMode ? (
                  <>
                    <button
                      onClick={() => setReviewMode(false)}
                      className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      تعديل الإعدادات
                    </button>
                    <button
                      onClick={handleCreateFromReviewedQuestions}
                      disabled={saving}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg transition-all flex items-center gap-2"
                    >
                      {saving && <Icon icon="line-md:loading-loop" />}
                      {saving ? "جاري النشر..." : "نشر الاختبار"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setFormOpen(false)}
                      className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      إلغاء
                    </button>
                    {contentForm.content_type !== "quiz" && (
                      <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg transition-all flex items-center gap-2"
                      >
                        {saving && <Icon icon="line-md:loading-loop" />}
                        {saving ? "جاري الحفظ..." : "حفظ"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLectureContentPage;
