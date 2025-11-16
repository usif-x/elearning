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
  const [explanationLanguages, setExplanationLanguages] = useState({}); // Track language preference per question

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
            <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
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
            <Link
              href={`/questions-forum/${questionSetId}/participants`}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 text-lg"
            >
              <Icon icon="solar:cup-bold" className="w-6 h-6" />
              <span>المشاركون</span>
            </Link>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
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

          {currentQuestions.map((question, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1 leading-relaxed">
                  {indexOfFirstQuestion + index + 1}. {question.question}
                </h3>
                <span
                  className={`px-4 py-2 font-semibold text-sm rounded-full ml-4 whitespace-nowrap ${
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
              </div>

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
                        أ
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
                        ب
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
                      question.explanation_en !== question.explanation_ar && (
                        <button
                          onClick={() =>
                            setExplanationLanguages((prev) => ({
                              ...prev,
                              [indexOfFirstQuestion + index]:
                                !prev[indexOfFirstQuestion + index],
                            }))
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                        >
                          <Icon
                            icon={
                              explanationLanguages[indexOfFirstQuestion + index]
                                ? "solar:global-bold"
                                : "solar:chat-square-bold"
                            }
                            className="w-4 h-4"
                          />
                          <span>
                            {explanationLanguages[indexOfFirstQuestion + index]
                              ? "English"
                              : "العربية"}
                          </span>
                        </button>
                      )}
                  </div>

                  {/* Show selected language explanation */}
                  {explanationLanguages[indexOfFirstQuestion + index]
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
                  {explanationLanguages[indexOfFirstQuestion + index] &&
                    !question.explanation_en &&
                    question.explanation_ar && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                        <p className="text-green-800 dark:text-green-200 text-lg leading-relaxed">
                          {question.explanation_ar}
                        </p>
                      </div>
                    )}

                  {!explanationLanguages[indexOfFirstQuestion + index] &&
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
            </div>
          ))}
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
