import { Icon } from "@iconify/react";

const QuizQuestion = ({
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
  // Helper to detect Arabic text
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  const questionIsArabic = isArabic(currentQuestion.question);

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 gap-4">
        {/* Title / Counter */}
        <h2
          className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white"
          dir="rtl"
        >
          السؤال {currentQuestionIndex + 1}{" "}
          <span className="text-slate-400 text-lg">من {totalQuestions}</span>
        </h2>

        {/* Action Buttons Group */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full xl:w-auto">
          {/* Answered Status Badge */}
          {answer !== null && (
            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              تم الإجابة ✓
            </span>
          )}

          {/* Flag Button (Unique Colors) */}
          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-all
              ${
                flaggedQuestions.has(currentQuestionIndex)
                  ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                  : "bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-700"
              }`}
            title={
              flaggedQuestions.has(currentQuestionIndex)
                ? "إلغاء التعليم"
                : "تعليم للمراجعة"
            }
          >
            <Icon
              icon="solar:flag-bold"
              className={`w-5 h-5 ${
                flaggedQuestions.has(currentQuestionIndex)
                  ? "text-amber-500"
                  : "text-currentColor"
              }`}
            />
            <span className="hidden sm:inline">
              {flaggedQuestions.has(currentQuestionIndex) ? "معلّم" : "تعليم"}
            </span>
          </button>

          {/* Later Button (Unique: Orange/White style) */}
          <button
            onClick={onContinueLater}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-200 bg-orange-200 text-orange-500 hover:bg-orange-100 hover:border-orange-300 dark:bg-orange-900/10 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/30 transition-all text-sm font-bold"
            title="حفظ ومتابعة لاحقاً"
          >
            <Icon icon="solar:clock-circle-bold" className="w-5 h-5" />
            <span className="hidden sm:inline">لاحقاً</span>
          </button>

          {/* Top Submit Button (Unique: Solid Indigo) */}
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold ml-auto xl:ml-0"
          >
            {submitting ? (
              <Icon icon="eos-icons:loading" className="w-5 h-5" />
            ) : (
              <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
            )}
            <span>تسليم</span>
          </button>
        </div>
      </div>
      {/* --- END HEADER --- */}

      {/* Question Text */}
      <div className="mb-8">
        <p
          className={`text-lg sm:text-xl md:text-2xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed ${
            questionIsArabic ? "text-right" : "text-left"
          }`}
          dir={questionIsArabic ? "rtl" : "ltr"}
        >
          {currentQuestion.question}
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((option, optionIndex) => {
          const optionIsArabic = isArabic(option);
          const isSelected = answer === optionIndex;

          return (
            <button
              key={optionIndex}
              onClick={() => onAnswerSelect(optionIndex)}
              className={`w-full group relative p-4 rounded-2xl border-2 text-right transition-all duration-200 flex items-center gap-4
                ${
                  isSelected
                    ? "bg-sky-50 border-sky-500 dark:bg-sky-900/20 dark:border-sky-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600"
                }
              `}
            >
              {/* Radio Circle */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-colors
                  ${
                    isSelected
                      ? "border-sky-500 bg-sky-500"
                      : "border-slate-300 group-hover:border-sky-400 dark:border-slate-500"
                  }
                `}
              >
                {isSelected && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>

              {/* Text */}
              <span
                className={`flex-1 text-base sm:text-lg ${
                  isSelected
                    ? "text-sky-900 dark:text-sky-100 font-semibold"
                    : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                } ${optionIsArabic ? "text-right" : "text-left"}`}
                dir={optionIsArabic ? "rtl" : "ltr"}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
              bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Icon icon="solar:arrow-right-linear" className="w-5 h-5" />
            <span>السابق</span>
          </button>

          {answer !== null && (
            <button
              onClick={onClearAnswer}
              className="flex-none p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
              title="إلغاء الاختيار"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Button: Switch between Next (Sky) and Submit (Emerald) */}
        <div className="w-full sm:w-auto">
          {isLastQuestion ? (
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100
                bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none"
            >
              {submitting ? (
                <>
                  <Icon icon="eos-icons:loading" className="w-5 h-5" />
                  <span>جاري التسليم...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                  <span>تسليم الاختبار</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95
                bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200 dark:shadow-none"
            >
              <span>التالي</span>
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;
