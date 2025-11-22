"use client";

import Switcher from "@/components/ui/Switcher";
import {
  createContent,
  deleteContent,
  listContents,
  updateContent,
  generateQuizFromTopic,
  generateQuizFromPDF,
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
  const [generatedSourceId, setGeneratedSourceId] = useState(null); // To store source_id from response if needed
  
  const [reviewMode, setReviewMode] = useState(false);
  const [currentQuizSettings, setCurrentQuizSettings] = useState({});

  // Topic Form State
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    topic: "",
    num_questions: 10,
    difficulty: "medium",
    language: "ar",
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
    num_questions: 10,
    difficulty: "medium",
    language: "ar",
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
      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.contents)
        ? data.contents
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
    // Standard content form reset
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

    // AI States reset
    setActiveTab("topic");
    setGenerating(false);
    setProgress(0);
    setProgressText("");
    setGeneratedQuestions([]);
    setGeneratedSourceId(null);
    setReviewMode(false);
    setCurrentQuizSettings({});

    // Reset specific forms
    const defaultQuizSettings = {
      title: "",
      description: "",
      num_questions: 10,
      difficulty: "medium",
      language: "ar",
      quiz_duration: 10,
      max_attempts: 1,
      passing_score: 50,
      show_correct_answers: 1,
      randomize_questions: 0,
      randomize_options: 0,
    };

    setTopicForm({ ...defaultQuizSettings, topic: "" });
    setPdfForm({ ...defaultQuizSettings, pdf_file: null });

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
    
    // Clean AI states
    setReviewMode(false);
    setGeneratedQuestions([]);
    setGeneratedSourceId(null);
    
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
      
      // Sanitize payload based on type
      if (payload.content_type !== "quiz") {
        payload.quiz_duration = null;
        payload.max_attempts = null;
        payload.passing_score = null;
        payload.show_correct_answers = Number(payload.show_correct_answers) || 0;
        payload.randomize_questions = Number(payload.randomize_questions) || 0;
        payload.randomize_options = Number(payload.randomize_options) || 0;
      } else {
        // Manual quiz entry via JSON source
        if (payload.source && typeof payload.source === "string") {
          try {
            const questions = JSON.parse(payload.source);
            payload.questions = questions;
            payload.source = null; 
          } catch (e) {
            // If it's not JSON, maybe it's just a placeholder, but for quiz type expected questions array
            // If editing existing, questions might not be loaded here fully depending on list API
          }
        }
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
    
    let currentStep = 0;
    const totalSteps = steps.length;
    // Update UI text immediately
    setProgressText(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps - 1) {
        setProgressText(steps[currentStep]);
        setProgress(Math.round((currentStep / totalSteps) * 90)); // Go up to 90%
      }
    }, 800);

    // Execute actual API call
    apiCall()
      .then((response) => {
        clearInterval(interval);
        setProgress(100);
        setProgressText(steps[totalSteps - 1]);
        
        setTimeout(() => {
            // Handle Success
            if(response && response.questions) {
                setGeneratedQuestions(response.questions);
                setGeneratedSourceId(response.source_id || null);
                setReviewMode(true);
                toast.success("تم إنشاء الأسئلة بنجاح!");
            } else {
                toast.warn("لم يتم العثور على أسئلة في الاستجابة");
            }
            setGenerating(false);
        }, 500);
      })
      .catch((err) => {
        clearInterval(interval);
        setGenerating(false);
        setProgress(0);
        console.error(err);
        toast.error(err.message || "فشل في توليد الأسئلة");
      });
  };

  const handleGenerateFromTopic = () => {
    if (!topicForm.topic?.trim() || !topicForm.title?.trim()) {
      toast.error("يرجى إدخال الموضوع والعنوان");
      return;
    }

    // Save settings for Step 2
    setCurrentQuizSettings({
      title: topicForm.title,
      description: topicForm.description,
      quiz_duration: parseInt(topicForm.quiz_duration),
      max_attempts: parseInt(topicForm.max_attempts),
      passing_score: parseInt(topicForm.passing_score),
      show_correct_answers: topicForm.show_correct_answers,
      randomize_questions: topicForm.randomize_questions,
      randomize_options: topicForm.randomize_options,
      position: contents.length + 1,
    });

    const steps = [
      "جاري الاتصال بالذكاء الاصطناعي...",
      "تحليل الموضوع والنص...",
      "صياغة الأسئلة والخيارات...",
      "تحديد الإجابات الصحيحة...",
      "جاري الانتهاء...",
    ];

    const apiCall = async () => {
        const payload = {
            topic: topicForm.topic,
            count: parseInt(topicForm.num_questions),
            difficulty: topicForm.difficulty,
            notes: topicForm.language === "ar" ? "Generate in Arabic" : "Generate in English",
        };
        return await generateQuizFromTopic(courseId, payload);
    };

    runGenerationProgress(steps, apiCall);
  };

  const handleGenerateFromPDF = () => {
    if (!pdfForm.pdf_file || !pdfForm.title?.trim()) {
      toast.error("يرجى اختيار ملف PDF وإدخال العنوان");
      return;
    }

    // Save settings for Step 2
    setCurrentQuizSettings({
        title: pdfForm.title,
        description: pdfForm.description,
        quiz_duration: parseInt(pdfForm.quiz_duration),
        max_attempts: parseInt(pdfForm.max_attempts),
        passing_score: parseInt(pdfForm.passing_score),
        show_correct_answers: pdfForm.show_correct_answers,
        randomize_questions: pdfForm.randomize_questions,
        randomize_options: pdfForm.randomize_options,
        position: contents.length + 1,
    });

    const steps = [
        "جاري رفع الملف...",
        "استخراج النصوص من PDF...",
        "تحليل المحتوى...",
        "إنشاء الأسئلة...",
        "جاري الانتهاء...",
    ];

    const apiCall = async () => {
        const params = {
            lecture_id: parseInt(lectureId),
            count: parseInt(pdfForm.num_questions),
            difficulty: pdfForm.difficulty,
            notes: pdfForm.language === "ar" ? "Generate in Arabic" : "Generate in English",
        };
        return await generateQuizFromPDF(courseId, pdfForm.pdf_file, params);
    };

    runGenerationProgress(steps, apiCall);
  };

  // ==========================================
  // STEP 2: CREATE CONTENT FROM GENERATED DATA
  // ==========================================
  const handleCreateFromReviewedQuestions = async () => {
    if (generatedQuestions.length === 0) {
      toast.error("لا توجد أسئلة للإنشاء");
      return;
    }

    setSaving(true);
    try {
      // Prepare payload adhering to createContent schema
      const payload = {
        content_type: "quiz",
        ...currentQuizSettings,
        questions: generatedQuestions,
        // If source_id exists (from PDF), we can send it as source string or ignore depending on backend requirement.
        // Usually source for quiz is optional if questions are provided.
        source: generatedSourceId ? String(generatedSourceId) : "", 
        video_platform: "",
      };

      await createContent(courseId, lectureId, payload);
      
      toast.success("تم إنشاء الاختبار بنجاح!");
      setFormOpen(false);
      setReviewMode(false);
      setGeneratedQuestions([]);
      setCurrentQuizSettings({});
      await fetchContents();
    } catch (error) {
      console.error("Error creating quiz content:", error);
      toast.error("حدث خطأ أثناء إنشاء الاختبار");
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
      case "video": return "solar:videocamera-bold";
      case "photo": return "solar:gallery-bold";
      case "file": return "solar:document-bold";
      case "audio": return "solar:music-note-2-bold";
      case "link": return "solar:link-bold";
      case "quiz": return "solar:checklist-minimalistic-bold";
      default: return "solar:menu-dots-bold";
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

  if (loading) {
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
                    <button onClick={() => setQuery("")}>
                      <Icon icon="solar:close-circle-bold" className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter */}
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

              {/* Add Button */}
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                إضافة محتوى
              </button>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {contents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon icon="solar:book-bold" className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لا يوجد محتوى</h3>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                إضافة المحتوى الأول
              </button>
            </div>
          ) : displayedContents.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">لا توجد نتائج</h3>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedContents.map((c, idx) => (
                <div key={c.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Sorting */}
                        <div className="flex flex-col gap-1">
                          <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50">
                            <Icon icon="solar:arrow-up-bold" className="w-4 h-4" />
                          </button>
                          <button onClick={() => moveDown(idx)} disabled={idx === displayedContents.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50">
                            <Icon icon="solar:arrow-down-bold" className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                          #{c.position}
                        </span>
                        
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Icon icon={contentIcon(c.content_type)} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                                  {c.quiz_duration ? `${c.quiz_duration} دقيقة` : 'غير محدد'}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {c.description && <p className="text-gray-600 dark:text-gray-400 mb-3">{c.description}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button onClick={() => openEdit(c)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md">
                        <Icon icon="solar:pen-bold" className="w-4 h-4" /> تعديل
                      </button>
                      <Link href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content/${c.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md">
                        <Icon icon="solar:eye-bold" className="w-4 h-4" /> عرض
                      </Link>
                      <button onClick={() => confirmDelete(c)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md">
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
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Icon icon={editMode ? "solar:pen-bold" : "solar:add-circle-bold"} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {reviewMode ? "مراجعة الأسئلة المولدة" : editMode ? "تعديل المحتوى" : "إضافة محتوى جديد"}
                  </h2>
                </div>
                <button onClick={() => setFormOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                
                {/* Review Mode View */}
                {reviewMode ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">ملخص الإعدادات</h3>
                            <div className="text-sm text-blue-700 dark:text-blue-400 grid grid-cols-2 gap-2">
                                <p><strong>العنوان:</strong> {currentQuizSettings.title}</p>
                                <p><strong>عدد الأسئلة:</strong> {generatedQuestions.length}</p>
                                <p><strong>المدة:</strong> {currentQuizSettings.quiz_duration} دقيقة</p>
                                <p><strong>درجة النجاح:</strong> {currentQuizSettings.passing_score}%</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {generatedQuestions.map((question, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">{question.question}</h4>
                                            <div className="space-y-2">
                                                {question.options?.map((option, optIndex) => (
                                                    <div key={optIndex} className={`flex items-center gap-3 p-2 rounded-lg ${optIndex === question.correct_answer ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-700/30"}`}>
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${optIndex === question.correct_answer ? "bg-green-500 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}`}>
                                                            {String.fromCharCode(65 + optIndex)}
                                                        </span>
                                                        <span className={`text-sm ${optIndex === question.correct_answer ? "text-green-800 dark:text-green-300 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                                                            {option}
                                                        </span>
                                                        {optIndex === question.correct_answer && (
                                                            <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-500 ms-auto" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {question.explanation_ar && (
                                                <div className="mt-3 text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                                    <strong>شرح:</strong> {question.explanation_ar}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Standard Form View */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Content Type Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                            نوع المحتوى <span className="text-red-500">*</span>
                            </label>
                            <select
                            value={contentForm.content_type}
                            onChange={(e) => {
                                handleFormChange("content_type", e.target.value);
                                if (e.target.value !== "quiz") {
                                    setActiveTab("topic");
                                    setGenerating(false);
                                }
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                            <option value="video">فيديو</option>
                            <option value="photo">صورة</option>
                            <option value="file">ملف</option>
                            <option value="audio">صوت</option>
                            <option value="link">رابط</option>
                            <option value="quiz">اختبار</option>
                            </select>
                        </div>

                        {/* Standard Fields for Non-Quiz Types */}
                        {contentForm.content_type !== "quiz" && (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">العنوان <span className="text-red-500">*</span></label>
                                    <input type="text" value={contentForm.title} onChange={(e) => handleFormChange("title", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">الوصف</label>
                                    <textarea value={contentForm.description} onChange={(e) => handleFormChange("description", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">المصدر</label>
                                    <input type="text" value={contentForm.source} onChange={(e) => handleFormChange("source", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="رابط أو مسار" />
                                </div>
                                {contentForm.content_type === "video" && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">منصة الفيديو</label>
                                        <input type="text" value={contentForm.video_platform} onChange={(e) => handleFormChange("video_platform", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="youtube" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">الترتيب</label>
                                    <input type="number" value={contentForm.position} onChange={(e) => handleFormChange("position", Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" min={1} />
                                </div>
                            </>
                        )}

                        {/* Quiz Generation Form */}
                        {contentForm.content_type === "quiz" && (
                            <div className="md:col-span-2">
                                <div className="flex gap-2 mb-6">
                                    <button onClick={() => setActiveTab("topic")} className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "topic" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
                                        من موضوع
                                    </button>
                                    <button onClick={() => setActiveTab("pdf")} className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "pdf" ? "bg-purple-600 text-white shadow-lg" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
                                        من ملف PDF
                                    </button>
                                </div>

                                {generating && (
                                    <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{progressText}</span>
                                        </div>
                                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                {/* Topic Form */}
                                {activeTab === "topic" && !generating && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white">العنوان</label>
                                                <input type="text" value={topicForm.title} onChange={(e) => setTopicForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white">الوصف</label>
                                                <input type="text" value={topicForm.description} onChange={(e) => setTopicForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white">الموضوع</label>
                                            <textarea value={topicForm.topic} onChange={(e) => setTopicForm(p => ({ ...p, topic: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]" placeholder="اكتب الموضوع هنا..." />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Settings Fields */}
                                            <div className="space-y-2">
                                                <label className="text-sm">عدد الأسئلة</label>
                                                <select value={topicForm.num_questions} onChange={(e) => setTopicForm(p => ({ ...p, num_questions: e.target.value }))} className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                                    <option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">الصعوبة</label>
                                                <select value={topicForm.difficulty} onChange={(e) => setTopicForm(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                                    <option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">صعب</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">اللغة</label>
                                                <select value={topicForm.language} onChange={(e) => setTopicForm(p => ({ ...p, language: e.target.value }))} className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                                    <option value="ar">العربية</option><option value="en">English</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2"><label className="text-sm">المدة (دقيقة)</label><input type="number" value={topicForm.quiz_duration} onChange={(e) => setTopicForm(p => ({ ...p, quiz_duration: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border dark:border-gray-600" /></div>
                                            <div className="space-y-2"><label className="text-sm">المحاولات</label><input type="number" value={topicForm.max_attempts} onChange={(e) => setTopicForm(p => ({ ...p, max_attempts: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border dark:border-gray-600" /></div>
                                            <div className="space-y-2"><label className="text-sm">درجة النجاح</label><input type="number" value={topicForm.passing_score} onChange={(e) => setTopicForm(p => ({ ...p, passing_score: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border dark:border-gray-600" /></div>
                                        </div>

                                        <button onClick={handleGenerateFromTopic} disabled={generating} className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg">
                                            <Icon icon="solar:magic-stick-3-bold" className="w-5 h-5 inline me-2" /> إنشاء الأسئلة
                                        </button>
                                    </div>
                                )}

                                {/* PDF Form */}
                                {activeTab === "pdf" && !generating && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white">العنوان</label>
                                                <input type="text" value={pdfForm.title} onChange={(e) => setPdfForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white">الوصف</label>
                                                <input type="text" value={pdfForm.description} onChange={(e) => setPdfForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white">ملف PDF</label>
                                            <input type="file" accept=".pdf" onChange={(e) => setPdfForm(p => ({ ...p, pdf_file: e.target.files[0] }))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
                                        </div>
                                        
                                        {/* Same settings fields for PDF */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="space-y-2"><label className="text-sm">عدد الأسئلة</label><select value={pdfForm.num_questions} onChange={(e) => setPdfForm(p => ({ ...p, num_questions: e.target.value }))} className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option></select></div>
                                            <div className="space-y-2"><label className="text-sm">الصعوبة</label><select value={pdfForm.difficulty} onChange={(e) => setPdfForm(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700"><option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">صعب</option></select></div>
                                            <div className="space-y-2"><label className="text-sm">اللغة</label><select value={pdfForm.language} onChange={(e) => setPdfForm(p => ({ ...p, language: e.target.value }))} className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700"><option value="ar">العربية</option><option value="en">English</option></select></div>
                                            <div className="space-y-2"><label className="text-sm">المدة (دقيقة)</label><input type="number" value={pdfForm.quiz_duration} onChange={(e) => setPdfForm(p => ({ ...p, quiz_duration: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border dark:border-gray-600" /></div>
                                            <div className="space-y-2"><label className="text-sm">المحاولات</label><input type="number" value={pdfForm.max_attempts} onChange={(e) => setPdfForm(p => ({ ...p, max_attempts: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border dark:border-gray-600" /></div>
                                            <div className="space-y-2"><label className="text-sm">درجة النجاح</label><input type="number" value={pdfForm.passing_score} onChange={(e) => setPdfForm(p => ({ ...p, passing_score: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border dark:border-gray-600" /></div>
                                        </div>

                                        <button onClick={handleGenerateFromPDF} disabled={generating} className="w-full px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg">
                                            <Icon icon="solar:magic-stick-3-bold" className="w-5 h-5 inline me-2" /> إنشاء الأسئلة
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                {reviewMode ? (
                    <>
                        <button onClick={() => { setReviewMode(false); setGeneratedQuestions([]); }} className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            تعديل الإعدادات
                        </button>
                        <button onClick={handleCreateFromReviewedQuestions} disabled={saving} className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg">
                            {saving ? "جاري النشر..." : "نشر الاختبار"}
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setFormOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            إلغاء
                        </button>
                        {contentForm.content_type !== "quiz" && (
                            <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg">
                                {saving ? "جاري الحفظ..." : (editMode ? "تحديث" : "إنشاء")}
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