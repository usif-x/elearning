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
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import CourseContentSection from "../components/CourseContentSection";
import QuizBreadcrumb from "../components/QuizBreadcrumb";
import QuizNavigation from "../components/QuizNavigation";
import QuizQuestion from "../components/QuizQuestion";
import QuizStatsBar from "../components/QuizStatsBar";

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
        text: `لقد حصلت على ${response.score || 0}% (${
          response.correct_answers
        } من ${response.total_questions})`,
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
        <QuizBreadcrumb
          courseId={courseId}
          lectureId={lectureId}
          contentId={contentId}
          courseName={course?.name}
          quizTitle={quizContent?.title}
        />
        {/* Quiz Container */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Top Stats Bar */}
            <QuizStatsBar
              timeRemaining={timeRemaining}
              answeredCount={getAnsweredCount()}
              totalQuestions={questions.length}
              flaggedCount={flaggedQuestions.size}
              currentQuestionIndex={currentQuestionIndex}
              formatTime={formatTime}
            />

            {/* Question Navigation */}
            <QuizNavigation
              questions={questions}
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
            <QuizQuestion
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
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
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              onSubmit={() => handleSubmit(false)}
              submitting={submitting}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
            />
          </div>
        </div>

        {/* Course Content Section */}
        <CourseContentSection
          lectures={lectures}
          activeLecture={activeLecture}
          setActiveLecture={setActiveLecture}
          courseId={courseId}
          lectureId={lectureId}
          contentId={contentId}
        />
      </div>
    </div>
  );
};

export default QuizAttemptPage;
