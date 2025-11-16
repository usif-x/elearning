import { Icon } from "@iconify/react";

const QuestionsForumQuizQuestion = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  answer,
  flaggedQuestions,
  onAnswerSelect,
  onClearAnswer,
  onToggleFlag,
  onPrevious,
  onNext,
  onSubmit,
  submitting,
  isLastQuestion,
}) => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Question Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 gap-3">
        <h2
          className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
          dir="rtl"
        >
          السؤال {currentQuestionIndex + 1} من {totalQuestions}
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          {answer !== null && (
            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap">
              تم الإجابة ✓
            </span>
          )}
          <button
            onClick={onToggleFlag}
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
            <Icon icon="solar:flag-bold" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
          >
            {submitting ? (
              <>
                <Icon icon="eos-icons:loading" className="w-4 h-4" />
                <span className="hidden sm:inline">جاري التسليم...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                <span>تسليم</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6 sm:mb-8">
        <p
          className="text-lg sm:text-xl text-gray-900 dark:text-white leading-relaxed"
          dir={/[\u0600-\u06FF]/.test(currentQuestion.question) ? "rtl" : "ltr"}
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
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {currentQuestion.options.map((option, optionIndex) => (
          <button
            key={optionIndex}
            onClick={() => onAnswerSelect(optionIndex)}
            className={`w-full p-3 sm:p-4 rounded-xl text-right transition-all duration-200 border-2 ${
              answer === optionIndex
                ? "bg-sky-50 dark:bg-sky-900/30 border-sky-500 ring-4 ring-sky-200 dark:ring-sky-900"
                : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20"
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center ${
                  answer === optionIndex
                    ? "bg-sky-500 border-sky-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {answer === optionIndex && (
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  />
                )}
              </div>
              <span
                className={`text-base sm:text-lg ${
                  answer === optionIndex
                    ? "text-sky-900 dark:text-sky-100 font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                }`}
                dir={/[\u0600-\u06FF]/.test(option) ? "rtl" : "ltr"}
                style={{
                  textAlign: /[\u0600-\u06FF]/.test(option) ? "right" : "left",
                }}
              >
                {option}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Clear Answer Button */}
      {answer !== null && (
        <div className="flex justify-center mb-6 sm:mb-8">
          <button
            onClick={onClearAnswer}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-200 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-sm sm:text-base"
          >
            <Icon
              icon="solar:close-circle-bold"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span>إلغاء الاختيار</span>
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 gap-3">
        <button
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base"
        >
          <Icon
            icon="solar:arrow-right-linear"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <span>السابق</span>
        </button>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 text-sm sm:text-base"
          >
            {submitting ? (
              <>
                <Icon
                  icon="eos-icons:loading"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span>جاري التسليم...</span>
              </>
            ) : (
              <>
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span>تسليم الاختبار</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 bg-sky-500 hover:bg-sky-600 text-white text-sm sm:text-base"
          >
            <span>التالي</span>
            <Icon
              icon="solar:arrow-left-linear"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionsForumQuizQuestion;
