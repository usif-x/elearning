import { Icon } from "@iconify/react";

const GuestQuestionsForumQuizNavigation = ({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  flaggedQuestions,
  showOnlyFlagged,
  setShowOnlyFlagged,
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
            icon="solar:clipboard-check-bold"
            className="w-3.5 h-3.5 text-green-500"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            تم الإجابة: {answeredCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 sm:px-3 py-1.5 rounded-lg">
          <Icon
            icon="solar:clock-circle-bold"
            className="w-3.5 h-3.5 text-orange-500"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            متبقي: {remainingCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 sm:px-3 py-1.5 rounded-lg">
          <Icon icon="solar:flag-bold" className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            معلّمة: {flaggedQuestions.size}
          </span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-2 sm:gap-3">
        {questions.map((_, index) => {
          if (showOnlyFlagged && !flaggedQuestions.has(index)) {
            return null;
          }

          const isAnswered = answers[index] !== null;
          const isFlagged = flaggedQuestions.has(index);
          const isCurrent = index === currentQuestionIndex;

          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isCurrent
                  ? "bg-sky-500 text-white shadow-lg scale-110"
                  : isAnswered
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                  : isFlagged
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-600 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
              }`}
              title={`السؤال ${index + 1}${isAnswered ? " - تم الإجابة" : ""}${
                isFlagged ? " - معلّم للمراجعة" : ""
              }`}
            >
              {index + 1}
              {isFlagged && !isCurrent && (
                <Icon
                  icon="solar:flag-bold"
                  className="absolute -top-1 -right-1 w-3 h-3 text-amber-500"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GuestQuestionsForumQuizNavigation;
