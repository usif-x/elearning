"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getPracticeQuizDetailedResult } from "@/services/PracticeQuiz";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PracticeQuizResultPage = () => {
  const { id: practiceQuizId } = useParams();
  const router = useRouter();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");

  const scoreMessages = {
    "0-10": [
      "بلاش خالص… الكراسة رفضت تكتبلك 😭",
      "زفت… حتى الغلطة فيها أكتر منك 😅",
      "خرا… الورقة نفسها عيطت لما شافت درجتك 😂",
      "محتاج تشد حيلك… جامد 😬",
      "لا حول ولا قوة… ده ولا امتحان 😭",
      "نكتة مش امتحان 🤣",
      "البلاعة نفسها عايزة ترمي الورقة منك 😂",
      "صفر على الشمال… ومستنيك تقوم 😴",
      "الكراسة مستسلمة 😆",
      "المرة الجاية حظك هيبقى أحسن 😅",
    ],
    "11-20": [
      "نص نص… بس النص الفاضل كله فشل 😅",
      "زفت… بس فيه بصيص أمل صغير 😬",
      "محتاج تشد حيلك جامد 💪",
      "الورقة نفسها مش قادرة تصدقك 🤯",
      "حاولت… بس ده مش كفاية 😭",
      "البلاصة فاضية… ضيعناها 😂",
      "خرا… بس فيه نص نقطة حلوة 😆",
      "المرة الجاية هتبقى أحسن 😎",
      "محتاج تعمل review سريع 📚",
      "اللي مكتوب على الورقة بيعيط عليك 😭",
    ],
    "21-30": [
      "حاولت… بس البلاصة لسه فاضية 😬",
      "خرا… بس فيه لمحة أمل 🤏",
      "محتاج تشد حيلك أكتر 💪",
      "الورقة نفسها بتحاول تصبر عليك 😂",
      "زفت… محتاج تركيز شوية",
      "نص نقطة ضاعت منك 😅",
      "البلاصة فاضية… خالص 😭",
      "ده لسه الطريق طويل 😎",
      "حاول… المرة الجاية هيبقى أحسن",
      "الكراسة مستنية منك مجهود أكتر 😆",
    ],
    "31-40": [
      "لسه تحت المتوسط… محتاج مجهود 😅",
      "شوية كده… بس لسه زفت 😬",
      'الورقة نفسها بتقول: "فيه شغل على نفسك" 🤦‍♂️',
      "البلاصة لسه مش مليانة 😂",
      "حاولت… بس مش كفاية 😭",
      "محتاج تعمل revision سريع 💪",
      "خرا… بس مش وحش أوي",
      "نص الطريق… نص البلاصة فاضي 😆",
      "التجربة حلوة… بس محتاجة تحسين",
      "ده مش فشل كامل… شوية زيادة وهتبقى تمام 😎",
    ],
    "41-50": [
      "نص نص… نص كويس ونص زفت 😅",
      "البلاصة بدأت تملي شوية 💪",
      "الورقة نفسها مبسوطة شوية 😆",
      "محتاج تركيز زيادة",
      "زفت… بس فيه أمل 😬",
      "نص الدرجات فاضية… محتاج تعب شوية",
      "مش وحش… بس لسه محتاج مجهود 😭",
      "كده نص تمام… نص محتاج شغل 😆",
      "البلاصة شوية شوية بتملا",
      "المرة الجاية هتبقى أحسن 😎",
    ],
    "51-60": [
      "تمام… مش وحش أوي 😅",
      "البلاصة ابتدت تملي 💪",
      "زفت… بس فيه improvement 😬",
      "الورقة نفسها مبسوطة بيك 😆",
      "محتاج شوية تركيز زيادة",
      "مش وحش… بس ممكن تبقى أحسن 😎",
      "مجهودك باين… وده كويس",
      "حافظ على المستوى ده",
      "شوية review وهتبقى top",
      "نص البلاصة بقيت حلوة 😆",
    ],
    "61-70": [
      "تمام… مستوى كويس 💪",
      "البلاصة تملى… performance حلوة 😎",
      "زفت… بس مش أوي 😂",
      "الورقة نفسها مبسوطة بيك 😆",
      "شغل مرتب… استمر كده",
      "مش ممتاز… بس كويس جدًا",
      "شوية زيادة وهتبقى ممتاز",
      "الأداء جيد جدًا",
      "حافظ على المستوى ده",
      "المرة الجاية هتعدي بلاصة أكتر 😎",
    ],
    "71-80": [
      "ممتاز… أدائك حلو جدًا 😎🔥",
      'الورقة نفسها بتقول: "برافو عليك!" 😆',
      "شغل جامد… استمر كده 💪",
      "الأداء ممتاز… شوية تحسينات بسيطة",
      "تمام جدًا… قريب من الكمال",
      "شغلك واضح إنه مرتب جدًا",
      "حلو جدًا… حافظ على المستوى ده",
      "تحسن كبير… keep going! 😎",
      "الأداء كويس جدًا… مبسوطين بيك",
      "قريب جدًا من التميز… كمل كده",
    ],
    "81-90": [
      "ممتاز جدًا… شغل رائع 🔥",
      "الورقة نفسها فخورة بيك 😆",
      "الأداء ممتاز جدًا… keep it up! 💪",
      "مستوى عالي جدًا",
      "قريب جدًا من الدرجة الكاملة",
      "شغل مرتب ومنظم جدًا",
      "رائع جدًا… كمل بنفس الوتيرة",
      "performance ممتاز جدًا 😎",
      "شوية تحسينات بسيطة وهتبقى 100%",
      "مستوى ممتاز… ماشاء الله عليك 😆",
    ],
    "91-100": [
      "أسطورة… درجة كاملة 🔥",
      'الورقة نفسها بتقول: "ده معلم!" 😎',
      "ممتاز جدًا… performance خرافي",
      "keep shining… ممتاز جدًا",
      "مستوى عالي جدًا… تحفة",
      "مفيش كلام… ده top 👑",
      "ممتاز… شكلك هتكون بطل المرة الجاية كمان",
      "كمال الأداء… 100% 😆",
      "درجة خرافية… مبروك 💪",
      "ممتاز… كل حاجة تمام تمام",
    ],
  };

  const getScoreMessage = (score) => {
    let range;
    if (score <= 10) range = "0-10";
    else if (score <= 20) range = "11-20";
    else if (score <= 30) range = "21-30";
    else if (score <= 40) range = "31-40";
    else if (score <= 50) range = "41-50";
    else if (score <= 60) range = "51-60";
    else if (score <= 70) range = "61-70";
    else if (score <= 80) range = "71-80";
    else if (score <= 90) range = "81-90";
    else range = "91-100";
    const messages = scoreMessages[range];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const filterTabs = [
    { id: "all", label: "جميع الأسئلة", icon: "solar:document-text-bold" },
    {
      id: "correct",
      label: "الأسئلة الصحيحة",
      icon: "solar:check-circle-bold",
    },
    { id: "wrong", label: "الأسئلة الخاطئة", icon: "solar:close-circle-bold" },
    {
      id: "unanswered",
      label: "غير المجابة",
      icon: "solar:question-circle-bold",
    },
  ];

  const filterQuestions = (questions) => {
    if (!questions) return [];
    const filtered = questions.map((question, index) => ({
      question,
      originalIndex: index,
    }));
    switch (activeFilter) {
      case "correct":
        return filtered.filter((item) => item.question.is_correct);
      case "wrong":
        return filtered.filter((item) => !item.question.is_correct);
      case "unanswered":
        return filtered.filter((item) => item.question.user_answer === null);
      default:
        return filtered;
    }
  };

  // Initialize language selection - prefer Arabic if available
  useEffect(() => {
    if (quizData?.questions_with_results) {
      const initialLanguages = {};
      quizData.questions_with_results.forEach((question, index) => {
        initialLanguages[index] = question.explanation_ar ? "ar" : "en";
      });
      setSelectedLanguage(initialLanguages);
    }
  }, [quizData]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getPracticeQuizDetailedResult(practiceQuizId);

        // Check if quiz is not completed
        if (!data.is_completed) {
          toast.warning("لم يتم إكمال هذا الاختبار بعد");
          router.push("/practice-quiz");
          return;
        }

        setQuizData(data);
      } catch (error) {
        console.error("Error fetching result:", error);
        toast.error("حدث خطأ أثناء تحميل النتيجة");
        router.push("/practice-quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [practiceQuizId, router]);

  const toggleLanguage = (index, lang) => {
    setSelectedLanguage((prev) => ({
      ...prev,
      [index]: lang,
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">لم يتم العثور على النتيجة</p>
        </div>
      </div>
    );
  }

  const isPassed = quizData.score >= 50;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <div
          className="mb-4 md:mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
          dir="rtl"
        >
          <Link
            href="/practice-quiz"
            className="hover:text-sky-500 transition-colors"
          >
            الاختبارات التدريبية
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-semibold">
            نتيجة الاختبار
          </span>
        </div>

        {/* Quiz Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 md:mb-6">
          <div className="text-center mb-6 md:mb-8">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words"
              dir="rtl"
            >
              {quizData.title}
            </h1>
            {quizData.description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {quizData.description}
              </p>
            )}
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div
              className={`p-3 sm:p-4 md:p-6 rounded-xl text-center ${
                isPassed
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <Icon
                icon={
                  isPassed
                    ? "solar:verified-check-bold"
                    : "solar:close-circle-bold"
                }
                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 ${
                  isPassed ? "text-green-500" : "text-red-500"
                }`}
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                النتيجة النهائية
              </p>
              <p
                className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                  isPassed ? "text-green-600" : "text-red-600"
                }`}
              >
                {quizData.score}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                {isPassed ? "ناجح ✓" : "ساقط ✗"}
              </p>
              <p
                className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2"
                dir="rtl"
              >
                {getScoreMessage(quizData.score)}
              </p>
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/20 p-3 sm:p-4 md:p-6 rounded-xl text-center">
              <Icon
                icon="solar:document-text-bold"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-sky-500 mx-auto mb-2"
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي الأسئلة
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-600">
                {quizData.total_questions}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 md:p-6 rounded-xl text-center">
              <Icon
                icon="solar:check-circle-bold"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-2"
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجابات صحيحة
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                {quizData.correct_answers}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 md:p-6 rounded-xl text-center">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-amber-500 mx-auto mb-2"
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                الوقت المستغرق
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600">
                {Math.floor(quizData.time_taken / 60)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                دقيقة
              </p>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-4 md:space-y-6">
          <h2
            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
            dir="rtl"
          >
            الأسئلة والإجابات
          </h2>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                <Icon icon={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {quizData.questions_with_results &&
          quizData.questions_with_results.length > 0 ? (
            filterQuestions(quizData.questions_with_results).map(
              (item, index) => (
                <div
                  key={item.originalIndex}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 md:p-6"
                >
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <span className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-bold px-3 py-1 rounded-lg">
                          سؤال {item.originalIndex + 1}
                        </span>
                        {item.question.is_correct ? (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <Icon
                              icon="solar:check-circle-bold"
                              className="w-4 h-4"
                            />
                            صحيح
                          </span>
                        ) : (
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <Icon
                              icon="solar:close-circle-bold"
                              className="w-4 h-4"
                            />
                            خطأ
                          </span>
                        )}
                      </div>
                      <p
                        className="text-base sm:text-lg text-gray-900 dark:text-white leading-relaxed break-words"
                        dir="rtl"
                      >
                        {item.question.question}
                      </p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {item.question.options.map((option, optionIndex) => {
                      const isUserAnswer =
                        item.question.user_answer === optionIndex;
                      const isCorrectAnswer =
                        item.question.correct_answer === optionIndex;

                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                            isCorrectAnswer
                              ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                              : isUserAnswer && !item.question.is_correct
                              ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                              : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center ${
                                isCorrectAnswer
                                  ? "bg-green-500 border-green-500"
                                  : isUserAnswer && !item.question.is_correct
                                  ? "bg-red-500 border-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {isCorrectAnswer && (
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="w-5 h-5 text-white"
                                />
                              )}
                              {isUserAnswer && !item.question.is_correct && (
                                <Icon
                                  icon="solar:close-circle-bold"
                                  className="w-5 h-5 text-white"
                                />
                              )}
                            </div>
                            <span
                              className={`text-sm sm:text-base flex-1 break-words ${
                                isCorrectAnswer
                                  ? "text-green-900 dark:text-green-100 font-semibold"
                                  : isUserAnswer && !item.question.is_correct
                                  ? "text-red-900 dark:text-red-100 font-semibold"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                              dir="rtl"
                            >
                              {option}
                            </span>
                            {isUserAnswer && (
                              <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                إجابتك
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                الإجابة الصحيحة
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {(item.question.explanation_ar ||
                    item.question.explanation_en) && (
                    <div className="bg-sky-50 dark:bg-sky-900/20 border-r-4 border-sky-500 p-3 sm:p-4 rounded-lg mb-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Icon
                          icon="solar:lightbulb-bolt-bold"
                          className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 flex-shrink-0 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                            <p className="font-semibold text-sky-900 dark:text-sky-100 text-sm sm:text-base">
                              التوضيح:
                            </p>
                            {item.question.explanation_ar &&
                              item.question.explanation_en && (
                                <button
                                  onClick={() =>
                                    toggleLanguage(
                                      item.originalIndex,
                                      selectedLanguage[item.originalIndex] ===
                                        "en"
                                        ? "ar"
                                        : "en"
                                    )
                                  }
                                  className="flex items-center gap-1 text-[10px] sm:text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 sm:px-3 py-1 rounded-full hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors whitespace-nowrap"
                                >
                                  <Icon
                                    icon="solar:translation-bold"
                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                  />
                                  <span>
                                    {selectedLanguage[item.originalIndex] ===
                                    "en"
                                      ? "عربي"
                                      : "English"}
                                  </span>
                                </button>
                              )}
                          </div>
                          <p
                            className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words"
                            dir={
                              selectedLanguage[item.originalIndex] === "en"
                                ? "ltr"
                                : "rtl"
                            }
                          >
                            {selectedLanguage[item.originalIndex] === "en"
                              ? item.question.explanation_en
                              : item.question.explanation_ar ||
                                item.question.explanation_en}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Source Info */}
                  {(item.question.source_quiz_title ||
                    item.question.source_course_id) && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 flex-1 min-w-0">
                        <Icon
                          icon="solar:document-text-bold"
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <span className="truncate">
                          {item.question.source_quiz_title
                            ? `المصدر: ${item.question.source_quiz_title}`
                            : ""}
                          {item.question.source_course_id &&
                            ` - كورس رقم ${item.question.source_course_id}`}
                        </span>
                      </div>
                      {item.question.source_course_id &&
                        item.question.source_lecture_id && (
                          <Link
                            href={`/courses/${item.question.source_course_id}/lecture/${item.question.source_lecture_id}`}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                          >
                            <Icon
                              icon="solar:arrow-left-bold"
                              className="w-3 h-3"
                            />
                            <span>الانتقال للمحتوى</span>
                          </Link>
                        )}
                    </div>
                  )}
                </div>
              )
            )
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <Icon
                icon="solar:clipboard-remove-bold-duotone"
                className="w-24 h-24 mx-auto mb-6 text-gray-400"
              />
              <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                لا توجد أسئلة متاحة للمراجعة
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            href="/practice-quiz"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Icon
              icon="solar:arrow-right-linear"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span>العودة للاختبارات التدريبية</span>
          </Link>
          <Link
            href="/practice-quiz"
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Icon
              icon="solar:add-circle-bold"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span>إنشاء اختبار جديد</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PracticeQuizResultPage;
