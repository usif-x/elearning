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
  // Logic to detect Arabic text
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  const questionIsArabic = isArabic(currentQuestion.question);

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto">
      {/* Top Bar: Count & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
        <h2
          className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100"
          dir="rtl"
        >
          السؤال {currentQuestionIndex + 1}{" "}
          <span className="text-slate-400 font-medium">/ {totalQuestions}</span>
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          {answer !== null && (
            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
              مجاب ✓
            </span>
          )}

          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors
            ${
              flaggedQuestions.has(currentQuestionIndex)
                ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                : "bg-slate-100 border-transparent text-slate-500 hover:bg-amber-50 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <Icon
              icon="solar:flag-bold"
              className={`w-4 h-4 ${
                flaggedQuestions.has(currentQuestionIndex)
                  ? "text-amber-500"
                  : "text-currentColor"
              }`}
            />
            <span>
              {flaggedQuestions.has(currentQuestionIndex) ? "معلّم" : "تعليم"}
            </span>
          </button>

          <button
            onClick={onContinueLater}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors text-xs sm:text-sm font-semibold"
          >
            <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
            <span>لاحقاً</span>
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6 sm:mb-8">
        <p
          className={`text-lg sm:text-xl font-medium text-slate-900 dark:text-white leading-relaxed ${
            questionIsArabic ? "text-right" : "text-left"
          }`}
          dir={questionIsArabic ? "rtl" : "ltr"}
        >
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((option, optionIndex) => {
          const optionIsArabic = isArabic(option);
          const isSelected = answer === optionIndex;

          return (
            <button
              key={optionIndex}
              onClick={() => onAnswerSelect(optionIndex)}
              className={`w-full relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 sm:gap-4
                ${
                  isSelected
                    ? "bg-sky-50 border-sky-500 dark:bg-sky-900/20 dark:border-sky-500"
                    : "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600"
                }
              `}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[2.5px] flex items-center justify-center
                  ${
                    isSelected
                      ? "border-sky-500 bg-sky-500"
                      : "border-slate-300 dark:border-slate-500"
                  }
                `}
              >
                {isSelected && (
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-full h-full text-white"
                  />
                )}
              </div>

              <span
                className={`flex-1 text-sm sm:text-lg ${
                  isSelected
                    ? "text-sky-900 dark:text-sky-100 font-semibold"
                    : "text-slate-700 dark:text-slate-300"
                } ${optionIsArabic ? "text-right" : "text-left"}`}
                dir={optionIsArabic ? "rtl" : "ltr"}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 gap-3">
        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base"
          >
            <Icon icon="solar:arrow-right-linear" className="w-5 h-5" />
            <span className="hidden xs:inline">السابق</span>
          </button>

          {answer !== null && (
            <button
              onClick={onClearAnswer}
              className="px-3 py-2.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
            >
              <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
            </button>
          )}
        </div>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 transition-transform active:scale-95 text-sm sm:text-base"
          >
            {submitting ? (
              <>
                <Icon icon="eos-icons:loading" className="w-5 h-5" />
                <span>جاري...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                <span>تسليم</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white bg-sky-500 hover:bg-sky-600 transition-transform active:scale-95 text-sm sm:text-base"
          >
            <span>التالي</span>
            <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionsForumQuizQuestion;
