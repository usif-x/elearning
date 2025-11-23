import { Icon } from "@iconify/react";

const GuestQuestionsForumQuizQuestion = ({
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
              icon={
                flaggedQuestions.has(currentQuestionIndex)
                  ? "solar:flag-2-bold"
                  : "solar:flag-bold"
              }
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
            <span className="hidden sm:inline">
              {flaggedQuestions.has(currentQuestionIndex) ? "معلّم" : "علّم"}
            </span>
          </button>
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-6 sm:mb-8">
        <div
          className={`text-base sm:text-lg md:text-xl leading-relaxed text-gray-900 dark:text-white mb-6 sm:mb-8 ${
            questionIsArabic ? "text-right" : "text-left"
          }`}
          dir={questionIsArabic ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
        />

        {/* Options */}
        <div className="space-y-3 sm:space-y-4">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = answer === optionIndex;
            const optionIsArabic = isArabic(option);

            return (
              <button
                key={optionIndex}
                onClick={() => onAnswerSelect(optionIndex)}
                className={`w-full p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                dir={optionIsArabic ? "rtl" : "ltr"}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-500"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {isSelected && (
                      <Icon
                        icon="solar:check-bold"
                        className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      />
                    )}
                  </div>
                  <div
                    className={`text-sm sm:text-base md:text-lg leading-relaxed ${
                      isSelected
                        ? "text-sky-900 dark:text-sky-100"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    dangerouslySetInnerHTML={{ __html: option }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
        {/* Navigation Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              icon="solar:alt-arrow-right-bold"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="hidden sm:inline">السابق</span>
          </button>

          <button
            onClick={onNext}
            disabled={isLastQuestion}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">التالي</span>
            <Icon
              icon="solar:alt-arrow-left-bold"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        </div>

        {/* Clear Answer */}
        {answer !== null && (
          <button
            onClick={onClearAnswer}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg sm:rounded-xl font-medium transition-all hover:bg-red-200 dark:hover:bg-red-900/30"
          >
            <Icon
              icon="solar:trash-bin-minimalistic-bold"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="hidden sm:inline">مسح الإجابة</span>
          </button>
        )}

        {/* Submit/Continue Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onContinueLater}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg sm:rounded-xl font-medium transition-all hover:bg-amber-200 dark:hover:bg-amber-900/30"
          >
            <Icon
              icon="solar:pause-circle-bold"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="hidden sm:inline">متابعة لاحقاً</span>
          </button>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg sm:rounded-xl font-bold transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {submitting ? (
              <>
                <Icon
                  icon="eos-icons:loading"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span>إرسال الإجابات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestQuestionsForumQuizQuestion;
