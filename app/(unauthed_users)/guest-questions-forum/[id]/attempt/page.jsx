"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getPublicQuestionSetDetail,
  startGuestAttempt,
  submitGuestAttempt,
} from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import GuestQuestionsForumBreadcrumb from "../../components/GuestQuestionsForumBreadcrumb";
import GuestQuestionsForumQuizNavigation from "../../components/GuestQuestionsForumQuizNavigation";
import GuestQuestionsForumQuizQuestion from "../../components/GuestQuestionsForumQuizQuestion";
import GuestQuestionsForumQuizStatsBar from "../../components/GuestQuestionsForumQuizStatsBar";

const GuestAttemptPage = () => {
  const params = useParams();
  const router = useRouter();
  const questionSetId = params.id;
  const storageKey = `guest_questions_attempt_${questionSetId}`;

  const [questionSet, setQuestionSet] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  // Quiz state
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchQuestionSetDetail();
    }
  }, [params.id]);

  useEffect(() => {
    let timer;
    if (showQuiz && !showResults) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQuiz, showResults]);

  const fetchQuestionSetDetail = async () => {
    setLoading(true);
    try {
      const response = await getPublicQuestionSetDetail(params.id);
      setQuestionSet(response);
    } catch (error) {
      console.error("Error fetching question set detail:", error);
      toast.error("حدث خطأ أثناء تحميل تفاصيل مجموعة الأسئلة");
      router.push("/guest-questions-forum");
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    // Egyptian phone number validation (starts with 01 and 10 digits total)
    const egyptianPhoneRegex = /^01[0-2]\d{8}$/;
    return egyptianPhoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    setPhoneNumber(value);
    setPhoneError("");

    if (value && !validatePhoneNumber(value)) {
      setPhoneError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)");
    }
  };

  const handleStartAttempt = async () => {
    if (!phoneNumber) {
      setPhoneError("يرجى إدخال رقم الهاتف");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("يرجى إدخال رقم هاتف سعودي صحيح");
      return;
    }

    setStarting(true);
    try {
      const response = await startGuestAttempt(params.id, {
        phone_number: "+20" + phoneNumber,
      });
      setAttempt(response);
      setSubmittedPhoneNumber("+20" + phoneNumber);

      // Initialize answers object
      const initialAnswers = {};
      response.questions.forEach((_, index) => {
        initialAnswers[index] = null;
      });
      setAnswers(initialAnswers);

      // Check for saved data
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const {
            answers: savedAnswers,
            timeElapsed: savedTime,
            flagged: savedFlagged,
            phoneNumber: savedPhoneNumber,
          } = JSON.parse(savedData);
          setAnswers(savedAnswers);
          setTimeElapsed(savedTime);
          setFlaggedQuestions(new Set(savedFlagged));
          if (savedPhoneNumber) {
            setSubmittedPhoneNumber(savedPhoneNumber);
          }
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      }

      setShowQuiz(true);
      toast.success("تم بدء المحاولة بنجاح");
    } catch (error) {
      console.error("Error starting guest attempt:", error);
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء بدء المحاولة"
      );
    } finally {
      setStarting(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleClearAnswer = (questionIndex) => {
    setAnswers({ ...answers, [questionIndex]: null });
  };

  const handleToggleFlag = (questionIndex) => {
    setFlaggedQuestions((prev) => {
      const newFlags = new Set(prev);
      if (newFlags.has(questionIndex)) {
        newFlags.delete(questionIndex);
      } else {
        newFlags.add(questionIndex);
      }
      return newFlags;
    });
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = Object.values(answers).some((answer) => answer === null);
    if (unanswered) {
      const result = await Swal.fire({
        title: "تأكيد التسليم",
        text: "لم تقم بالإجابة على جميع الأسئلة. هل تريد المتابعة والإرسال؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم، سلّم الاختبار",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#0ea5e9",
        cancelButtonColor: "#ef4444",
      });

      if (!result.isConfirmed) return;
    }

    setSubmitting(true);
    try {
      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(
        ([questionIndex, selectedAnswer]) => ({
          question_index: parseInt(questionIndex),
          selected_answer: selectedAnswer,
        })
      );

      const submissionData = {
        attempt_id: attempt.attempt_id,
        phone_number: submittedPhoneNumber,
        answers: JSON.stringify(formattedAnswers),
        time_taken: timeElapsed,
      };

      const result = await submitGuestAttempt(submissionData);
      setShowResults(true);
      toast.success("تم إرسال الإجابات بنجاح!");
      // Remove saved data
      localStorage.removeItem(storageKey);
      // Redirect to results page after a short delay
      setTimeout(() => {
        router.push(`/guest-questions-forum/attempts/${result.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting guest attempt:", error);
      toast.error("حدث خطأ أثناء إرسال الإجابات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueLater = async () => {
    const result = await Swal.fire({
      title: "متابعة لاحقاً",
      text: "هل أنت متأكد من رغبتك في حفظ التقدم والمتابعة لاحقاً؟ يمكنك استئناف الاختبار من حيث توقفت.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، احفظ وتابع لاحقاً",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      const dataToSave = {
        answers,
        timeElapsed,
        flagged: Array.from(flaggedQuestions),
        phoneNumber: submittedPhoneNumber,
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      toast.success("تم حفظ التقدم!");
      router.push("/guest-questions-forum");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter((answer) => answer !== null).length;
  };

  const getRemainingCount = () => {
    return attempt?.questions?.length - getAnsweredCount();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
              <Icon
                icon="solar:question-circle-bold"
                className="w-16 h-16 text-gray-400"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              مجموعة الأسئلة غير موجودة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              المجموعة المطلوبة غير متوفرة أو تم حذفها
            </p>
            <Link
              href="/guest-questions-forum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
              <span>العودة للمنتدى</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show phone input if quiz hasn't started yet
  if (!showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <Link
              href="/guest-questions-forum"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              منتدى الأسئلة العامة
            </Link>
            <Icon icon="solar:alt-arrow-left-bold" className="w-4 h-4" />
            <Link
              href={`/guest-questions-forum/${questionSet.id}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {questionSet.title}
            </Link>
            <Icon icon="solar:alt-arrow-left-bold" className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">
              بدء المحاولة
            </span>
          </nav>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl mb-6">
              <Icon
                icon="solar:play-circle-bold-duotone"
                className="w-12 h-12 text-green-500"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              بدء محاولة جديدة
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              أدخل رقم هاتفك لبدء محاولتك في مجموعة "{questionSet.title}"
            </p>
          </div>

          {/* Question Set Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                <Icon
                  icon="solar:question-circle-bold"
                  className="w-6 h-6 text-blue-500"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {questionSet.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {questionSet.total_questions} سؤال •{" "}
                  {questionSet.time_limit
                    ? `${questionSet.time_limit} دقيقة`
                    : "غير محدود"}
                </p>
              </div>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Icon
                    icon="solar:phone-bold"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="01012345678"
                    maxLength={11}
                    className={`w-full pr-10 pl-4 py-4 text-lg border rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 transition-colors ${
                      phoneError
                        ? "border-red-300 focus:ring-red-500 text-red-900 dark:text-red-100"
                        : "border-gray-200 dark:border-gray-600 focus:ring-blue-500 text-gray-900 dark:text-white"
                    }`}
                    dir="ltr"
                  />
                </div>
                {phoneError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Icon
                      icon="solar:danger-triangle-bold"
                      className="w-4 h-4"
                    />
                    {phoneError}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  سيتم استخدام رقم هاتفك لتسجيل محاولتك ومراجعة النتائج لاحقاً
                </p>
              </div>

              {/* Terms */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:info-circle-bold"
                    className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">ملاحظات مهمة:</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• تأكد من صحة رقم هاتفك لتتمكن من مراجعة نتائجك</li>
                      <li>• يمكنك إجراء محاولات متعددة بنفس الرقم</li>
                      <li>• ستحصل على رابط لمراجعة النتائج بعد الانتهاء</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleStartAttempt}
              disabled={starting || !phoneNumber || phoneError}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none text-lg"
            >
              {starting ? (
                <>
                  <LoadingSpinner />
                  <span>جاري البدء...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:play-circle-bold" className="w-6 h-6" />
                  <span>ابدأ المحاولة</span>
                </>
              )}
            </button>

            <Link
              href={`/guest-questions-forum/${questionSet.id}`}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-lg text-center"
            >
              العودة للتفاصيل
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz interface
  if (!attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="w-12 h-12 text-sky-500 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل الاختبار...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <GuestQuestionsForumBreadcrumb
          questionSetId={questionSetId}
          questionSetTitle={questionSet.title}
        />

        {/* Quiz Container */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Top Stats Bar */}
            <GuestQuestionsForumQuizStatsBar
              timeElapsed={timeElapsed}
              answeredCount={getAnsweredCount()}
              totalQuestions={attempt.questions.length}
              flaggedCount={flaggedQuestions.size}
              currentQuestionIndex={currentQuestionIndex}
              formatTime={formatTime}
            />

            {/* Question Navigation */}
            <GuestQuestionsForumQuizNavigation
              questions={attempt.questions}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              showOnlyFlagged={showOnlyFlagged}
              setShowOnlyFlagged={setShowOnlyFlagged}
              answeredCount={getAnsweredCount()}
              remainingCount={getRemainingCount()}
            />

            {/* Question Display */}
            <GuestQuestionsForumQuizQuestion
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={attempt.questions.length}
              answer={answers[currentQuestionIndex]}
              flaggedQuestions={flaggedQuestions}
              onAnswerSelect={(optionIndex) =>
                handleAnswerSelect(currentQuestionIndex, optionIndex)
              }
              onClearAnswer={() => handleClearAnswer(currentQuestionIndex)}
              onToggleFlag={() => handleToggleFlag(currentQuestionIndex)}
              onPrevious={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              onNext={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(attempt.questions.length - 1, prev + 1)
                )
              }
              onSubmit={() => handleSubmit()}
              onContinueLater={() => handleContinueLater()}
              submitting={submitting}
              isLastQuestion={
                currentQuestionIndex === attempt.questions.length - 1
              }
            />
          </div>
        </div>

        {/* Results Modal */}
        {showResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <Icon
                icon="solar:check-circle-bold"
                className="mx-auto text-6xl text-green-600 dark:text-green-400 mb-4"
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                تم إرسال الإجابات!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                جاري تحليل النتائج...
              </p>
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestAttemptPage;
