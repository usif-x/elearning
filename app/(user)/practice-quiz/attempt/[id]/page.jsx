"use client";

import QuizNavigation from "@/app/(commerce)/courses/[id]/lecture/[lectureId]/content/[contentId]/quiz/components/QuizNavigation";
import QuizQuestion from "@/app/(commerce)/courses/[id]/lecture/[lectureId]/content/[contentId]/quiz/components/QuizQuestion";
import QuizStatsBar from "@/app/(commerce)/courses/[id]/lecture/[lectureId]/content/[contentId]/quiz/components/QuizStatsBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getPracticeQuizQuestions,
  submitPracticeQuiz,
} from "@/services/PracticeQuiz";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const PracticeQuizAttemptPage = () => {
  const { id: practiceQuizId } = useParams();
  const router = useRouter();

  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const fetchQuizData = async () => {
      try {
        const data = await getPracticeQuizQuestions(practiceQuizId);

        if (data.is_completed) {
          toast.info("هذا الاختبار مكتمل بالفعل");
          router.push(`/practice-quiz/result/${practiceQuizId}`);
          return;
        }

        setQuizData(data);
        setQuestions(data.questions || []);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("حدث خطأ أثناء تحميل الاختبار");
        router.push("/practice-quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [practiceQuizId, router]);

  // Timer
  useEffect(() => {
    if (loading || submitting) return;

    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting, startTime]);

  const handleAnswerSelect = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestionIndex];
      return newAnswers;
    });
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(currentQuestionIndex)) {
        newFlagged.delete(currentQuestionIndex);
      } else {
        newFlagged.add(currentQuestionIndex);
      }
      return newFlagged;
    });
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const handleSubmit = async () => {
    const unansweredCount = questions.length - getAnsweredCount();

    if (unansweredCount > 0) {
      const result = await Swal.fire({
        title: "تأكيد التسليم",
        html: `لديك <strong>${unansweredCount}</strong> سؤال لم تتم الإجابة عليه.<br/>هل أنت متأكد من التسليم؟`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#ef4444",
        confirmButtonText: "نعم، تسليم",
        cancelButtonText: "إلغاء",
      });

      if (!result.isConfirmed) return;
    }

    setSubmitting(true);

    try {
      const submissionData = {
        answers: questions.map((_, index) => ({
          question_index: index,
          selected_answer: answers[index] ?? null,
        })),
        time_taken: timeElapsed,
      };

      await submitPracticeQuiz(practiceQuizId, submissionData);

      toast.success("تم تسليم الاختبار بنجاح!");
      router.push(`/practice-quiz/result/${practiceQuizId}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("حدث خطأ أثناء تسليم الاختبار");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quizData || questions.length === 0) {
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {quizData.title}
          </h1>
          {quizData.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {quizData.description}
            </p>
          )}
        </div>

        {/* Quiz Container */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Stats Bar - Note: Practice quiz shows elapsed time instead of remaining time */}
            <QuizStatsBar
              timeRemaining={timeElapsed}
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
              remainingCount={questions.length - getAnsweredCount()}
            />

            {/* Question Display */}
            <QuizQuestion
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              answer={answers[currentQuestionIndex] ?? null}
              flaggedQuestions={flaggedQuestions}
              onAnswerSelect={handleAnswerSelect}
              onClearAnswer={handleClearAnswer}
              onToggleFlag={handleToggleFlag}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmit}
              submitting={submitting}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeQuizAttemptPage;
