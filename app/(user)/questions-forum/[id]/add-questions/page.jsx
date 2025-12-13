"use client";

import { addQuestionsToSet } from "@/services/QuestionsForum";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const AddQuestionsPage = () => {
  const params = useParams();
  const router = useRouter();
  const questionSetId = params.id;

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
      { text: "جاري تحليل المجموعة الحالية...", duration: 45000 }, // 45 seconds for processing content
      { text: "إعداد الأسئلة الجديدة...", duration: 1500 },
      { text: "توليد الأسئلة الإضافية...", duration: questionCount * 15000 }, // 15 seconds per question
      { text: "دمج الأسئلة مع المجموعة...", duration: 2000 },
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
  const [formData, setFormData] = useState({
    count: 5,
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.count < 1 || formData.count > 20) {
      toast.error("عدد الأسئلة يجب أن يكون بين 1 و 20");
      return;
    }

    // Start progress simulation
    simulateProgress(formData.count);

    try {
      await addQuestionsToSet(questionSetId, formData);
      toast.success("تم إضافة الأسئلة بنجاح!");
      // Mark progress complete now that backend responded
      setLoadingProgress({
        isLoading: false,
        currentStep: "",
        progress: 100,
        currentQuestion: formData.count,
        totalQuestions: formData.count,
        estimatedTimeRemaining: 0,
      });
      router.push(`/questions-forum/my/${questionSetId}`);
    } catch (error) {
      console.error("Error adding questions:", error);
      toast.error("حدث خطأ أثناء إضافة الأسئلة");
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Icon
                icon="solar:add-circle-bold"
                className="w-12 h-12 text-blue-500"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  إضافة أسئلة جديدة
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  أضف المزيد من الأسئلة إلى مجموعتك باستخدام الذكاء الاصطناعي
                </p>
              </div>
            </div>
            <Link
              href={`/questions-forum/my/${questionSetId}`}
              className={`inline-flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg font-semibold ${
                loadingProgress.isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
              <span>العودة</span>
            </Link>
          </div>
        </div>

        {/* Loading Progress */}
        {loadingProgress.isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6">
                <Icon
                  icon="solar:magic-stick-bold"
                  className="w-10 h-10 text-white animate-pulse"
                />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                جاري إضافة الأسئلة...
              </h3>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {loadingProgress.currentStep}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${loadingProgress.progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
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
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      الأسئلة المُضافة:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {loadingProgress.currentQuestion} /{" "}
                      {loadingProgress.totalQuestions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
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

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 ${loadingProgress.isLoading ? "hidden" : ""}`}
        >
          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-blue-500 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Icon icon="solar:add-circle-bold" className="w-6 h-6" />
                إضافة أسئلة إضافية
              </h2>
            </div>

            <div className="p-8 space-y-8">
              {/* Question Count Input */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  <Icon
                    icon="solar:document-text-bold"
                    className="inline mr-2 text-blue-500"
                  />
                  عدد الأسئلة المراد إضافتها
                </label>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={formData.count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        count: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 h-3 bg-blue-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />

                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 rounded-xl min-w-[80px] justify-center border border-blue-200 dark:border-blue-800">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formData.count}
                    </span>
                    <span className="text-sm text-blue-500 font-medium">
                      سؤال
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 px-2">
                  <span>الحد الأدنى: 1</span>
                  <span>الحد الأقصى: 20</span>
                </div>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  <Icon
                    icon="solar:notes-bold"
                    className="inline mr-2 text-green-500"
                  />
                  ملاحظات إضافية (اختياري)
                </label>

                <div className="relative">
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="أي تعليمات إضافية للذكاء الاصطناعي حول نوع الأسئلة المرغوبة..."
                    rows={5}
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                  />

                  <div className="absolute bottom-3 left-3 text-gray-400">
                    <Icon icon="solar:pen-bold" />
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <Icon
                      icon="solar:lightbulb-bold"
                      className="text-amber-500 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      <strong>اقتراحات:</strong> "ركز على الأسئلة التطبيقية" أو
                      "أضف أسئلة عن المفاهيم الأساسية" أو "تنوع في صعوبة
                      الأسئلة"
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <Icon
                icon="solar:info-circle-bold"
                className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0"
              />
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  معلومات مهمة
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-5 h-5 text-green-500"
                    />
                    سيتم إنشاء الأسئلة بنفس المستوى والنوع المحدد في المجموعة
                    الأصلية
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-5 h-5 text-green-500"
                    />
                    لن يتم تكرار الأسئلة الموجودة بالفعل
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-5 h-5 text-green-500"
                    />
                    قد يستغرق الأمر بضع دقائق حسب عدد الأسئلة المطلوبة
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="w-5 h-5 text-green-500"
                    />
                    يمكنك تعديل أو حذف الأسئلة الجديدة لاحقاً
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              href={`/questions-forum/my/${questionSetId}`}
              className={`px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg ${
                loadingProgress.isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              إلغاء
            </Link>
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
              <span>إضافة الأسئلة الجديدة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionsPage;
