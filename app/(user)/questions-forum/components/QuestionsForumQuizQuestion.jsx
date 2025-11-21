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
  onContinueLater,
  submitting,
  isLastQuestion,
}) => {
  // Detect if text is Arabic
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  const questionIsArabic = isArabic(currentQuestion.question);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Question Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700 gap-2 sm:gap-3">
        <h2
          className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white"
          dir="rtl"
        >
          السؤال {currentQuestionIndex + 1} من {totalQuestions}
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {answer !== null && (
            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap">
              تم الإجابة ✓
            </span>
          )}
          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all border text-[10px] sm:text-sm ${
              flaggedQuestions.has(currentQuestionIndex)
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-600 hover:border-amber-300 dark:hover:border-amber-700"
            }`}
            title={
              flaggedQuestions.has(currentQuestionIndex)
                ? "إلغاء التعليم"
                : "تعليم للمراجعة"
            }
          >
            <Icon
              icon="solar:flag-bold"
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-all ${
                flaggedQuestions.has(currentQuestionIndex)
                  ? "text-amber-500"
                  : "text-inherit"
              }`}
            />
            <span className="font-medium hidden xs:inline">
              {flaggedQuestions.has(currentQuestionIndex) ? "معلّم" : "تعليم"}
            </span>
          </button>

          <button
            onClick={onContinueLater}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white text-[10px] sm:text-xs whitespace-nowrap"
            title="حفظ ومتابعة لاحقاً"
          >
            <Icon
              icon="solar:clock-circle-bold"
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
            <span className="sm:inline">متابعة لاحقاً</span>
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-200 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 text-[10px] sm:text-xs whitespace-nowrap"
          >
            {submitting ? (
              <>
                <Icon
                  icon="eos-icons:loading"
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="hidden xs:inline">جاري...</span>
              </>
            ) : (
              <>
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
                <span>تسليم</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <p
          className={`text-base sm:text-lg md:text-xl text-gray-900 dark:text-white leading-relaxed ${
            questionIsArabic ? "text-right" : "text-left"
          }`}
          dir={questionIsArabic ? "rtl" : "ltr"}
        >
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 md:mb-8">
        {currentQuestion.options.map((option, optionIndex) => {
          const optionIsArabic = isArabic(option);
          return (
            <button
              key={optionIndex}
              onClick={() => onAnswerSelect(optionIndex)}
              className={`w-full p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all duration-200 border-2 ${
                answer === optionIndex
                  ? "bg-sky-50 dark:bg-sky-900/30 border-sky-500 ring-2 sm:ring-4 ring-sky-200 dark:ring-sky-900"
                  : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20"
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div
                  className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center ${
                    answer === optionIndex
                      ? "bg-sky-500 border-sky-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {answer === optionIndex && (
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white"
                    />
                  )}
                </div>
                <span
                  className={`text-sm sm:text-base md:text-lg flex-1 ${
                    answer === optionIndex
                      ? "text-sky-900 dark:text-sky-100 font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  } ${optionIsArabic ? "text-right" : "text-left"}`}
                  dir={optionIsArabic ? "rtl" : "ltr"}
                >
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Clear Answer Button */}
      {answer !== null && (
        <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
          <button
            onClick={onClearAnswer}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-200 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs sm:text-sm md:text-base"
          >
            <Icon
              icon="solar:close-circle-bold"
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
            />
            <span>إلغاء الاختيار</span>
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700 gap-2 sm:gap-3">
        <button
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs sm:text-sm md:text-base"
        >
          <Icon
            icon="solar:arrow-right-linear"
            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
          />
          <span className="xs:inline">السابق</span>
        </button>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-200 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 text-xs sm:text-sm md:text-base"
          >
            {submitting ? (
              <>
                <Icon
                  icon="eos-icons:loading"
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
                />
                <span className="xs:inline">جاري التسليم...</span>
              </>
            ) : (
              <>
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
                />
                <span>تسليم الاختبار</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-200 bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm md:text-base"
          >
            <span className="xs:inline">التالي</span>
            <Icon
              icon="solar:arrow-left-linear"
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionsForumQuizQuestion;
