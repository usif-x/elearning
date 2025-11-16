"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
  const [formData, setFormData] = useState({
    count: 5,
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.count < 1 || formData.count > 50) {
      toast.error("عدد الأسئلة يجب أن يكون بين 1 و 50");
      return;
    }

    setLoading(true);
    try {
      await addQuestionsToSet(questionSetId, formData);
      toast.success("تم إضافة الأسئلة بنجاح!");
      router.push(`/questions-forum/my/${questionSetId}`);
    } catch (error) {
      console.error("Error adding questions:", error);
      toast.error("حدث خطأ أثناء إضافة الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/questions-forum/my/${questionSetId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4"
        >
          <Icon icon="solar:alt-arrow-right-bold" />
          العودة للتفاصيل
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          إضافة أسئلة جديدة
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          أضف المزيد من الأسئلة إلى مجموعتك باستخدام الذكاء الاصطناعي
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            إضافة أسئلة إضافية
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عدد الأسئلة المراد إضافتها
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.count}
                onChange={(e) =>
                  setFormData({ ...formData, count: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                الحد الأقصى: 50 سؤال
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="أي تعليمات إضافية للذكاء الاصطناعي حول نوع الأسئلة المرغوبة..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                مثال: "ركز على الأسئلة التطبيقية" أو "أضف أسئلة عن المفاهيم
                الأساسية"
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon
              icon="solar:info-circle-bold"
              className="text-blue-600 dark:text-blue-400 mt-1"
            />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                معلومات مهمة
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>
                  • سيتم إنشاء الأسئلة بنفس المستوى والنوع المحدد في المجموعة
                  الأصلية
                </li>
                <li>• لن يتم تكرار الأسئلة الموجودة بالفعل</li>
                <li>• قد يستغرق الأمر بضع دقائق حسب عدد الأسئلة المطلوبة</li>
                <li>• يمكنك تعديل أو حذف الأسئلة الجديدة لاحقاً</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href={`/questions-forum/my/${questionSetId}`}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Icon icon="solar:add-circle-bold" />
            )}
            إضافة الأسئلة
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestionsPage;
