"use client";

import {
  generateExamFromPdf,
  generateExamFromText,
} from "@/services/admin/PdfGenerator";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PdfGeneratorPage() {
  const [mode, setMode] = useState("text"); // 'text' or 'pdf'
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    exam_title: "",
    num_questions: 10,
    question_type: "mcq",
    difficulty: "medium",
    include_answers: true,
    content: "",
    pdf_file: null,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleDownloadPdf = (response, filename) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "exam.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate maximum 30 questions for users
    if (formData.num_questions > 30) {
      toast.error("الحد الأقصى لعدد الأسئلة هو 30 سؤال");
      return;
    }

    setLoading(true);

    try {
      let response;
      if (mode === "text") {
        if (!formData.content) {
          toast.error("الرجاء إدخال النص");
          setLoading(false);
          return;
        }
        // Using URLSearchParams for x-www-form-urlencoded
        const data = new URLSearchParams();
        data.append("content", formData.content);
        data.append("num_questions", formData.num_questions);
        data.append("question_type", formData.question_type);
        data.append("difficulty", formData.difficulty);
        data.append("exam_title", formData.exam_title);
        data.append("include_answers", formData.include_answers);

        response = await generateExamFromText(data);
      } else {
        if (!formData.pdf_file) {
          toast.error("الرجاء رفع ملف PDF");
          setLoading(false);
          return;
        }
        const data = new FormData();
        data.append("pdf_file", formData.pdf_file);
        data.append("num_questions", formData.num_questions);
        data.append("question_type", formData.question_type);
        data.append("difficulty", formData.difficulty);
        data.append("exam_title", formData.exam_title);
        data.append("include_answers", formData.include_answers);

        response = await generateExamFromPdf(data);
      }

      handleDownloadPdf(response, `${formData.exam_title || "exam"}.pdf`);
      toast.success("تم إنشاء الاختبار بنجاح");
    } catch (error) {
      console.error("Error generating exam:", error);
      toast.error("حدث خطأ أثناء إنشاء الاختبار");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon
              icon="solar:document-add-bold"
              className="w-12 h-12 text-blue-500"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                مولد الاختبارات (PDF)
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                قم بإنشاء اختبارات احترافية من النصوص أو ملفات PDF بسهولة
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              {/* Mode Toggle */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-8 border border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode("text")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex-1 ${
                      mode === "text"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon icon="solar:text-field-bold" className="w-5 h-5" />
                    <span>من نص</span>
                  </button>
                  <button
                    onClick={() => setMode("pdf")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex-1 ${
                      mode === "pdf"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon icon="solar:file-text-bold" className="w-5 h-5" />
                    <span>من ملف PDF</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      عنوان الاختبار
                    </label>
                    <input
                      type="text"
                      name="exam_title"
                      value={formData.exam_title}
                      onChange={handleInputChange}
                      placeholder="مثال: اختبار التاريخ"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      عدد الأسئلة (الحد الأقصى: 30)
                    </label>
                    <input
                      type="number"
                      name="num_questions"
                      min="1"
                      max="30"
                      value={formData.num_questions}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      نوع الأسئلة
                    </label>
                    <select
                      name="question_type"
                      value={formData.question_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="mcq">اختيار من متعدد</option>
                      <option value="true_false">صح أم خطأ</option>
                      <option value="essay">مقال</option>
                      <option value="mixed">مختلط</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      مستوى الصعوبة
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="easy">سهل</option>
                      <option value="medium">متوسط</option>
                      <option value="hard">صعب</option>
                    </select>
                  </div>
                </div>

                {/* Content Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {mode === "text" ? "النص المصدري" : "ملف PDF المصدري"}
                  </label>
                  {mode === "text" ? (
                    <textarea
                      name="content"
                      rows="8"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="الصق النص هنا..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
                      <input
                        type="file"
                        name="pdf_file"
                        accept=".pdf"
                        onChange={handleInputChange}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Icon
                          icon="solar:cloud-upload-bold"
                          className="w-16 h-16 text-gray-400 mb-4"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                          {formData.pdf_file
                            ? formData.pdf_file.name
                            : "اضغط لرفع ملف PDF"}
                        </span>
                        <span className="text-xs text-gray-500">
                          الحد الأقصى 10 ميجابايت
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <input
                    type="checkbox"
                    name="include_answers"
                    id="include_answers"
                    checked={formData.include_answers}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor="include_answers"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    تضمين نموذج الإجابة في نهاية الملف
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Icon
                        icon="solar:loading-bold"
                        className="w-6 h-6 animate-spin"
                      />
                      <span>جاري الإنشاء...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:printer-bold" className="w-6 h-6" />
                      <span>إنشاء الاختبار وتحميل PDF</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Icon icon="solar:info-circle-bold" className="text-blue-500" />
                كيف يعمل؟
              </h3>
              <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </span>
                  اختر مصدر المحتوى (نص أو ملف PDF).
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </span>
                  حدد عدد الأسئلة ونوعها ومستوى الصعوبة.
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </span>
                  اضغط على "إنشاء" وسيقوم الذكاء الاصطناعي بتحليل المحتوى وتوليد
                  الأسئلة.
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    4
                  </span>
                  سيتم تحميل ملف PDF جاهز للطباعة تلقائياً.
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                نصائح للحصول على أفضل النتائج
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-5 h-5 text-green-500 mt-0.5"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تأكد من أن النص واضح ومفهوم.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-5 h-5 text-green-500 mt-0.5"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    في حالة PDF، يفضل الملفات النصية (غير الممسوحة ضوئياً كصور).
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-5 h-5 text-green-500 mt-0.5"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    اختر عدد أسئلة مناسب لحجم المحتوى.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <Icon
                    icon="solar:danger-circle-bold"
                    className="w-5 h-5 text-amber-500 mt-0.5"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>ملاحظة:</strong> الحد الأقصى للمستخدمين هو 30 سؤال
                    فقط.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
