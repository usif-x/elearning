"use client";

import Button from "@/components/ui/Button";
import Switcher from "@/components/ui/Switcher";
import {
  deleteContent,
  deleteQuizQuestion,
  generateMoreQuestionsFromSource,
  getContent,
  getQuizQuestions,
  updateContent,
  updateQuizQuestion,
} from "@/services/admin/Lecutre";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AdminContentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;
  const lectureId = params?.lectureId;
  const contentId = params?.contentId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
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

  // Quiz Questions State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editQuestionData, setEditQuestionData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOptions, setShowOptions] = useState({});
  const questionsPerPage = 5;

  // AI Generation State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    count: 5,
    difficulty: "medium",
    notes: "",
  });

  const fetchContent = async () => {
    if (!courseId || !lectureId || !contentId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getContent(courseId, lectureId, contentId);
      setContent(data);
      setForm({
        content_type: data?.content_type || "video",
        source: data?.source || "",
        video_platform: data?.video_platform || "youtube",
        title: data?.title || "",
        description: data?.description || "",
        position: Number(data?.position) || 1,
        quiz_duration: data?.quiz_duration ?? null,
        max_attempts: data?.max_attempts ?? null,
        passing_score: data?.passing_score ?? null,
        show_correct_answers: data?.show_correct_answers ?? 1,
        randomize_questions: data?.randomize_questions ?? 0,
        randomize_options: data?.randomize_options ?? 0,
      });
    } catch (e) {
      console.error(e);
      setError("فشل تحميل بيانات المحتوى");
      toast.error("فشل تحميل بيانات المحتوى");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [courseId, lectureId, contentId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!courseId || !lectureId || !contentId) return;
    if (!form.title?.trim()) {
      toast.error("يرجى إدخال عنوان المحتوى");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      payload.show_correct_answers = Number(payload.show_correct_answers) || 0;
      payload.randomize_questions = Number(payload.randomize_questions) || 0;
      payload.randomize_options = Number(payload.randomize_options) || 0;
      await updateContent(courseId, lectureId, contentId, payload);
      toast.success("تم حفظ بيانات المحتوى");
      await fetchContent();
    } catch (e) {
      console.error(e);
      toast.error("فشل حفظ بيانات المحتوى");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!courseId || !lectureId || !contentId) return;
    const ok = window.confirm("هل تريد حذف هذا المحتوى؟");
    if (!ok) return;
    try {
      await deleteContent(courseId, lectureId, contentId);
      toast.success("تم حذف المحتوى");
      router.push(
        `/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content`
      );
    } catch (e) {
      console.error(e);
      toast.error("فشل حذف المحتوى");
    }
  };

  // Quiz Questions Functions
  const fetchQuizQuestions = async () => {
    if (
      !courseId ||
      !lectureId ||
      !contentId ||
      content?.content_type !== "quiz"
    )
      return;
    setLoadingQuestions(true);
    try {
      const data = await getQuizQuestions(courseId, lectureId, contentId);
      setQuizQuestions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("فشل تحميل أسئلة الاختبار");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const startEditQuestion = (question, index) => {
    setEditingQuestion(index);
    setEditQuestionData({
      question: question.question || "",
      options: [...(question.options || [])],
      correct_answer: question.correct_answer || 0,
      explanation_en: question.explanation_en || "",
      explanation_ar: question.explanation_ar || "",
      question_type: question.question_type || "multiple_choice",
    });
  };

  const cancelEditQuestion = () => {
    setEditingQuestion(null);
    setEditQuestionData(null);
  };

  const toggleShowOptions = (questionIndex) => {
    setShowOptions((prev) => ({
      ...prev,
      [questionIndex]: prev[questionIndex] === false,
    }));
  };

  const handleEditQuestion = async (index) => {
    if (!editQuestionData?.question?.trim()) {
      toast.error("يرجى إدخال السؤال");
      return;
    }

    if (
      editQuestionData.question_type === "multiple_choice" ||
      editQuestionData.question_type === "true_false"
    ) {
      if (editQuestionData.options.length < 2) {
        toast.error("يجب أن يكون هناك خياران على الأقل");
        return;
      }
      if (editQuestionData.options.some((opt) => !opt?.trim())) {
        toast.error("يرجى ملء جميع الخيارات");
        return;
      }
    }

    if (
      editQuestionData.question_type === "short_answer" &&
      !editQuestionData.options[editQuestionData.correct_answer]?.trim()
    ) {
      toast.error("يرجى إدخال الإجابة الصحيحة");
      return;
    }

    try {
      const globalIndex = (currentPage - 1) * questionsPerPage + index;
      await updateQuizQuestion(
        courseId,
        lectureId,
        contentId,
        globalIndex,
        editQuestionData
      );
      toast.success("تم تحديث السؤال");
      setEditingQuestion(null);
      setEditQuestionData(null);
      await fetchQuizQuestions();
    } catch (e) {
      console.error(e);
      toast.error("فشل تحديث السؤال");
    }
  };

  const handleDeleteQuestion = async (index) => {
    if (quizQuestions.length <= 1) {
      toast.error("يجب أن يحتوي الاختبار على سؤال واحد على الأقل");
      return;
    }

    const result = window.confirm("هل تريد حذف هذا السؤال؟");
    if (!result) return;

    try {
      const globalIndex = (currentPage - 1) * questionsPerPage + index;
      await deleteQuizQuestion(courseId, lectureId, contentId, globalIndex);
      toast.success("تم حذف السؤال");
      await fetchQuizQuestions();
    } catch (e) {
      console.error(e);
      toast.error("فشل حذف السؤال");
    }
  };

  const addOption = () => {
    setEditQuestionData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const updateOption = (optionIndex, value) => {
    setEditQuestionData((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) =>
        idx === optionIndex ? value : opt
      ),
    }));
  };

  const removeOption = (optionIndex) => {
    if (editQuestionData.options.length <= 2) {
      toast.error("يجب أن يكون هناك خياران على الأقل");
      return;
    }

    setEditQuestionData((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== optionIndex),
      correct_answer:
        prev.correct_answer >= optionIndex && prev.correct_answer > 0
          ? prev.correct_answer - 1
          : prev.correct_answer,
    }));
  };

  // AI Generation Handler
  const handleGenerateQuestions = async () => {
    if (!content?.source) {
      toast.error("لا يوجد مصدر مرتبط بهذا الاختبار");
      return;
    }

    setIsGenerating(true);
    try {
      // Collect existing questions to avoid duplicates
      const previousQuestions = quizQuestions.map((q) => q.question);

      await generateMoreQuestionsFromSource(courseId, content.source, {
        lecture_id: parseInt(lectureId),
        difficulty: generateParams.difficulty,
        count: generateParams.count,
        notes: generateParams.notes,
        previous_questions: previousQuestions,
      });

      toast.success("تم توليد الأسئلة بنجاح");
      setShowGenerateModal(false);
      // Reset params except maybe difficulty
      setGenerateParams((prev) => ({ ...prev, notes: "" }));
      // Refresh questions list
      await fetchQuizQuestions();
    } catch (e) {
      console.error(e);
      toast.error("فشل توليد الأسئلة، يرجى المحاولة مرة أخرى");
    } finally {
      setIsGenerating(false);
    }
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = quizQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );
  const totalPages = Math.ceil(quizQuestions.length / questionsPerPage);

  useEffect(() => {
    if (content?.content_type === "quiz") {
      fetchQuizQuestions();
    }
  }, [content?.content_type]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
          جاري تحميل بيانات المحتوى...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section (Unchanged) */}
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Icon
                      icon={
                        content?.content_type === "quiz"
                          ? "solar:checklist-minimalistic-bold"
                          : "solar:file-bold"
                      }
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {content?.title || "بدون عنوان"}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                        {content?.content_type === "quiz" ? "اختبار" : "محتوى"}
                      </span>
                      {content?.content_type === "quiz" && (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                          {quizQuestions.length} سؤال
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  إدارة وتحرير تفاصيل المحتوى التدريبي
                </p>
                {/* Breadcrumbs (Unchanged) */}
                <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/admin/dashboard/courses">الدورات</Link>
                  <Icon
                    icon="solar:alt-arrow-left-bold"
                    className="w-4 h-4 mx-2"
                  />
                  <Link href={`/admin/dashboard/courses/${courseId}/lectures`}>
                    المحاضرات
                  </Link>
                  <Icon
                    icon="solar:alt-arrow-left-bold"
                    className="w-4 h-4 mx-2"
                  />
                  <Link
                    href={`/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content`}
                  >
                    المحتوى
                  </Link>
                  <Icon
                    icon="solar:alt-arrow-left-bold"
                    className="w-4 h-4 mx-2"
                  />
                  <span>تفاصيل المحتوى</span>
                </nav>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                color="red"
                shade={500}
                darkShade={600}
                icon="solar:trash-bold"
                text="حذف المحتوى"
                onClick={confirmDelete}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* General Settings Form (Same as original) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg space-y-4">
              {/* ... [Previous form inputs remain exactly the same] ... */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    نوع المحتوى
                  </label>
                  <select
                    value={form.content_type}
                    onChange={(e) =>
                      handleChange("content_type", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  >
                    <option value="video">فيديو</option>
                    <option value="photo">صورة</option>
                    <option value="file">ملف</option>
                    <option value="audio">صوت</option>
                    <option value="link">رابط</option>
                    <option value="quiz">اختبار</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 min-h-[100px]"
                  />
                </div>
                {form.content_type !== "quiz" && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        المصدر (رابط)
                      </label>
                      <input
                        type="text"
                        value={form.source}
                        onChange={(e) => handleChange("source", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                    {form.content_type === "video" && (
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                          منصة الفيديو
                        </label>
                        <input
                          type="text"
                          value={form.video_platform}
                          onChange={(e) =>
                            handleChange("video_platform", e.target.value)
                          }
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                        />
                      </div>
                    )}
                  </>
                )}
                {form.content_type === "quiz" && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        مدة الاختبار (دقيقة)
                      </label>
                      <input
                        type="number"
                        value={form.quiz_duration ?? ""}
                        onChange={(e) =>
                          handleChange("quiz_duration", Number(e.target.value))
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        أقصى محاولات
                      </label>
                      <input
                        type="number"
                        value={form.max_attempts ?? ""}
                        onChange={(e) =>
                          handleChange("max_attempts", Number(e.target.value))
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                        درجة النجاح (0-100)
                      </label>
                      <input
                        type="number"
                        value={form.passing_score ?? ""}
                        onChange={(e) =>
                          handleChange("passing_score", Number(e.target.value))
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/60">
                        <Switcher
                          checked={Boolean(form.show_correct_answers)}
                          onChange={(checked) =>
                            handleChange(
                              "show_correct_answers",
                              checked ? 1 : 0
                            )
                          }
                          label="إظهار الإجابات الصحيحة"
                          labelPosition="left"
                          color="emerald"
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/60">
                        <Switcher
                          checked={Boolean(form.randomize_questions)}
                          onChange={(checked) =>
                            handleChange("randomize_questions", checked ? 1 : 0)
                          }
                          label="ترتيب الأسئلة عشوائي"
                          labelPosition="left"
                          color="blue"
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/60">
                        <Switcher
                          checked={Boolean(form.randomize_options)}
                          onChange={(checked) =>
                            handleChange("randomize_options", checked ? 1 : 0)
                          }
                          label="ترتيب الخيارات عشوائي"
                          labelPosition="left"
                          color="purple"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={form.position}
                    onChange={(e) =>
                      handleChange("position", Number(e.target.value))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                    min={1}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  color="green"
                  shade={600}
                  darkShade={700}
                  text={saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  icon={saving ? undefined : "solar:check-circle-bold"}
                  isLoading={saving}
                  onClick={handleSave}
                />
                <Button
                  color="gray"
                  shade={200}
                  darkShade={300}
                  text="إلغاء"
                  icon="solar:close-circle-bold"
                  onClick={() =>
                    router.push(
                      `/admin/dashboard/courses/${courseId}/lectures/${lectureId}/content`
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Quiz Questions Management */}
          {content?.content_type === "quiz" && (
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl">
                      <Icon
                        icon="solar:question-circle-bold"
                        className="w-8 h-8 text-purple-600"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        أسئلة الاختبار
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        إدارة وتحرير أسئلة الاختبار ({quizQuestions.length}{" "}
                        سؤال)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Add Generate AI Button if source is present */}
                    {content?.source && content.source !== "" && (
                      <button
                        onClick={() => setShowGenerateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30 transition-all duration-200"
                      >
                        <Icon
                          icon="solar:magic-stick-3-bold"
                          className="w-5 h-5"
                        />
                        توليد أسئلة (AI)
                      </button>
                    )}
                    <button
                      onClick={fetchQuizQuestions}
                      disabled={loadingQuestions}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 transition-all duration-200"
                    >
                      <Icon
                        icon={
                          loadingQuestions
                            ? "svg-spinners:ring-resize"
                            : "solar:refresh-bold"
                        }
                        className="w-4 h-4"
                      />
                      تحديث
                    </button>
                  </div>
                </div>

                {loadingQuestions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Icon
                        icon="svg-spinners:ring-resize"
                        className="w-5 h-5"
                      />
                      جاري تحميل الأسئلة...
                    </div>
                  </div>
                ) : quizQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="solar:question-circle-bold"
                        className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      لا توجد أسئلة
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      لم يتم العثور على أسئلة لهذا الاختبار
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ... [Question list rendering remains exactly the same] ... */}
                    {currentQuestions.map((question, index) => {
                      const globalIndex = indexOfFirstQuestion + index;
                      const isEditing = editingQuestion === globalIndex;
                      // ... (Keep existing question rendering code)
                      return (
                        <div
                          key={question.id || globalIndex}
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-700/50"
                        >
                          {/* ... (Keep existing question item content) ... */}
                          {isEditing ? (
                            <div className="space-y-4">
                              {/* Copy previous Edit inputs here or keep them as is */}
                              <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                  السؤال *
                                </label>
                                <textarea
                                  value={editQuestionData.question}
                                  onChange={(e) =>
                                    setEditQuestionData((prev) => ({
                                      ...prev,
                                      question: e.target.value,
                                    }))
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  rows={3}
                                />
                              </div>
                              {/* ... (Rest of edit logic) ... */}
                              <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                  نوع السؤال
                                </label>
                                <select
                                  value={editQuestionData.question_type}
                                  onChange={(e) =>
                                    setEditQuestionData((prev) => ({
                                      ...prev,
                                      question_type: e.target.value,
                                    }))
                                  }
                                  className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                  <option value="multiple_choice">
                                    اختيار متعدد
                                  </option>
                                  <option value="true_false">صح/خطأ</option>
                                  <option value="short_answer">
                                    إجابة قصيرة
                                  </option>
                                </select>
                              </div>

                              {(editQuestionData.question_type ===
                                "multiple_choice" ||
                                editQuestionData.question_type ===
                                  "true_false") && (
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                      الخيارات
                                    </label>
                                    <button
                                      onClick={addOption}
                                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 text-green-700 dark:text-green-300 text-sm transition-all"
                                    >
                                      <Icon
                                        icon="solar:add-circle-bold"
                                        className="w-4 h-4"
                                      />
                                      إضافة خيار
                                    </button>
                                  </div>
                                  <div className="space-y-3">
                                    {editQuestionData.options.map(
                                      (option, optionIndex) => (
                                        <div
                                          key={optionIndex}
                                          className="flex items-center gap-3"
                                        >
                                          <input
                                            type="radio"
                                            name={`correct-${globalIndex}`}
                                            checked={
                                              editQuestionData.correct_answer ===
                                              optionIndex
                                            }
                                            onChange={() =>
                                              setEditQuestionData((prev) => ({
                                                ...prev,
                                                correct_answer: optionIndex,
                                              }))
                                            }
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                          />
                                          <input
                                            type="text"
                                            value={option}
                                            onChange={(e) =>
                                              updateOption(
                                                optionIndex,
                                                e.target.value
                                              )
                                            }
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                          />
                                          {editQuestionData.options.length >
                                            2 && (
                                            <button
                                              onClick={() =>
                                                removeOption(optionIndex)
                                              }
                                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all"
                                            >
                                              <Icon
                                                icon="solar:trash-bold"
                                                className="w-4 h-4"
                                              />
                                            </button>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {editQuestionData.question_type ===
                                "short_answer" && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    الإجابة الصحيحة *
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      editQuestionData.options[
                                        editQuestionData.correct_answer
                                      ] || ""
                                    }
                                    onChange={(e) =>
                                      setEditQuestionData((prev) => ({
                                        ...prev,
                                        options: prev.options.map((opt, idx) =>
                                          idx === prev.correct_answer
                                            ? e.target.value
                                            : opt
                                        ),
                                      }))
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  />
                                </div>
                              )}

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    الشرح (عربي)
                                  </label>
                                  <textarea
                                    value={editQuestionData.explanation_ar}
                                    onChange={(e) =>
                                      setEditQuestionData((prev) => ({
                                        ...prev,
                                        explanation_ar: e.target.value,
                                      }))
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    الشرح (إنجليزي)
                                  </label>
                                  <textarea
                                    value={editQuestionData.explanation_en}
                                    onChange={(e) =>
                                      setEditQuestionData((prev) => ({
                                        ...prev,
                                        explanation_en: e.target.value,
                                      }))
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    rows={3}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => handleEditQuestion(index)}
                                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200"
                                >
                                  <Icon
                                    icon="solar:check-circle-bold"
                                    className="w-4 h-4"
                                  />
                                  حفظ
                                </button>
                                <button
                                  onClick={cancelEditQuestion}
                                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200"
                                >
                                  <Icon
                                    icon="solar:close-circle-bold"
                                    className="w-4 h-4"
                                  />
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {/* View Mode */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                                      سؤال {globalIndex + 1}
                                    </span>
                                    <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                      {question.question_type ===
                                      "multiple_choice"
                                        ? "اختيار متعدد"
                                        : question.question_type ===
                                          "true_false"
                                        ? "صح/خطأ"
                                        : "إجابة قصيرة"}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    {question.question}
                                  </h3>
                                  {(question.question_type ===
                                    "multiple_choice" ||
                                    question.question_type ===
                                      "true_false") && (
                                    <div className="mb-4">
                                      <button
                                        onClick={() =>
                                          toggleShowOptions(globalIndex)
                                        }
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 text-sm transition-all"
                                      >
                                        <Icon
                                          icon={
                                            showOptions[globalIndex] === false
                                              ? "solar:eye-bold"
                                              : "solar:eye-closed-bold"
                                          }
                                          className="w-4 h-4"
                                        />
                                        {showOptions[globalIndex] === false
                                          ? "إظهار الخيارات"
                                          : "إخفاء الخيارات"}
                                      </button>
                                    </div>
                                  )}

                                  {(question.question_type ===
                                    "multiple_choice" ||
                                    question.question_type === "true_false") &&
                                    showOptions[globalIndex] !== false && (
                                      <div className="space-y-2 mb-4">
                                        {question.options?.map(
                                          (option, optionIndex) => (
                                            <div
                                              key={optionIndex}
                                              className={`flex items-center gap-3 p-3 rounded-lg ${
                                                optionIndex ===
                                                question.correct_answer
                                                  ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                                                  : "bg-gray-100 dark:bg-gray-700"
                                              }`}
                                            >
                                              <div
                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                  optionIndex ===
                                                  question.correct_answer
                                                    ? "border-green-600 bg-green-600"
                                                    : "border-gray-400"
                                                }`}
                                              >
                                                {optionIndex ===
                                                  question.correct_answer && (
                                                  <Icon
                                                    icon="solar:check-bold"
                                                    className="w-3 h-3 text-white"
                                                  />
                                                )}
                                              </div>
                                              <span className="text-gray-900 dark:text-white">
                                                {option}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}

                                  {question.question_type ===
                                    "short_answer" && (
                                    <div className="mb-4">
                                      <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                                        <div className="flex items-center gap-2">
                                          <Icon
                                            icon="solar:check-circle-bold"
                                            className="w-4 h-4 text-green-600"
                                          />
                                          <span className="font-medium text-green-800 dark:text-green-300">
                                            الإجابة الصحيحة:
                                          </span>
                                          <span className="text-green-700 dark:text-green-400">
                                            {
                                              question.options?.[
                                                question.correct_answer
                                              ]
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {(question.explanation_ar ||
                                    question.explanation_en) && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Icon
                                          icon="solar:info-circle-bold"
                                          className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="font-medium text-blue-800 dark:text-blue-300">
                                          الشرح:
                                        </span>
                                      </div>
                                      {question.explanation_ar && (
                                        <p className="text-blue-700 dark:text-blue-300 mb-2">
                                          {question.explanation_ar}
                                        </p>
                                      )}
                                      {question.explanation_en && (
                                        <p className="text-blue-600 dark:text-blue-400 text-sm">
                                          {question.explanation_en}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2 ml-6">
                                  <button
                                    onClick={() =>
                                      startEditQuestion(question, globalIndex)
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                  >
                                    <Icon
                                      icon="solar:pen-bold"
                                      className="w-4 h-4"
                                    />
                                    تعديل
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(index)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                  >
                                    <Icon
                                      icon="solar:trash-bold"
                                      className="w-4 h-4"
                                    />
                                    حذف
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                          <Icon
                            icon="solar:alt-arrow-left-bold"
                            className="w-5 h-5"
                          />
                          <span>السابق</span>
                        </button>

                        <div className="flex gap-2">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                                page === currentPage
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                          <span>التالي</span>
                          <Icon
                            icon="solar:alt-arrow-right-bold"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
              <h2 className="font-medium mb-3">تفاصيل</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">المعرف</span>
                  <span className="font-mono">{content?.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">النوع</span>
                  <span className="font-medium">{content?.content_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">أنشئت</span>
                  <span className="font-medium">{content?.created_at}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">حدثت</span>
                  <span className="font-medium">{content?.updated_at}</span>
                </div>
                {content?.source && (
                  <div className="mt-2">
                    <span className="block text-gray-500">المصدر</span>
                    <div className="text-xs break-all">{content?.source}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Questions Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Icon
                  icon="solar:magic-stick-3-bold"
                  className="w-6 h-6 text-purple-600"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                توليد أسئلة بالذكاء الاصطناعي
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  عدد الأسئلة
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={generateParams.count}
                  onChange={(e) =>
                    setGenerateParams((prev) => ({
                      ...prev,
                      count: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصعوبة
                </label>
                <select
                  value={generateParams.difficulty}
                  onChange={(e) =>
                    setGenerateParams((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  value={generateParams.notes}
                  onChange={(e) =>
                    setGenerateParams((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="مثال: ركز على التعاريف والمصطلحات"
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Button
                color="purple"
                shade={600}
                darkShade={700}
                text={isGenerating ? "جاري التوليد..." : "توليد الأسئلة"}
                icon={isGenerating ? undefined : "solar:magic-stick-3-bold"}
                isLoading={isGenerating}
                onClick={handleGenerateQuestions}
                className="flex-1 justify-center"
              />
              <Button
                color="gray"
                shade={200}
                darkShade={700}
                text="إلغاء"
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentDetailPage;
