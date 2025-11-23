import { Icon } from "@iconify/react";

const GuestQuestionsForumQuizStatsBar = ({
  timeElapsed,
  answeredCount,
  totalQuestions,
  flaggedCount,
  currentQuestionIndex,
  formatTime,
}) => {
  return (
    <div className="bg-sky-600 p-4 sm:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Timer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon
              icon="solar:clock-circle-bold"
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            />
            <span className="text-xs sm:text-sm text-white/90">
              الوقت المستغرق
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">
            {formatTime(timeElapsed)}
          </span>
        </div>

        {/* Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon
              icon="solar:clipboard-check-bold"
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            />
            <span className="text-xs sm:text-sm text-white/90">التقدم</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">
            {answeredCount}/{totalQuestions}
          </span>
        </div>

        {/* Flagged */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon
              icon="solar:flag-bold"
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            />
            <span className="text-xs sm:text-sm text-white/90">المعلّمة</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">
            {flaggedCount}
          </span>
        </div>

        {/* Current Question */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon
              icon="solar:question-circle-bold"
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            />
            <span className="text-xs sm:text-sm text-white/90">
              السؤال الحالي
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">
            {currentQuestionIndex + 1}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GuestQuestionsForumQuizStatsBar;
