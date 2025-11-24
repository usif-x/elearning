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
  const [contentForm, setContentForm] = useState({
    content_type: "video",
    source: "",
    video_platform: "youtube",
    title: "",
    description: "",
    position: 1,
    quiz_duration: null,
    max_attempts: null,
    passing_score: null,
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
    setContentForm({
      content_type: "video",
      source: "",
      video_platform: "youtube",
      title: "",
      description: "",
      position: contents.length + 1,
      quiz_duration: null,
      max_attempts: null,
      passing_score: null,
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
    setContentForm({
      content_type: item?.content_type || "video",
      source: item?.source || "",
      video_platform: item?.video_platform || "youtube",
      title: item?.title || "",
      description: item?.description || "",
      position: Number(item?.position) || 1,
      quiz_duration: item?.quiz_duration ?? null,
      max_attempts: item?.max_attempts ?? null,
      passing_score: item?.passing_score ?? null,
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

      // Clean up payload based on type
      if (payload.content_type !== "quiz") {
        payload.quiz_duration = 0;
        payload.max_attempts = 0;
        payload.passing_score = 0;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <Icon
                  icon="solar:arrow-right-outline"
                  className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    إدارة محتوى المحاضرة
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                    {contents.length} محتوى
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  إضافة وتحرير وتنظيم محتوى المحاضرة التدريبية
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <Icon
                    icon="solar:search-bold"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="البحث..."
                    className="bg-transparent outline-none flex-1 text-gray-900 dark:text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">جميع الأنواع</option>
                <option value="video">فيديو</option>
                <option value="photo">صورة</option>
                <option value="file">ملف</option>
                <option value="link">رابط</option>
                <option value="quiz">اختبار</option>
              </select>

              {/* Add Button */}
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" /> إضافة
                محتوى
              </button>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {contents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon
                  icon="solar:book-bold"
                  className="w-10 h-10 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                لا يوجد محتوى
              </h3>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" /> إضافة
                المحتوى الأول
              </button>
            </div>
          ) : displayedContents.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                لا توجد نتائج
              </h3>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedContents.map((c, idx) => (
                <div
                  key={c.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Sorting */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                          >
                            <Icon
                              icon="solar:arrow-up-bold"
                              className="w-4 h-4"
                            />
                          </button>
                          <button
                            onClick={() => moveDown(idx)}
                            disabled={idx === displayedContents.length - 1}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                          >
                            <Icon
                              icon="solar:arrow-down-bold"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                          #{c.position}
                        </span>

                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Icon
                            icon={contentIcon(c.content_type)}
                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          />
                        </div>

                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {c.title || c.content_type}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium">
                              {c.content_type}
                            </span>
                            {c.content_type === "quiz" && (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                {c.quiz_duration
                                  ? `${c.quiz_duration} دقيقة`
                                  : "غير محدد"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {c.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {c.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md transition-all"
                      >
                        <Icon icon="solar:pen-bold" className="w-4 h-4" /> تعديل
                      </button>
                      <Link
                        href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content/${c.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all"
                      >
                        <Icon icon="solar:eye-bold" className="w-4 h-4" /> عرض
                      </Link>
                      <button
                        onClick={() => confirmDelete(c)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition-all"
                      >
                        <Icon icon="solar:trash-bold" className="w-4 h-4" /> حذف
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
