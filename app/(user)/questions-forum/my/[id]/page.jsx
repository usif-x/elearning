"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner.jsx";
import {
  deleteMyQuestionSet,
  deleteQuestionFromSet,
  editQuestionInSet,
  getMyQuestionSetDetail,
  startQuestionAttempt,
  updateMyQuestionSet,
} from "../../../../../services/QuestionsForum";

const QuestionSetDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const questionSetId = params.id;

  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    is_public: false,
  });
  const [startingAttempt, setStartingAttempt] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const [explanationLanguages, setExplanationLanguages] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editQuestionData, setEditQuestionData] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

  // Helper function to determine question type based on options
  const getQuestionType = (question) => {
    if (!Array.isArray(question.options)) return "unknown";
    if (question.options.length > 2) return "multiple_choice";
    if (question.options.length === 2) return "true_false";
    return "short_answer";
  };

  // Calculate pagination (only if questionSet exists)
  const indexOfLastQuestion = questionSet ? currentPage * questionsPerPage : 0;
  const indexOfFirstQuestion = questionSet
    ? indexOfLastQuestion - questionsPerPage
    : 0;
  const currentQuestions = questionSet
    ? questionSet.questions.slice(indexOfFirstQuestion, indexOfLastQuestion)
    : [];
  const totalPages = questionSet
    ? Math.ceil(questionSet.questions.length / questionsPerPage)
    : 0;

  useEffect(() => {
    fetchQuestionSet();
  }, [questionSetId]);

  const fetchQuestionSet = async () => {
    setLoading(true);
    try {
      const data = await getMyQuestionSetDetail(questionSetId);
      setQuestionSet(data);
      setEditData({
        title: data.title,
        description: data.description || "",
        is_public: data.is_public,
      });
    } catch (error) {
      console.error("Error fetching question set:", error);
      toast.error("حدث خطأ أثناء تحميل مجموعة الأسئلة");
      router.push("/questions-forum");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateMyQuestionSet(questionSetId, editData);
      setQuestionSet({ ...questionSet, ...editData });
      setEditing(false);
      toast.success("تم تحديث مجموعة الأسئلة بنجاح");
    } catch (error) {
      console.error("Error updating question set:", error);
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لا يمكن التراجع عن حذف مجموعة الأسئلة هذه!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMyQuestionSet(questionSetId);
      toast.success("تم حذف مجموعة الأسئلة بنجاح");
      router.push("/questions-forum");
    } catch (error) {
      console.error("Error deleting question set:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleStartAttempt = async () => {
    setStartingAttempt(true);
    try {
      const attempt = await startQuestionAttempt(questionSetId);
      router.push(`/questions-forum/${questionSetId}/attempt`);
    } catch (error) {
      console.error("Error starting attempt:", error);
      toast.error("حدث خطأ أثناء بدء المحاولة");
    } finally {
      setStartingAttempt(false);
    }
  };

  // Edit Question Functions
  const startEditQuestion = (question, index) => {
    const globalIndex = indexOfFirstQuestion + index;
    setEditingQuestion(globalIndex);
    setEditQuestionData({
      question: question.question,
      options: [...question.options],
      correct_answer: question.correct_answer,
      explanation_en: question.explanation_en || "",
      explanation_ar: question.explanation_ar || "",
      question_type: question.question_type || getQuestionType(question),
      question_category: question.question_category || "",
      cognitive_level: question.cognitive_level || "",
    });
  };

  const cancelEditQuestion = () => {
    setEditingQuestion(null);
    setEditQuestionData(null);
  };

  const handleEditQuestion = async (index) => {
    if (!editQuestionData.question.trim()) {
      toast.error("يرجى إدخال نص السؤال");
      return;
    }

    // Validate that all options are filled for multiple choice and true/false
    if (
      editQuestionData.question_type === "multiple_choice" ||
      editQuestionData.question_type === "true_false"
    ) {
      const emptyOption = editQuestionData.options.find((opt) => !opt.trim());
      if (emptyOption) {
        toast.error("يرجى ملء جميع الخيارات");
        return;
      }
    }

    // Validate that correct answer is provided for short answer
    if (
      editQuestionData.question_type === "short_answer" &&
      !editQuestionData.options[editQuestionData.correct_answer]?.trim()
    ) {
      toast.error("يرجى إدخال الإجابة الصحيحة");
      return;
    }

    try {
      const response = await editQuestionInSet(questionSetId, {
        question_index: index,
        question_data: editQuestionData,
      });

      setQuestionSet(response);
      setEditingQuestion(null);
      setEditQuestionData(null);
      toast.success("تم تحديث السؤال بنجاح");
    } catch (error) {
      console.error("Error editing question:", error);
      toast.error("حدث خطأ أثناء تحديث السؤال");
    }
  };

  const handleDeleteQuestion = async (index) => {
    // Check if this is the last question
    if (questionSet.questions.length <= 1) {
      toast.error("لا يمكن حذف السؤال الأخير في المجموعة");
      return;
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لا يمكن التراجع عن حذف هذا السؤال!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    setDeletingQuestion(index);
    try {
      const response = await deleteQuestionFromSet(questionSetId, {
        question_index: index,
      });

      setQuestionSet(response);

      // Adjust pagination if needed
      if (
        currentPage > Math.ceil(response.questions.length / questionsPerPage)
      ) {
        setCurrentPage(Math.ceil(response.questions.length / questionsPerPage));
      }

      toast.success("تم حذف السؤال بنجاح");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("حدث خطأ أثناء حذف السؤال");
    } finally {
      setDeletingQuestion(null);
    }
  };

  // Helper functions for question editing
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
      toast.error("يجب أن يحتوي السؤال على خيارين على الأقل");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
              <Icon
                icon="solar:document-bold"
                className="w-16 h-16 text-gray-400"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              لم يتم العثور على مجموعة الأسئلة
            </h3>
            <Link
              href="/questions-forum"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
            >
              <Icon icon="solar:arrow-right-bold" className="w-6 h-6" />
              <span>العودة إلى منتدى الأسئلة</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-sky-600 rounded-2xl shadow-lg">
              <Icon
                icon="solar:document-bold-duotone"
                className="w-12 h-12 text-white"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                تفاصيل مجموعة الأسئلة
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                إدارة ومراجعة أسئلتك
              </p>
            </div>
          </div>
        </div>

        {/* Question Set Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {editing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      العنوان *
                    </label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      className="w-full text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      الوصف
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="الوصف..."
                    />
                  </div>
                  <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                    <input
                      type="checkbox"
                      id="is_public_edit"
                      checked={editData.is_public}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          is_public: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_public_edit"
                      className="mr-3 text-sm font-medium text-purple-800 dark:text-purple-200"
                    >
                      جعل الأسئلة عامة (يمكن للآخرين رؤيتها والإجابة عليها)
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {questionSet.title}
                  </h1>
                  {questionSet.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                      {questionSet.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 ml-6">
              {editing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                    <span>حفظ</span>
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Icon icon="solar:pen-bold" className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-3 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Icon
                      icon="solar:trash-bin-minimalistic-bold"
                      className="w-6 h-6"
                    />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6 text-center border border-blue-200 dark:border-blue-700">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800/50 dark:to-blue-700/50 rounded-xl mb-4">
                <Icon
                  icon="solar:question-circle-bold"
                  className="w-8 h-8 text-blue-600"
                />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {questionSet.total_questions}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                سؤال
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-6 text-center border border-green-200 dark:border-green-700">
              <div className="inline-flex p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800/50 dark:to-green-700/50 rounded-xl mb-4">
                <Icon
                  icon="solar:play-circle-bold"
                  className="w-8 h-8 text-green-600"
                />
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {questionSet.attempt_count}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 font-semibold">
                محاولة
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 text-center border ${
                questionSet.difficulty === "easy"
                  ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700"
                  : questionSet.difficulty === "medium"
                  ? "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-200 dark:border-yellow-700"
                  : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-700"
              }`}
            >
              <div
                className={`inline-flex p-3 rounded-xl mb-4 ${
                  questionSet.difficulty === "easy"
                    ? "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800/50 dark:to-green-700/50"
                    : questionSet.difficulty === "medium"
                    ? "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800/50 dark:to-yellow-700/50"
                    : "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800/50 dark:to-red-700/50"
                }`}
              >
                <Icon
                  icon="solar:chart-square-bold"
                  className={`w-8 h-8 ${
                    questionSet.difficulty === "easy"
                      ? "text-green-600"
                      : questionSet.difficulty === "medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                />
              </div>
              <div
                className={`text-3xl font-bold mb-1 ${
                  questionSet.difficulty === "easy"
                    ? "text-green-600 dark:text-green-400"
                    : questionSet.difficulty === "medium"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {questionSet.difficulty === "easy"
                  ? "سهل"
                  : questionSet.difficulty === "medium"
                  ? "متوسط"
                  : "صعب"}
              </div>
              <div
                className={`text-sm font-semibold ${
                  questionSet.difficulty === "easy"
                    ? "text-green-700 dark:text-green-300"
                    : questionSet.difficulty === "medium"
                    ? "text-yellow-700 dark:text-yellow-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                المستوى
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-6 text-center border border-purple-200 dark:border-purple-700">
              <div className="inline-flex p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800/50 dark:to-purple-700/50 rounded-xl mb-4">
                <Icon
                  icon="solar:eye-bold"
                  className="w-8 h-8 text-purple-600"
                />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {questionSet.is_public ? "عام" : "خاص"}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                النوع
              </div>
            </div>
          </div>

          {/* Source Display */}
          {questionSet.source_type && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                المصدر
              </h3>
              {questionSet.source_type === "pdf" ? (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <Icon
                    icon="solar:document-bold"
                    className="w-8 h-8 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {questionSet.source_file_name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      ملف PDF
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `${process.env.NEXT_PUBLIC_API_URL}/storage/user_questions/${questionSet.source_file_name}`;
                      link.download = questionSet.source_file_name;
                      link.click();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Icon icon="solar:download-bold" className="w-5 h-5" />
                    <span>تحميل</span>
                  </button>
                </div>
              ) : questionSet.source_type === "topic" ? (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <Icon
                    icon="solar:tag-bold"
                    className="w-8 h-8 text-green-600"
                  />
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {questionSet.topic}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      موضوع
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleStartAttempt}
              disabled={startingAttempt}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-lg"
            >
              {startingAttempt ? (
                <LoadingSpinner />
              ) : (
                <Icon icon="solar:play-circle-bold" className="w-6 h-6" />
              )}
              <span>بدء المحاولة</span>
            </button>
            {questionSet.is_public ? (
              <>
                <Link
                  href={`/questions-forum/${questionSetId}/participants`}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 text-lg"
                >
                  <Icon icon="solar:cup-bold" className="w-6 h-6" />
                  <span>المشاركون</span>
                </Link>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/questions-forum/${questionSetId}`;
                    navigator.clipboard.writeText(url).then(() => {
                      // You could add a toast notification here
                      toast.success("تم نسخ الرابط!");
                    });
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 text-lg"
                >
                  <Icon icon="solar:share-bold" className="w-6 h-6" />
                  <span>مشاركة</span>
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                <Icon
                  icon="solar:question-circle-bold"
                  className="w-8 h-8 text-indigo-500"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                الأسئلة ({questionSet.questions.length})
              </h2>
            </div>

            {/* Add Questions Button */}
            <Link
              href={`/questions-forum/${questionSetId}/add-questions`}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
              <span>إضافة أسئلة</span>
            </Link>
          </div>

          {currentQuestions.map((question, index) => {
            const globalIndex = indexOfFirstQuestion + index;
            const isEditing = editingQuestion === globalIndex;

            return (
              <div
                key={globalIndex}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-6">
                  {isEditing ? (
                    <div className="flex-1">
                      <textarea
                        value={editQuestionData.question}
                        onChange={(e) =>
                          setEditQuestionData((prev) => ({
                            ...prev,
                            question: e.target.value,
                          }))
                        }
                        className="w-full text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="أدخل نص السؤال..."
                      />
                    </div>
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1 leading-relaxed">
                      {globalIndex + 1}. {question.question}
                    </h3>
                  )}

                  <div className="flex items-center gap-2 ml-4">
                    {/* Question Type Badge */}
                    <span
                      className={`px-4 py-2 font-semibold text-sm rounded-full whitespace-nowrap ${
                        getQuestionType(question) === "multiple_choice"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : getQuestionType(question) === "true_false"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      }`}
                    >
                      {getQuestionType(question) === "multiple_choice"
                        ? "اختيار متعدد"
                        : getQuestionType(question) === "true_false"
                        ? "صح أم خطأ"
                        : "إجابة قصيرة"}
                    </span>

                    {/* Edit & Delete Buttons */}
                    {!isEditing && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditQuestion(question, index)}
                          className="p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                          title="تعديل السؤال"
                        >
                          <Icon icon="solar:pen-bold" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(globalIndex)}
                          disabled={deletingQuestion === globalIndex}
                          className="p-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-300 disabled:opacity-50"
                          title="حذف السؤال"
                        >
                          {deletingQuestion === globalIndex ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            <Icon
                              icon="solar:trash-bin-minimalistic-bold"
                              className="w-5 h-5"
                            />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Mode */}
                {isEditing ? (
                  <div className="space-y-6">
                    {/* Options Editing */}
                    {(editQuestionData.question_type === "multiple_choice" ||
                      editQuestionData.question_type === "true_false") && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                            الخيارات:
                          </h4>
                          {editQuestionData.question_type ===
                            "multiple_choice" && (
                            <button
                              onClick={addOption}
                              className="flex items-center gap-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                            >
                              <Icon
                                icon="solar:add-circle-bold"
                                className="w-4 h-4"
                              />
                              إضافة خيار
                            </button>
                          )}
                        </div>

                        {editQuestionData.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="radio"
                              name="correct_answer"
                              checked={
                                editQuestionData.correct_answer === optionIndex
                              }
                              onChange={() =>
                                setEditQuestionData((prev) => ({
                                  ...prev,
                                  correct_answer: optionIndex,
                                }))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateOption(optionIndex, e.target.value)
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              placeholder={`الخيار ${optionIndex + 1}`}
                            />
                            {editQuestionData.options.length > 2 && (
                              <button
                                onClick={() => removeOption(optionIndex)}
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Icon
                                  icon="solar:trash-bin-minimalistic-bold"
                                  className="w-4 h-4"
                                />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Short Answer Editing */}
                    {editQuestionData.question_type === "short_answer" && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                          الإجابة الصحيحة:
                        </h4>
                        <input
                          type="text"
                          value={
                            editQuestionData.options[
                              editQuestionData.correct_answer
                            ] || ""
                          }
                          onChange={(e) => {
                            const newOptions = [...editQuestionData.options];
                            newOptions[editQuestionData.correct_answer] =
                              e.target.value;
                            setEditQuestionData((prev) => ({
                              ...prev,
                              options: newOptions,
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="الإجابة الصحيحة"
                        />
                      </div>
                    )}

                    {/* Question Category and Cognitive Level */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          فئة السؤال
                        </label>
                        <select
                          value={editQuestionData.question_category}
                          onChange={(e) =>
                            setEditQuestionData((prev) => ({
                              ...prev,
                              question_category: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر الفئة</option>
                          <option value="standard">قياسي</option>
                          <option value="critical">حرج</option>
                          <option value="linking">ربط</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          المستوى المعرفي
                        </label>
                        <select
                          value={editQuestionData.cognitive_level}
                          onChange={(e) =>
                            setEditQuestionData((prev) => ({
                              ...prev,
                              cognitive_level: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر المستوى</option>
                          <option value="remember">تذكر</option>
                          <option value="understand">فهم</option>
                          <option value="apply">تطبيق</option>
                          <option value="analyze">تحليل</option>
                          <option value="evaluate">تقييم</option>
                          <option value="create">إنشاء</option>
                        </select>
                      </div>
                    </div>

                    {/* Explanations Editing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          الشرح بالعربية
                        </label>
                        <textarea
                          value={editQuestionData.explanation_ar}
                          onChange={(e) =>
                            setEditQuestionData((prev) => ({
                              ...prev,
                              explanation_ar: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="الشرح باللغة العربية..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          الشرح بالإنجليزية
                        </label>
                        <textarea
                          value={editQuestionData.explanation_en}
                          onChange={(e) =>
                            setEditQuestionData((prev) => ({
                              ...prev,
                              explanation_en: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Explanation in English..."
                        />
                      </div>
                    </div>

                    {/* Edit Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={cancelEditQuestion}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleEditQuestion(globalIndex)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                      >
                        <Icon
                          icon="solar:check-circle-bold"
                          className="w-5 h-5"
                        />
                        حفظ التغييرات
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    {/* Options for multiple choice */}
                    {getQuestionType(question) === "multiple_choice" &&
                      Array.isArray(question.options) &&
                      question.options.length > 0 && (
                        <div className="space-y-4 mb-6">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                optionIndex === question.correct_answer
                                  ? "border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-md"
                                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="font-bold text-lg mr-4 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span
                                  className={`text-lg ${
                                    optionIndex === question.correct_answer
                                      ? "font-bold text-green-800 dark:text-green-200"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {option}
                                </span>
                                {optionIndex === question.correct_answer && (
                                  <div className="mr-4 p-2 bg-green-500 rounded-full">
                                    <Icon
                                      icon="solar:check-circle-bold"
                                      className="w-5 h-5 text-white"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* True/False */}
                    {getQuestionType(question) === "true_false" && (
                      <div className="space-y-4 mb-6">
                        <div
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            question.correct_answer === 1
                              ? "border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-md"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-bold text-lg mr-4 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              A
                            </span>
                            <span
                              className={`text-lg ${
                                question.correct_answer === 1
                                  ? "font-bold text-green-800 dark:text-green-200"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              False
                            </span>
                            {question.correct_answer === 1 && (
                              <div className="mr-4 p-2 bg-green-500 rounded-full">
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="w-5 h-5 text-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            question.correct_answer === 0
                              ? "border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-md"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-bold text-lg mr-4 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              B
                            </span>
                            <span
                              className={`text-lg ${
                                question.correct_answer === 0
                                  ? "font-bold text-green-800 dark:text-green-200"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              True
                            </span>
                            {question.correct_answer === 0 && (
                              <div className="mr-4 p-2 bg-green-500 rounded-full">
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="w-5 h-5 text-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Short Answer */}
                    {getQuestionType(question) === "short_answer" && (
                      <div className="mb-6">
                        <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-500 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-full">
                              <Icon
                                icon="solar:check-circle-bold"
                                className="w-6 h-6 text-white"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-green-800 dark:text-green-200 text-lg">
                                الإجابة الصحيحة
                              </p>
                              <p className="text-green-700 dark:text-green-300 text-lg font-semibold">
                                {Array.isArray(question.options) &&
                                question.options.length > 0
                                  ? question.options[question.correct_answer] ||
                                    "غير محدد"
                                  : "غير محدد"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Question Metadata */}
                    {(question.question_category ||
                      question.cognitive_level) && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                            <Icon
                              icon="solar:tag-bold"
                              className="w-6 h-6 text-purple-500"
                            />
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                            تصنيف السؤال
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.question_category && (
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                              <div className="flex items-center gap-3">
                                <Icon
                                  icon="solar:category-bold"
                                  className="w-5 h-5 text-purple-600"
                                />
                                <div>
                                  <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                                    فئة السؤال
                                  </p>
                                  <p className="text-purple-800 dark:text-purple-200 font-bold">
                                    {question.question_category === "standard"
                                      ? "قياسي"
                                      : question.question_category ===
                                        "critical"
                                      ? "حرج"
                                      : question.question_category === "linking"
                                      ? "ربط"
                                      : question.question_category}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {question.cognitive_level && (
                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                              <div className="flex items-center gap-3">
                                <Icon
                                  icon="solar:brain-bold"
                                  className="w-5 h-5 text-indigo-600"
                                />
                                <div>
                                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                                    المستوى المعرفي
                                  </p>
                                  <p className="text-indigo-800 dark:text-indigo-200 font-bold">
                                    {question.cognitive_level === "remember"
                                      ? "تذكر"
                                      : question.cognitive_level ===
                                        "understand"
                                      ? "فهم"
                                      : question.cognitive_level === "apply"
                                      ? "تطبيق"
                                      : question.cognitive_level === "analyze"
                                      ? "تحليل"
                                      : question.cognitive_level === "evaluate"
                                      ? "تقييم"
                                      : question.cognitive_level === "create"
                                      ? "إنشاء"
                                      : question.cognitive_level}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Explanations */}
                    {(question.explanation_en || question.explanation_ar) && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                              <Icon
                                icon="solar:info-circle-bold"
                                className="w-6 h-6 text-blue-500"
                              />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                              الشرح والتوضيح
                            </h4>
                          </div>

                          {/* Language Toggle Button */}
                          {question.explanation_en &&
                            question.explanation_ar &&
                            question.explanation_en !==
                              question.explanation_ar && (
                              <button
                                onClick={() =>
                                  setExplanationLanguages((prev) => ({
                                    ...prev,
                                    [globalIndex]: !prev[globalIndex],
                                  }))
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                              >
                                <Icon
                                  icon={
                                    !explanationLanguages[globalIndex]
                                      ? "solar:chat-square-bold"
                                      : "solar:global-bold"
                                  }
                                  className="w-4 h-4"
                                />
                                <span>
                                  {!explanationLanguages[globalIndex]
                                    ? "العربية"
                                    : "English"}
                                </span>
                              </button>
                            )}
                        </div>

                        {/* Show selected language explanation */}
                        {!explanationLanguages[globalIndex]
                          ? question.explanation_en && (
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                                <p className="text-blue-800 dark:text-blue-200 text-lg leading-relaxed">
                                  {question.explanation_en}
                                </p>
                              </div>
                            )
                          : question.explanation_ar && (
                              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                                <p className="text-green-800 dark:text-green-200 text-lg leading-relaxed">
                                  {question.explanation_ar}
                                </p>
                              </div>
                            )}

                        {/* Fallback: show available explanation if preferred language not available */}
                        {!explanationLanguages[globalIndex] &&
                          !question.explanation_en &&
                          question.explanation_ar && (
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                              <p className="text-green-800 dark:text-green-200 text-lg leading-relaxed">
                                {question.explanation_ar}
                              </p>
                            </div>
                          )}

                        {explanationLanguages[globalIndex] &&
                          !question.explanation_ar &&
                          question.explanation_en && (
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                              <p className="text-blue-800 dark:text-blue-200 text-lg leading-relaxed">
                                {question.explanation_en}
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 mb-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
              <span>السابق</span>
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>التالي</span>
              <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Add More Questions Button */}
        <div className="mt-12 text-center">
          <Link
            href={`/questions-forum/${questionSetId}/add-questions`}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
          >
            <Icon icon="solar:add-circle-bold" className="w-6 h-6" />
            <span>إضافة المزيد من الأسئلة</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuestionSetDetailPage;
