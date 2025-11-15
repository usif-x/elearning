"use client";

import {
  getCourseById,
  getCourseLectures,
  getQuizAttempts,
  resumeQuiz,
  startQuiz,
  submitQuizAttempt,
} from "@/services/Courses";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const QuizAttemptPage = () => {
  const { id: courseId, lectureId, contentId } = useParams();
  const router = useRouter();

  // Quiz data
  const [quizContent, setQuizContent] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Timer
  const [startedAt, setStartedAt] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Course navigation
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);

  // Loading
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Prevent double initialization
  const initRef = useRef(false);

  // LocalStorage key for this specific attempt
  const getStorageKey = (attemptId) => `quiz_attempt_${attemptId}`;

  // Load saved data from localStorage
  const loadSavedData = (attemptId) => {
    if (!attemptId) return null;
    try {
      const saved = localStorage.getItem(getStorageKey(attemptId));
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error loading saved quiz data:", error);
      return null;
    }
  };

  // Save data to localStorage
  const saveToLocalStorage = (attemptId, data) => {
    if (!attemptId) return;
    try {
      localStorage.setItem(getStorageKey(attemptId), JSON.stringify(data));
    } catch (error) {
      console.error("Error saving quiz data:", error);
    }
  };

  // Clear localStorage for this attempt
  const clearLocalStorage = (attemptId) => {
    if (!attemptId) return;
    try {
      localStorage.removeItem(getStorageKey(attemptId));
    } catch (error) {
      console.error("Error clearing quiz data:", error);
    }
  };

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    const initQuiz = async () => {
      try {
        // First, check if there's an incomplete attempt
        const attemptsData = await getQuizAttempts(
          courseId,
          lectureId,
          contentId
        );

        let quizResponse;

        if (attemptsData.incomplete_attempt) {
          // Resume the incomplete attempt
          quizResponse = await resumeQuiz(courseId, lectureId, contentId);
        } else {
          // Start a new quiz
          quizResponse = await startQuiz(courseId, lectureId, contentId);
        }

        const [courseData, lecturesData] = await Promise.all([
          getCourseById(courseId),
          getCourseLectures(courseId),
        ]);

        setQuizContent(quizResponse.content);
        setAttemptId(quizResponse.attempt_id);
        setQuestions(quizResponse.content.questions || []);
        setCourse(courseData);
        setLectures(lecturesData);
        setActiveLecture(parseInt(lectureId));

        // Load saved data from localStorage or initialize empty
        const savedData = loadSavedData(quizResponse.attempt_id);

        if (savedData) {
          // Restore saved answers, flags, and timer
          setAnswers(savedData.answers || {});
          setFlaggedQuestions(new Set(savedData.flaggedQuestions || []));
          // Restore elapsed time from saved data
          const savedElapsed = savedData.timeElapsed || 0;
          setTimeElapsed(savedElapsed);
          // Calculate remaining time
          const totalTime = quizResponse.content.quiz_duration * 60;
          setTimeRemaining(Math.max(0, totalTime - savedElapsed));
          // Set start time adjusted for elapsed time
          const adjustedStartTime = new Date(Date.now() - savedElapsed * 1000);
          setStartedAt(adjustedStartTime);
        } else {
          // Initialize empty answers and fresh timer
          const initialAnswers = {};
          quizResponse.content.questions.forEach((_, index) => {
            initialAnswers[index] = null;
          });
          setAnswers(initialAnswers);
          setFlaggedQuestions(new Set());
          setStartedAt(new Date());
          setTimeRemaining(quizResponse.content.quiz_duration * 60);
        }
      } catch (error) {
        console.error("Error initializing quiz:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ أثناء تحميل الاختبار",
          confirmButtonText: "حسناً",
        }).then(() => {
          router.push(
            `/courses/${courseId}/lecture/${lectureId}/content/${contentId}`
          );
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lectureId && contentId) {
      initQuiz();
    }
  }, [courseId, lectureId, contentId, router]);

  // Timer effect
  useEffect(() => {
    if (!startedAt || loading || submitting) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((new Date() - startedAt) / 1000);
      setTimeElapsed(elapsed);

      const remaining = Math.max(
        0,
        (quizContent?.quiz_duration || 0) * 60 - elapsed
      );
      setTimeRemaining(remaining);

      // Auto-submit when time runs out
      if (remaining === 0) {
        clearInterval(timer);
        handleSubmit(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, loading, submitting, quizContent]);

  // Save answers, flags, and time to localStorage whenever they change
  useEffect(() => {
    if (attemptId && !loading) {
      saveToLocalStorage(attemptId, {
        answers,
        flaggedQuestions: Array.from(flaggedQuestions),
        timeElapsed,
        lastSaved: new Date().toISOString(),
      });
    }
  }, [answers, flaggedQuestions, timeElapsed, attemptId, loading]);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleClearAnswer = (questionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: null,
    }));
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

  const getFilteredQuestions = () => {
    if (!showOnlyFlagged) {
      return questions.map((q, index) => index);
    }
    return questions
      .map((q, index) => index)
      .filter((index) => flaggedQuestions.has(index));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const result = await Swal.fire({
        title: "تأكيد التسليم",
        text: "هل أنت متأكد من رغبتك في تسليم الاختبار؟ لن تتمكن من تعديل إجاباتك بعد التسليم.",
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

      const response = await submitQuizAttempt(courseId, lectureId, contentId, {
        answers: formattedAnswers,
        time_taken: Math.floor(timeElapsed / 60), // Convert seconds to minutes
        started_at: startedAt.toISOString(),
        attempt_id: attemptId,
      });

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "تم التسليم بنجاح",
        text: `لقد حصلت على ${response.score}% (${response.correct_answers} من ${response.total_questions})`,
        confirmButtonText: "عرض النتائج",
        confirmButtonColor: "#0ea5e9",
      });

      // Clear localStorage after successful submission
      clearLocalStorage(attemptId);

      // Redirect to results in profile or back to content page
      if (response.show_correct_answers) {
        router.push(`/profile/quiz-result/${response.id}`);
      } else {
        router.push(
          `/courses/${courseId}/lecture/${lectureId}/content/${contentId}`
        );
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء تسليم الاختبار",
        confirmButtonText: "حسناً",
      });
    } finally {
      setSubmitting(false);
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
    return questions.length - getAnsweredCount();
  };

  if (loading) {
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

  if (!quizContent || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">لا يوجد أسئلة في هذا الاختبار</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          dir="rtl"
        >
          <Link
            href="/courses"
            className="hover:text-sky-500 transition-colors"
          >
            الكورسات
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <Link
            href={`/courses/${courseId}`}
            className="hover:text-sky-500 transition-colors"
          >
            {course?.name}
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <Link
            href={`/courses/${courseId}/lecture/${lectureId}/content/${contentId}`}
            className="hover:text-sky-500 transition-colors"
          >
            {quizContent?.title}
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-semibold">
            محاولة الاختبار
          </span>
        </div>
        {/* Quiz Container */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Top Stats Bar */}
            <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Timer */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      icon="solar:clock-circle-bold"
                      className="w-5 h-5 text-white"
                    />
                    <span className="text-sm text-white/90">الوقت المتبقي</span>
                  </div>
                  <span
                    className={`text-2xl font-bold text-white ${
                      timeRemaining < 60 ? "animate-pulse" : ""
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>

                {/* Progress */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      icon="solar:clipboard-check-bold"
                      className="w-5 h-5 text-white"
                    />
                    <span className="text-sm text-white/90">التقدم</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {getAnsweredCount()}/{questions.length}
                  </span>
                </div>

                {/* Flagged */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      icon="solar:flag-bold"
                      className="w-5 h-5 text-white"
                    />
                    <span className="text-sm text-white/90">المعلّمة</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {flaggedQuestions.size}
                  </span>
                </div>

                {/* Current Question */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      icon="solar:question-circle-bold"
                      className="w-5 h-5 text-white"
                    />
                    <span className="text-sm text-white/90">السؤال الحالي</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {currentQuestionIndex + 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2"
                  dir="rtl"
                >
                  <Icon
                    icon="solar:widget-5-bold"
                    className="w-5 h-5 text-sky-500"
                  />
                  التنقل بين الأسئلة
                </h3>
                <button
                  onClick={() => setShowOnlyFlagged(!showOnlyFlagged)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    showOnlyFlagged
                      ? "bg-amber-500 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  dir="rtl"
                >
                  <Icon
                    icon={
                      showOnlyFlagged ? "solar:eye-bold" : "solar:filter-bold"
                    }
                    className="w-3.5 h-3.5"
                  />
                  {showOnlyFlagged ? "عرض الكل" : "المعلّمة فقط"}
                </button>
              </div>

              {/* Question Stats */}
              <div
                className="flex items-center justify-center gap-4 mb-3 text-xs"
                dir="rtl"
              >
                <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                  <Icon
                    icon="solar:clipboard-list-bold"
                    className="w-4 h-4 text-sky-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    إجمالي:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {questions.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    تم الإجابة:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {getAnsweredCount()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                  <Icon
                    icon="solar:clock-circle-bold"
                    className="w-4 h-4 text-amber-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    المتبقية:
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {getRemainingCount()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-12 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 xl:grid-cols-30 gap-1 mb-2">
                {questions.map((_, index) => {
                  if (showOnlyFlagged && !flaggedQuestions.has(index)) {
                    return null;
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded font-semibold text-[15px] transition-all duration-200 relative p-0.5 ${
                        currentQuestionIndex === index
                          ? "bg-sky-500 text-white ring-2 ring-sky-200 dark:ring-sky-900 scale-105 shadow-md"
                          : answers[index] !== null
                          ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {index + 1}
                      {flaggedQuestions.has(index) && (
                        <Icon
                          icon="solar:flag-bold"
                          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-amber-500 drop-shadow"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div
                className="flex flex-wrap items-center justify-center gap-3 text-xs"
                dir="rtl"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-sky-500 rounded shadow"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    السؤال الحالي
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-500 rounded shadow"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    تم الإجابة
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    لم تتم الإجابة
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon
                    icon="solar:flag-bold"
                    className="w-3 h-3 text-amber-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    معلّم للمراجعة
                  </span>
                </div>
              </div>
            </div>

            {/* Question Display */}
            <div className="p-8">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  dir="rtl"
                >
                  السؤال {currentQuestionIndex + 1} من {questions.length}
                </h2>
                <div className="flex items-center gap-3">
                  {answers[currentQuestionIndex] !== null && (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm font-semibold px-3 py-1 rounded-full">
                      تم الإجابة ✓
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleFlag(currentQuestionIndex)}
                    className={`p-2 rounded-lg transition-all ${
                      flaggedQuestions.has(currentQuestionIndex)
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-amber-500"
                    }`}
                    title={
                      flaggedQuestions.has(currentQuestionIndex)
                        ? "إلغاء التعليم"
                        : "تعليم للمراجعة"
                    }
                  >
                    <Icon icon="solar:flag-bold" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <p
                  className="text-xl text-gray-900 dark:text-white leading-relaxed"
                  dir={
                    /[\u0600-\u06FF]/.test(currentQuestion.question)
                      ? "rtl"
                      : "ltr"
                  }
                  style={{
                    textAlign: /[\u0600-\u06FF]/.test(currentQuestion.question)
                      ? "right"
                      : "left",
                  }}
                >
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    onClick={() =>
                      handleAnswerSelect(currentQuestionIndex, optionIndex)
                    }
                    className={`w-full p-4 rounded-xl text-right transition-all duration-200 border-2 ${
                      answers[currentQuestionIndex] === optionIndex
                        ? "bg-sky-50 dark:bg-sky-900/30 border-sky-500 ring-4 ring-sky-200 dark:ring-sky-900"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestionIndex] === optionIndex
                            ? "bg-sky-500 border-sky-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {answers[currentQuestionIndex] === optionIndex && (
                          <Icon
                            icon="solar:check-circle-bold"
                            className="w-5 h-5 text-white"
                          />
                        )}
                      </div>
                      <span
                        className={`text-lg ${
                          answers[currentQuestionIndex] === optionIndex
                            ? "text-sky-900 dark:text-sky-100 font-semibold"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        dir={/[\u0600-\u06FF]/.test(option) ? "rtl" : "ltr"}
                        style={{
                          textAlign: /[\u0600-\u06FF]/.test(option)
                            ? "right"
                            : "left",
                        }}
                      >
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Clear Answer Button */}
              {answers[currentQuestionIndex] !== null && (
                <div className="flex justify-center mb-8">
                  <button
                    onClick={() => handleClearAnswer(currentQuestionIndex)}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
                    <span>إلغاء الاختيار</span>
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <Icon icon="solar:arrow-right-linear" className="w-5 h-5" />
                  <span>السابق</span>
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Icon icon="eos-icons:loading" className="w-5 h-5" />
                        <span>جاري التسليم...</span>
                      </>
                    ) : (
                      <>
                        <Icon
                          icon="solar:check-circle-bold"
                          className="w-5 h-5"
                        />
                        <span>تسليم الاختبار</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    <span>التالي</span>
                    <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Course Content Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <Icon
                icon="solar:notebook-bold-duotone"
                className="w-20 h-20 text-sky-500"
              />
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3"
              dir="rtl"
            >
              محتوى الكورس
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400" dir="rtl">
              استكشف جميع المحاضرات والدروس المتاحة في هذا الكورس
            </p>
            {lectures.length > 0 && (
              <div className="mt-4 inline-flex items-center space-x-2 space-x-reverse bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-full">
                <Icon icon="mdi:folder-multiple" className="w-5 h-5" />
                <span className="font-semibold">{lectures.length} محاضرة</span>
              </div>
            )}
          </div>

          {lectures.length > 0 ? (
            <div className="space-y-6">
              {lectures.map((lecture, lectureIndex) => (
                <div
                  key={lecture.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setActiveLecture(
                        activeLecture === lecture.id ? null : lecture.id
                      )
                    }
                    className="w-full p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-sky-50 hover:to-transparent dark:hover:from-sky-900/20 dark:hover:to-transparent transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="bg-sky-100 dark:bg-sky-900/30 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <Icon
                          icon="solar:folder-with-files-bold-duotone"
                          className="w-8 h-8 text-sky-500"
                        />
                      </div>
                      <div className="text-right">
                        <span
                          className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white block"
                          dir="rtl"
                        >
                          {lecture.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {lecture.contents?.length || 0} عنصر
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div
                        className={`transform transition-transform duration-200 ${
                          activeLecture === lecture.id ? "rotate-180" : ""
                        }`}
                      >
                        <Icon
                          icon="solar:alt-arrow-down-bold"
                          className="w-7 h-7 text-sky-500"
                        />
                      </div>
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      activeLecture === lecture.id
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {lecture.contents && (
                      <div className="p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50">
                        {lecture.contents.map((lectureContent) => {
                          const getContentIcon = () => {
                            switch (lectureContent.content_type) {
                              case "video":
                                return {
                                  icon: "solar:play-circle-bold-duotone",
                                  color: "text-sky-500",
                                  bg: "bg-sky-100 dark:bg-sky-900/30",
                                };
                              case "photo":
                                return {
                                  icon: "solar:gallery-bold-duotone",
                                  color: "text-pink-500",
                                  bg: "bg-pink-100 dark:bg-pink-900/30",
                                };
                              case "file":
                                return {
                                  icon: "solar:file-text-bold-duotone",
                                  color: "text-blue-500",
                                  bg: "bg-blue-100 dark:bg-blue-900/30",
                                };
                              case "audio":
                                return {
                                  icon: "solar:music-library-bold-duotone",
                                  color: "text-purple-500",
                                  bg: "bg-purple-100 dark:bg-purple-900/30",
                                };
                              case "quiz":
                                return {
                                  icon: "solar:clipboard-list-bold-duotone",
                                  color: "text-indigo-500",
                                  bg: "bg-indigo-100 dark:bg-indigo-900/30",
                                };
                              case "link":
                                return {
                                  icon: "solar:link-bold-duotone",
                                  color: "text-amber-500",
                                  bg: "bg-amber-100 dark:bg-amber-900/30",
                                };
                              default:
                                return {
                                  icon: "solar:document-bold-duotone",
                                  color: "text-gray-500",
                                  bg: "bg-gray-100 dark:bg-gray-900/30",
                                };
                            }
                          };

                          const contentStyle = getContentIcon();
                          const isCurrentContent =
                            lectureContent.id === parseInt(contentId) &&
                            lecture.id === parseInt(lectureId);

                          return (
                            <Link
                              key={lectureContent.id}
                              href={`/courses/${courseId}/lecture/${lecture.id}/content/${lectureContent.id}`}
                              className={`block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 ${
                                isCurrentContent ? "ring-2 ring-sky-500" : ""
                              }`}
                            >
                              <div className="p-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3 space-x-reverse flex-1">
                                  <div
                                    className={`${contentStyle.bg} p-2 rounded-lg`}
                                  >
                                    <Icon
                                      icon={contentStyle.icon}
                                      className={`w-5 h-5 ${contentStyle.color}`}
                                    />
                                  </div>
                                  <div className="flex-1 text-right">
                                    <span
                                      className="text-sm md:text-base font-semibold text-gray-900 dark:text-white block"
                                      dir="rtl"
                                    >
                                      {lectureContent.title}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {lectureContent.content_type === "video"
                                        ? "فيديو"
                                        : lectureContent.content_type ===
                                          "photo"
                                        ? "صورة"
                                        : lectureContent.content_type === "file"
                                        ? "ملف"
                                        : lectureContent.content_type ===
                                          "audio"
                                        ? "صوت"
                                        : lectureContent.content_type === "quiz"
                                        ? "اختبار"
                                        : lectureContent.content_type === "link"
                                        ? "رابط"
                                        : lectureContent.content_type}
                                    </span>
                                  </div>
                                </div>
                                {isCurrentContent && (
                                  <div className="bg-sky-500 text-white text-xs font-bold py-1 px-3 rounded-full">
                                    جاري العرض
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <Icon
                icon="solar:file-corrupted-bold-duotone"
                className="w-24 h-24 mx-auto mb-6 text-gray-400"
              />
              <p className="text-xl font-semibold" dir="rtl">
                لا يوجد محتوى متاح لهذا الكورس حالياً
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptPage;
