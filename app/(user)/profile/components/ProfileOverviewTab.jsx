import { getData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- Helper: Count Up Animation ---
const CountUp = ({ end, duration = 2000, suffix = "", decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      setCount(easeOutQuart * end);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <>
      {Number(count).toFixed(decimals)}
      {suffix}
    </>
  );
};

// --- Helper: Format Minutes to Hrs/Mins ---
const formatTime = (totalMinutes) => {
  if (totalMinutes < 60) return `${totalMinutes} دقيقة`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} ساعات`;
};

// --- 1. Animated Circular Progress ---
const CircularProgress = ({
  percentage,
  color,
  label,
  subLabel,
  icon,
  suffix = "%",
  decimals = 0,
}) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const targetOffset =
      circumference - (Math.min(percentage, 100) / 100) * circumference;
    const timer = setTimeout(() => {
      setOffset(targetOffset);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 hover:shadow-lg duration-300 group">
      <div className="relative w-32 h-32 flex items-center justify-center mb-3">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${color} transition-all duration-[1500ms] ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon icon={icon} className={`w-8 h-8 ${color}`} />
        </div>
      </div>
      <div className="text-center">
        <span className={`text-2xl font-bold ${color}`}>
          <CountUp end={percentage} suffix={suffix} decimals={decimals} />
        </span>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subLabel}</p>
      </div>
    </div>
  );
};

// --- 2. Activity Chart Component (Dynamic Goal Logic + Error Handling) ---
const ActivityChart = () => {
  const [chartData, setChartData] = useState([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [viewMode, setViewMode] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Circle Animation State
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const [circleOffset, setCircleOffset] = useState(circumference);
  const [currentGoal, setCurrentGoal] = useState(60);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get Today's Usage
        const todayRes = await getData("/usage/today", true);
        const mins = todayRes?.total_minutes || 0;
        setTodayMinutes(mins);

        // --- DYNAMIC GOAL LOGIC (supports multi-hour sessions) ---
        // Goal is always the next full hour after current time
        const calculatedGoal = Math.max(Math.ceil(mins / 60) * 60, 60);
        setCurrentGoal(calculatedGoal);

        const percentage = Math.min((mins / calculatedGoal) * 100, 100);
        const targetOffset = circumference - (percentage / 100) * circumference;

        setTimeout(() => setCircleOffset(targetOffset), 300);

        // 2. Get Chart Data
        const endpoint =
          viewMode === "week" ? "/usage/chart/week" : "/usage/chart/month";
        const res = await getData(endpoint, true);

        if (res?.data && Array.isArray(res.data)) {
          const formattedData = res.data.map((day) => {
            const dateObj = new Date(day.date);
            return {
              name:
                viewMode === "week"
                  ? dateObj.toLocaleDateString("ar-EG", { weekday: "short" })
                  : dateObj.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "numeric",
                    }),
              minutes: day.minutes || 0,
              date: day.date,
              fullDate: dateObj.toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            };
          });
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Failed to load chart data", error);
        setError("فشل تحميل البيانات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode, circumference]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border-2 border-sky-200 dark:border-sky-700 shadow-xl rounded-xl text-right animate-in fade-in zoom-in duration-200">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {payload[0].payload.fullDate}
          </p>
          <p className="font-bold text-lg text-sky-600 dark:text-sky-400">
            {formatTime(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Determine Message based on time
  const getMotivationalMessage = (mins) => {
    if (mins === 0) return "ابدأ رحلة التعلم اليوم 🚀";
    if (mins < 30) return "بداية موفقة، استمر! 💪";
    if (mins < 60) return "اقتربت من ساعة دراسة! 🔥";
    if (mins < 120) return "أداء رائع! تجاوزت الساعة 🌟";
    if (mins < 180) return "إنجاز مذهل! ساعتين من التركيز 🎯";
    if (mins < 240) return "أنت آلة تعلم! 3 ساعات قوية 💎";
    return "أنت أسطورة حقيقية! 🏆";
  };

  // Calculate dynamic Y-axis max (round up to nearest 60)
  const maxMinutes = Math.max(
    ...chartData.map((d) => d.minutes),
    todayMinutes,
    60
  );
  const yAxisMax = Math.ceil(maxMinutes / 60) * 60;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Left: Today's Timer (Dynamic Scale) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-sky-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-sky-500"></div>

        <div className="w-full flex justify-between items-center mb-6">
          <span className="text-xs font-bold bg-sky-500 text-white px-3 py-1.5 rounded-lg shadow-md">
            الهدف: {currentGoal / 60} {currentGoal >= 120 ? "ساعات" : "ساعة"}
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            وقتك اليوم
            <Icon
              icon="solar:clock-circle-bold-duotone"
              className="text-sky-500 w-6 h-6"
            />
          </h3>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <svg
            className="transform -rotate-90"
            width="200"
            height="200"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circleOffset}
              strokeLinecap="round"
              className="text-blue-600 transition-all duration-[2000ms] ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-gray-900 dark:text-white">
              <CountUp end={todayMinutes} duration={2000} decimals={0} />
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
              دقيقة
            </span>
            {todayMinutes >= 60 && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                {(todayMinutes / 60).toFixed(1)} ساعة
              </span>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300 px-2">
          {getMotivationalMessage(todayMinutes)}
        </p>
      </div>

      {/* Right: Activity Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon
              icon="solar:graph-up-bold-duotone"
              className="text-sky-500 w-5 h-5 sm:w-6 sm:h-6"
            />
            تحليل النشاط
          </h3>
          <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-full sm:w-auto shadow-inner">
            {["week", "month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 ${
                  viewMode === mode
                    ? "bg-sky-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {mode === "week" ? "7 أيام" : "30 يوم"}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex-1 min-h-[250px] sm:min-h-[280px] w-full overflow-x-auto"
          style={{ direction: "ltr" }}
        >
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-3">
              <Icon
                icon="solar:loading-bold-duotone"
                className="animate-spin text-indigo-500 w-10 h-10"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                جاري تحميل البيانات...
              </p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-3">
              <Icon
                icon="solar:danger-circle-bold-duotone"
                className="text-red-500 w-10 h-10"
              />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-3">
              <Icon
                icon="solar:ghost-bold-duotone"
                className="text-gray-400 w-10 h-10"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                لا توجد بيانات متاحة
              </p>
            </div>
          ) : (
            <div className="w-full h-full min-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 5, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                    dy={8}
                    interval={viewMode === "month" ? 3 : 0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                    domain={[0, yAxisMax]}
                    ticks={Array.from(
                      { length: Math.ceil(yAxisMax / 60) + 1 },
                      (_, i) => i * 60
                    )}
                    tickFormatter={(val) =>
                      val >= 60 ? `${(val / 60).toFixed(0)}h` : `${val}m`
                    }
                    width={35}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(14, 165, 233, 0.1)", radius: 8 }}
                  />
                  <Bar
                    dataKey="minutes"
                    fill="#0ea5e9"
                    radius={[8, 8, 0, 0]}
                    barSize={viewMode === "week" ? 28 : 10}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 3. Main Profile Overview ---
const ProfileOverviewTab = ({ user, analytics }) => {
  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Icon
          icon="solar:loading-bold-duotone"
          className="w-10 h-10 animate-spin mb-3 text-blue-500"
        />
        <p>جاري تحليل بياناتك...</p>
      </div>
    );
  }

  const quizRatio = (analytics.quiz_attempts_ratio || 0) * 100;
  const courseScore = analytics.avg_course_quiz_score || 0;
  const ugqScore = analytics.avg_user_generated_questions_score || 0;

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-sky-500 rounded-2xl p-4 sm:p-6 shadow-lg text-white">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold">
            مرحباً، {user?.display_name || "يا بطل"} 👋
          </h2>
          <p className="text-sky-100 mt-1 sm:mt-2 text-sm sm:text-base">
            إليك نظرة شاملة على أدائك وتطورك
          </p>
        </div>
        <Icon
          icon="solar:star-bold-duotone"
          className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-300 hidden sm:block"
        />
      </div>

      {/* 1. Circular Analytics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CircularProgress
          percentage={courseScore}
          color="text-blue-500"
          label="معدل الكورسات"
          subLabel="الأداء العام"
          icon="solar:diploma-bold-duotone"
          decimals={1}
        />
        <CircularProgress
          percentage={quizRatio}
          color="text-purple-500"
          label="إكمال الاختبارات"
          subLabel={`${analytics.attempted_quizzes_count} من ${analytics.enrolled_quizzes_count} اختبار`}
          icon="solar:checklist-minimalistic-bold-duotone"
          decimals={0}
        />
        <CircularProgress
          percentage={ugqScore}
          color="text-emerald-500"
          label="التدريب الذاتي"
          subLabel="بنك الأسئلة"
          icon="solar:dumbbells-bold-duotone"
          decimals={2}
        />
      </div>

      {/* 2. Usage & Time Charts */}
      <ActivityChart />

      {/* 3. Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatBox
          icon="solar:book-bookmark-bold-duotone"
          color="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
          value={
            <CountUp end={analytics.total_courses_enrolled} decimals={0} />
          }
          label="الكورسات المسجلة"
        />
        <StatBox
          icon="solar:check-circle-bold-duotone"
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          value={<CountUp end={analytics.total_quizzes_passed} decimals={0} />}
          label="الاختبارات الناجحة"
        />
        <StatBox
          icon="solar:question-circle-bold-duotone"
          color="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
          value={
            <CountUp
              end={analytics.total_user_generated_questions}
              decimals={0}
            />
          }
          label="أسئلة قمت بإنشائها"
        />
        <StatBox
          icon="solar:stopwatch-bold-duotone"
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          value={
            <>
              <CountUp
                end={analytics.avg_time_per_quiz_attempt_seconds}
                decimals={1}
                suffix="ث"
              />
            </>
          }
          label="سرعة الحل"
        />
      </div>

      {/* 4. Top Course Highlight */}
      {analytics.top_courses_by_score &&
        analytics.top_courses_by_score.length > 0 && (
          <div className="mt-2">
            <div className="bg-sky-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-blue-400 opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <span className="text-sky-200 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Icon icon="solar:cup-star-bold" className="w-4 h-4" />
                    أعلى معدل درجات
                  </span>
                  <h4 className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2 truncate">
                    {analytics.top_courses_by_score[0].course_name}
                  </h4>
                  <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
                      <Icon
                        icon="solar:chart-square-bold"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                      <span className="font-bold text-base sm:text-lg">
                        <CountUp
                          end={analytics.top_courses_by_score[0].avg_score}
                          suffix="%"
                          decimals={1}
                        />
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-100 text-sm sm:text-base">
                      <Icon
                        icon="solar:refresh-circle-bold"
                        className="w-4 h-4"
                      />
                      <span>
                        {analytics.top_courses_by_score[0].attempts_count}{" "}
                        محاولات
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block flex-shrink-0 mr-4">
                  <Icon
                    icon="solar:cup-star-bold-duotone"
                    className="w-20 h-20 sm:w-28 sm:h-28 text-yellow-400 drop-shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

// Stat Box
const StatBox = ({ icon, color, value, label }) => (
  <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300 group">
    <div
      className={`p-2.5 sm:p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}
    >
      <Icon
        icon={icon}
        width="24"
        height="24"
        className="w-5 h-5 sm:w-7 sm:h-7"
      />
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center truncate">
        {value}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
        {label}
      </p>
    </div>
  </div>
);

export default ProfileOverviewTab;
