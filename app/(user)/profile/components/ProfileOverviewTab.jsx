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
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl transition-transform hover:scale-105 duration-300 group">
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
          <Icon
            icon={icon}
            className={`w-8 h-8 ${color.replace("text-", "text-opacity-80 ")}`}
          />
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

// --- 2. Activity Chart Component (Dynamic Goal Logic) ---
const ActivityChart = () => {
  const [chartData, setChartData] = useState([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [viewMode, setViewMode] = useState("week");
  const [loading, setLoading] = useState(true);

  // Circle Animation State
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const [circleOffset, setCircleOffset] = useState(circumference);
  const [currentGoal, setCurrentGoal] = useState(60);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get Today's Usage
        const todayRes = await getData("/usage/today", true);
        const mins = todayRes.total_minutes || 0;
        setTodayMinutes(mins);

        // --- DYNAMIC GOAL LOGIC ---
        // Goal is the next full hour.
        // Ex: 45m -> Goal 60m.
        // Ex: 70m -> Goal 120m (2 hrs).
        const calculatedGoal = Math.max(Math.ceil(mins / 60) * 60, 60);
        setCurrentGoal(calculatedGoal);

        const percentage = Math.min((mins / calculatedGoal) * 100, 100);
        const targetOffset = circumference - (percentage / 100) * circumference;

        setTimeout(() => setCircleOffset(targetOffset), 300);

        // 2. Get Chart Data
        const endpoint =
          viewMode === "week" ? "/usage/chart/week" : "/usage/chart/month";
        const res = await getData(endpoint, true);

        if (res.data) {
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
              minutes: day.minutes,
              date: day.date,
              fullDate: dateObj.toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            };
          });
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Failed to load chart data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode, circumference]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl text-right animate-in fade-in zoom-in duration-200">
          <p className="text-xs text-gray-500 mb-1">
            {payload[0].payload.fullDate}
          </p>
          <p className="font-bold text-indigo-600 dark:text-indigo-400">
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
    return "أنت طالب استثنائي! 🏆";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Left: Today's Timer (Dynamic Scale) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="w-full flex justify-between items-center mb-6">
          <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">
            الهدف: {currentGoal / 60} ساعة
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            وقتك اليوم
            <Icon
              icon="solar:clock-circle-bold-duotone"
              className="text-blue-500"
            />
          </h3>
        </div>

        <div className="relative">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-100 dark:text-gray-700"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circleOffset}
              strokeLinecap="round"
              className="text-blue-600 transition-all duration-[2000ms] ease-out shadow-blue-500/50"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-gray-900 dark:text-white">
              <CountUp end={todayMinutes} duration={2000} decimals={0} />
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              دقيقة
            </span>
            {todayMinutes >= 60 && (
              <span className="text-xs text-blue-600 font-medium mt-1 dir-ltr">
                ({(todayMinutes / 60).toFixed(1)} hrs)
              </span>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
          {getMotivationalMessage(todayMinutes)}
        </p>
      </div>

      {/* Right: Activity Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon
              icon="solar:graph-up-bold-duotone"
              className="text-indigo-500"
            />
            تحليل النشاط
          </h3>
          <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl self-end sm:self-auto">
            {["week", "month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  viewMode === mode
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm scale-105"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                {mode === "week" ? "7 أيام" : "30 يوم"}
              </button>
            ))}
          </div>
        </div>
        <div
          className="flex-1 min-h-[250px] w-full"
          style={{ direction: "ltr" }}
        >
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Icon
                icon="solar:loading-bold-duotone"
                className="animate-spin text-indigo-400 w-8 h-8"
              />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  dy={10}
                  interval={viewMode === "month" ? 2 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  tickFormatter={(val) =>
                    val >= 60 ? `${(val / 60).toFixed(0)}h` : `${val}m`
                  }
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="minutes"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  barSize={viewMode === "week" ? 32 : 12}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            مرحباً، {user?.display_name || "يا بطل"} 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إليك نظرة شاملة على أدائك وتطورك
          </p>
        </div>
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
          color="bg-indigo-100 text-indigo-600"
          value={
            <CountUp end={analytics.total_courses_enrolled} decimals={0} />
          }
          label="الكورسات المسجلة"
        />
        <StatBox
          icon="solar:check-circle-bold-duotone"
          color="bg-green-100 text-green-600"
          value={<CountUp end={analytics.total_quizzes_passed} decimals={0} />}
          label="الاختبارات الناجحة"
        />
        <StatBox
          icon="solar:question-circle-bold-duotone"
          color="bg-amber-100 text-amber-600"
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
          color="bg-rose-100 text-rose-600"
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <span className="text-blue-200 text-sm font-medium">
                    أعلى معدل درجات 🏆
                  </span>
                  <h4 className="text-2xl font-bold mt-1">
                    {analytics.top_courses_by_score[0].course_name}
                  </h4>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Icon icon="solar:chart-square-bold" />
                      <span className="font-bold">
                        <CountUp
                          end={analytics.top_courses_by_score[0].avg_score}
                          suffix="%"
                          decimals={1}
                        />
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <Icon icon="solar:refresh-circle-bold" />
                      <span>
                        {analytics.top_courses_by_score[0].attempts_count}{" "}
                        محاولات
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Icon
                    icon="solar:cup-star-bold-duotone"
                    className="w-24 h-24 text-yellow-400 drop-shadow-lg transform group-hover:rotate-12 transition-transform duration-500"
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
  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon icon={icon} width="24" height="24" />
    </div>
    <div>
      <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
        {value}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

export default ProfileOverviewTab;
