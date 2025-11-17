import { Icon } from "@iconify/react";

const QuizNavigation = ({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  flaggedQuestions,
  showOnlyFlagged,
  setShowOnlyFlagged,
  onToggleFlag,
  answeredCount,
  remainingCount,
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2"
          dir="rtl"
        >
          <Icon
            icon="solar:widget-5-bold"
            className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500"
          />
          التنقل بين الأسئلة
        </h3>
        <button
          onClick={() => setShowOnlyFlagged(!showOnlyFlagged)}
          className={`text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            showOnlyFlagged
              ? "bg-amber-500 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
          dir="rtl"
        >
          <Icon
            icon={showOnlyFlagged ? "solar:eye-bold" : "solar:filter-bold"}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
          />
          {showOnlyFlagged ? "عرض الكل" : "المعلّمة فقط"}
        </button>
      </div>

      {/* Question Stats */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-4 mb-3 text-xs flex-wrap"
        dir="rtl"
      >
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 sm:px-3 py-1.5 rounded-lg">
          <Icon
            icon="solar:clipboard-list-bold"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500"
          />
          <span className="text-gray-600 dark:text-gray-400">إجمالي:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 sm:px-3 py-1.5 rounded-lg">
          <Icon
            icon="solar:check-circle-bold"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500"
          />
          <span className="text-gray-600 dark:text-gray-400">تم الإجابة:</span>
          <span className="font-bold text-green-600 dark:text-green-400">
            {answeredCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 sm:px-3 py-1.5 rounded-lg">
          <Icon
            icon="solar:clock-circle-bold"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500"
          />
          <span className="text-gray-600 dark:text-gray-400">المتبقية:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {remainingCount}
          </span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-12 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 xl:grid-cols-30 gap-1 mb-2">
        {questions.map((_, index) => {
          if (showOnlyFlagged && !flaggedQuestions.has(index)) {
            return null;
          }
          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`aspect-square rounded font-semibold text-xs sm:text-[15px] transition-all duration-200 relative p-0.5 ${
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
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-500 drop-shadow"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs"
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
          <span className="text-gray-600 dark:text-gray-400">تم الإجابة</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            لم تتم الإجابة
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon icon="solar:flag-bold" className="w-3 h-3 text-amber-500" />
          <span className="text-gray-600 dark:text-gray-400">
            معلّم للمراجعة
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuizNavigation;
