"use client";

import {
  generateQuestionsFromPdf,
  generateQuestionsFromTopic,
} from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const CreateQuestionSetPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("topic");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    isLoading: false,
    currentStep: "",
    progress: 0,
    currentQuestion: 0,
    totalQuestions: 0,
    estimatedTimeRemaining: 0,
  });

  const simulateProgress = (questionCount) => {
    const steps = [
      { text: "جاري تحليل المحتوى...", duration: 45000 }, // 45 seconds for processing content
      { text: "إعداد الأسئلة...", duration: 1500 },
      { text: "توليد الأسئلة...", duration: questionCount * 15000 }, // 15 seconds per question
      { text: "تنسيق الإجابات...", duration: 2000 },
      { text: "إنهاء العملية...", duration: 1000 },
    ];

    let currentStepIndex = 0;
    let totalElapsed = 0;
    let questionProgress = 0;

    const updateProgress = () => {
      if (currentStepIndex >= steps.length) {
        // Keep the progress visible (stop at 95%) and wait for the backend response
        setLoadingProgress((prev) => ({
          ...prev,
          currentStep: "",
          progress: 95,
          currentQuestion: questionCount,
          totalQuestions: questionCount,
          estimatedTimeRemaining: 0,
        }));
        return;
      }

      const currentStep = steps[currentStepIndex];
      const stepStartTime = Date.now();

      setLoadingProgress({
        isLoading: true,
        currentStep: currentStep.text,
        progress: Math.min(
          (totalElapsed / (questionCount * 15000 + 66500)) * 100,
          95
        ),
        currentQuestion: Math.min(questionProgress, questionCount),
        totalQuestions: questionCount,
        estimatedTimeRemaining: Math.max(
          0,
          questionCount * 15000 + 66500 - totalElapsed
        ),
      });

      // If this is the question generation step, update question by question
      if (currentStepIndex === 2) {
        const questionInterval = setInterval(() => {
          questionProgress++;
          setLoadingProgress((prev) => ({
            ...prev,
            currentQuestion: Math.min(questionProgress, questionCount),
            progress: Math.min(
              ((totalElapsed + (Date.now() - stepStartTime)) /
                (questionCount * 15000 + 66500)) *
                100,
              95
            ),
          }));

          if (questionProgress >= questionCount) {
            clearInterval(questionInterval);
          }
        }, 15000); // Update every 15 seconds per question

        setTimeout(() => {
          clearInterval(questionInterval);
          currentStepIndex++;
          totalElapsed += currentStep.duration;
          updateProgress();
        }, currentStep.duration);
      } else {
        setTimeout(() => {
          currentStepIndex++;
          totalElapsed += currentStep.duration;
          updateProgress();
        }, currentStep.duration);
      }
    };

    updateProgress();
  };

  // Topic generation form
  const [topicData, setTopicData] = useState({
    topic: "",
    title: "",
    description: "",
    difficulty: "medium",
    question_type: "multiple_choice",
    count: 5,
    is_public: false,
    notes: "",
  });

  // PDF generation form
  const [pdfData, setPdfData] = useState({
    file: null,
    title: "",
    description: "",
    difficulty: "medium",
    question_type: "multiple_choice",
    count: 5,
    is_public: false,
    notes: "",
  });

  const handleTopicSubmit = async (e) => {
    e.preventDefault();

    if (!topicData.topic.trim() || !topicData.title.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // Start progress simulation
    simulateProgress(topicData.count);

    try {
      const result = await generateQuestionsFromTopic(topicData);
      toast.success("تم إنشاء مجموعة الأسئلة بنجاح!");
      // Mark progress complete now that backend responded
      setLoadingProgress({
        isLoading: false,
        currentStep: "",
        progress: 100,
        currentQuestion: topicData.count,
        totalQuestions: topicData.count,
        estimatedTimeRemaining: 0,
      });
      router.push(`/questions-forum/my/${result.id}`);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("حدث خطأ أثناء إنشاء الأسئلة");
      setLoadingProgress({
        isLoading: false,
        currentStep: "",
        progress: 0,
        currentQuestion: 0,
        totalQuestions: 0,
        estimatedTimeRemaining: 0,
      });
    }
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();

    if (!pdfData.file || !pdfData.title.trim()) {
      toast.error("يرجى اختيار ملف PDF وملء العنوان");
      return;
    }

    // Validate file type
    if (!pdfData.file.type.includes("pdf")) {
      toast.error("يرجى اختيار ملف PDF فقط");
      return;
    }

    // Validate file size (max 50MB)
    if (pdfData.file.size > 50 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 50 ميجابايت");
      return;
    }

    // Start progress simulation
    simulateProgress(pdfData.count);

    try {
      const formData = new FormData();
      formData.append("file", pdfData.file);
      formData.append("title", pdfData.title);
      if (pdfData.description)
        formData.append("description", pdfData.description);
      formData.append("difficulty", pdfData.difficulty);
      formData.append("question_type", pdfData.question_type);
      formData.append("count", pdfData.count.toString());
      formData.append("is_public", pdfData.is_public.toString());
      if (pdfData.notes) formData.append("notes", pdfData.notes);

      const result = await generateQuestionsFromPdf(formData);
      toast.success("تم إنشاء مجموعة الأسئلة من ملف PDF بنجاح!");
      // Mark progress complete now that backend responded
      setLoadingProgress({
        isLoading: false,
        currentStep: "",
        progress: 100,
        currentQuestion: pdfData.count,
        totalQuestions: pdfData.count,
        estimatedTimeRemaining: 0,
      });
      router.push(`/questions-forum/my/${result.id}`);
    } catch (error) {
      console.error("Error generating questions from PDF:", error);
      toast.error("حدث خطأ أثناء إنشاء الأسئلة من ملف PDF");
      setLoadingProgress({
        isLoading: false,
        currentStep: "",
        progress: 0,
        currentQuestion: 0,
        totalQuestions: 0,
        estimatedTimeRemaining: 0,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfData({ ...pdfData, file });
    }
  };

  const tabs = [
    { id: "topic", label: "من موضوع", icon: "solar:document-text-bold" },
    { id: "pdf", label: "من ملف PDF", icon: "solar:file-bold" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-sky-600 rounded-2xl shadow-lg">
              <Icon
                icon="solar:add-circle-bold-duotone"
                className="w-12 h-12 text-white"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                إنشاء مجموعة أسئلة جديدة
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                أنشئ أسئلة اختبار باستخدام الذكاء الاصطناعي
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  !loadingProgress.isLoading && setActiveTab(tab.id)
                }
                disabled={loadingProgress.isLoading}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex-1 ${
                  activeTab === tab.id
                    ? "bg-sky-600 text-white shadow-lg"
                    : loadingProgress.isLoading
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon icon={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading Progress */}
        {loadingProgress.isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-6">
                <Icon
                  icon="solar:magic-stick-bold"
                  className="w-8 h-8 text-white animate-pulse"
                />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                جاري إنشاء الأسئلة...
              </h3>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {loadingProgress.currentStep}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="bg-sky-600 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress.progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{Math.round(loadingProgress.progress)}%</span>
                <span>
                  {loadingProgress.estimatedTimeRemaining > 0
                    ? `${Math.ceil(
                        loadingProgress.estimatedTimeRemaining / 1000
                      )} ثانية متبقية`
                    : "جاري الإنهاء..."}
                </span>
              </div>

              {/* Question Progress */}
              {loadingProgress.totalQuestions > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      الأسئلة المُنشأة:
                    </span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {loadingProgress.currentQuestion} /{" "}
                      {loadingProgress.totalQuestions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (loadingProgress.currentQuestion /
                            loadingProgress.totalQuestions) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
                <span>يرجى الانتظار، هذه العملية قد تستغرق بعض الوقت</span>
              </div>
            </div>
          </div>
        )}

        {/* Topic Generation Form */}
        {activeTab === "topic" && !loadingProgress.isLoading && (
          <form onSubmit={handleTopicSubmit} className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                  <Icon
                    icon="solar:document-text-bold"
                    className="w-8 h-8 text-blue-500"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  إنشاء أسئلة من موضوع
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    الموضوع *
                  </label>
                  <textarea
                    value={topicData.topic}
                    onChange={(e) =>
                      setTopicData({ ...topicData, topic: e.target.value })
                    }
                    placeholder="اكتب الموضوع الذي تريد إنشاء أسئلة عنه..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    العنوان *
                  </label>
                  <input
                    type="text"
                    value={topicData.title}
                    onChange={(e) =>
                      setTopicData({ ...topicData, title: e.target.value })
                    }
                    placeholder="عنوان مجموعة الأسئلة"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    الوصف
                  </label>
                  <input
                    type="text"
                    value={topicData.description}
                    onChange={(e) =>
                      setTopicData({
                        ...topicData,
                        description: e.target.value,
                      })
                    }
                    placeholder="وصف مختصر للمجموعة"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={topicData.difficulty}
                    onChange={(e) =>
                      setTopicData({ ...topicData, difficulty: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    نوع الأسئلة
                  </label>
                  <select
                    value={topicData.question_type}
                    onChange={(e) =>
                      setTopicData({
                        ...topicData,
                        question_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="multiple_choice">اختيار متعدد</option>
                    <option value="true_false">صح/خطأ</option>
                    <option value="mixed">مخطلط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    عدد الأسئلة ) 1-20 (*
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={topicData.count}
                    onChange={(e) =>
                      setTopicData({
                        ...topicData,
                        count: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <input
                      type="checkbox"
                      id="is_public_topic"
                      checked={topicData.is_public}
                      onChange={(e) =>
                        setTopicData({
                          ...topicData,
                          is_public: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_public_topic"
                      className="mr-3 text-sm font-medium text-blue-800 dark:text-blue-200"
                    >
                      جعل الأسئلة عامة (يمكن للآخرين رؤيتها والإجابة عليها)
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={topicData.notes}
                  onChange={(e) =>
                    setTopicData({ ...topicData, notes: e.target.value })
                  }
                  placeholder="أي ملاحظات إضافية للذكاء الاصطناعي..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loadingProgress.isLoading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                {loadingProgress.isLoading ? (
                  <Icon
                    icon="solar:loading-bold"
                    className="w-6 h-6 animate-spin"
                  />
                ) : (
                  <Icon icon="solar:magic-stick-bold" className="w-6 h-6" />
                )}
                إنشاء الأسئلة
              </button>
            </div>
          </form>
        )}

        {/* PDF Generation Form */}
        {activeTab === "pdf" && !loadingProgress.isLoading && (
          <form onSubmit={handlePdfSubmit} className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-xl">
                  <Icon
                    icon="solar:file-bold"
                    className="w-8 h-8 text-green-500"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  إنشاء أسئلة من ملف PDF
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    ملف PDF *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-file"
                    />
                    <label htmlFor="pdf-file" className="cursor-pointer">
                      <div className="inline-flex p-4 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full mb-4">
                        <Icon
                          icon="solar:file-bold"
                          className="w-12 h-12 text-red-500"
                        />
                      </div>
                      <p className="text-gray-900 dark:text-white font-semibold mb-2">
                        {pdfData.file
                          ? pdfData.file.name
                          : "انقر لاختيار ملف PDF"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        الحد الأقصى: 50 ميجابايت • PDF فقط
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    العنوان *
                  </label>
                  <input
                    type="text"
                    value={pdfData.title}
                    onChange={(e) =>
                      setPdfData({ ...pdfData, title: e.target.value })
                    }
                    placeholder="عنوان مجموعة الأسئلة"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    الوصف
                  </label>
                  <input
                    type="text"
                    value={pdfData.description}
                    onChange={(e) =>
                      setPdfData({ ...pdfData, description: e.target.value })
                    }
                    placeholder="وصف مختصر للمجموعة"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={pdfData.difficulty}
                    onChange={(e) =>
                      setPdfData({ ...pdfData, difficulty: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    نوع الأسئلة
                  </label>
                  <select
                    value={pdfData.question_type}
                    onChange={(e) =>
                      setPdfData({ ...pdfData, question_type: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="multiple_choice">اختيار متعدد</option>
                    <option value="true_false">صح/خطأ</option>
                    <option value="mixed">مختلط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    عدد الأسئلة ) 1-20 (*
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={pdfData.count}
                    onChange={(e) =>
                      setPdfData({
                        ...pdfData,
                        count: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-200 dark:border-green-700">
                    <input
                      type="checkbox"
                      id="is_public_pdf"
                      checked={pdfData.is_public}
                      onChange={(e) =>
                        setPdfData({ ...pdfData, is_public: e.target.checked })
                      }
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_public_pdf"
                      className="mr-3 text-sm font-medium text-green-800 dark:text-green-200"
                    >
                      جعل الأسئلة عامة (يمكن للآخرين رؤيتها والإجابة عليها)
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={pdfData.notes}
                  onChange={(e) =>
                    setPdfData({ ...pdfData, notes: e.target.value })
                  }
                  placeholder="أي ملاحظات إضافية للذكاء الاصطناعي..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loadingProgress.isLoading}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                {loadingProgress.isLoading ? (
                  <Icon
                    icon="solar:loading-bold"
                    className="w-6 h-6 animate-spin"
                  />
                ) : (
                  <Icon icon="solar:magic-stick-bold" className="w-6 h-6" />
                )}
                إنشاء الأسئلة
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateQuestionSetPage;
