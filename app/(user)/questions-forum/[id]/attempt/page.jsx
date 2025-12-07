"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  startQuestionAttempt,
  submitQuestionAttempt,
} from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import QuestionsForumBreadcrumb from "../../components/QuestionsForumBreadcrumb";
import QuestionsForumQuizNavigation from "../../components/QuestionsForumQuizNavigation";
import QuestionsForumQuizQuestion from "../../components/QuestionsForumQuizQuestion";
import QuestionsForumQuizStatsBar from "../../components/QuestionsForumQuizStatsBar";

const QuestionAttemptPage = () => {
  const params = useParams();
  const router = useRouter();
  const questionSetId = params.id;
  const storageKey = `users_questions_attempt_${questionSetId}`;

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);

  useEffect(() => {
    fetchAttempt();
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttempt = async () => {
    setLoading(true);
    try {
      const data = await startQuestionAttempt(questionSetId);
      setAttempt(data);
      // Initialize answers object
      const initialAnswers = {};
      data.questions.forEach((_, index) => {
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
          } = JSON.parse(savedData);
          setAnswers(savedAnswers);
          setTimeElapsed(savedTime);
          setFlaggedQuestions(new Set(savedFlagged));
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      }
    } catch (error) {
      console.error("Error starting attempt:", error);
      toast.error("حدث خطأ أثناء بدء المحاولة");
      router.push(`/questions-forum`);
    } finally {
      setLoading(false);
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
  const getFilteredQuestions = () => {
    if (!showOnlyFlagged || !attempt) {
      return attempt?.questions.map((q, index) => index) || [];
    }
    return attempt.questions
      .map((q, index) => index)
      .filter((index) => flaggedQuestions.has(index));
  };

  const handlePrevious = () => {
    if (showOnlyFlagged) {
      const filteredIndices = getFilteredQuestions();
      const currentPos = filteredIndices.indexOf(currentQuestionIndex);
      if (currentPos > 0) {
        setCurrentQuestionIndex(filteredIndices[currentPos - 1]);
      }
    } else {
      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (showOnlyFlagged) {
      const filteredIndices = getFilteredQuestions();
      const currentPos = filteredIndices.indexOf(currentQuestionIndex);
      if (currentPos < filteredIndices.length - 1) {
        setCurrentQuestionIndex(filteredIndices[currentPos + 1]);
      }
    } else {
      setCurrentQuestionIndex((prev) =>
        Math.min(attempt.questions.length - 1, prev + 1)
      );
    }
  };

  const isLastInView = () => {
    if (showOnlyFlagged) {
      const filteredIndices = getFilteredQuestions();
      const currentPos = filteredIndices.indexOf(currentQuestionIndex);
      return currentPos === filteredIndices.length - 1;
    }
    return currentQuestionIndex === attempt?.questions.length - 1;
  };

  const isFirstInView = () => {
    if (showOnlyFlagged) {
      const filteredIndices = getFilteredQuestions();
      const currentPos = filteredIndices.indexOf(currentQuestionIndex);
      return currentPos === 0;
    }
    return currentQuestionIndex === 0;
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
        answers: formattedAnswers,
        time_taken: timeElapsed,
      };
      const result = await submitQuestionAttempt(
        attempt.attempt_id,
        submissionData
      );
      setShowResults(true);
      toast.success("تم إرسال الإجابات بنجاح!");
      // Remove saved data
      localStorage.removeItem(storageKey);
      // Redirect to results page after a short delay
      setTimeout(() => {
        router.push(`/questions-forum/attempts/${result.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting attempt:", error);
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
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      toast.success("تم حفظ التقدم!");
      router.push("/questions-forum");
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
    return attempt.questions.length - getAnsweredCount();
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

  if (!attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">لم يتم العثور على المحاولة</p>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <QuestionsForumBreadcrumb
          questionSetId={questionSetId}
          questionSetTitle={attempt.title}
        />

        {/* Quiz Container */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Top Stats Bar */}
            <QuestionsForumQuizStatsBar
              timeElapsed={timeElapsed}
              answeredCount={getAnsweredCount()}
              totalQuestions={attempt.questions.length}
              flaggedCount={flaggedQuestions.size}
              currentQuestionIndex={currentQuestionIndex}
              formatTime={formatTime}
            />

            {/* Question Navigation */}
            <QuestionsForumQuizNavigation
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
            <QuestionsForumQuizQuestion
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
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={() => handleSubmit()}
              onContinueLater={() => handleContinueLater()}
              submitting={submitting}
              isLastQuestion={
                currentQuestionIndex === attempt.questions.length - 1
              }
              isFirstInView={isFirstInView()}
              isLastInView={isLastInView()}
              showOnlyFlagged={showOnlyFlagged}
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

export default QuestionAttemptPage;
