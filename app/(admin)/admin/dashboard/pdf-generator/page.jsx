"use client";

import Button from "@/components/ui/Button";
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Icon
            icon="solar:document-add-bold-duotone"
            className="text-red-600"
          />
          مولد الاختبارات (PDF)
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          قم بإنشاء اختبارات احترافية من النصوص أو ملفات PDF بسهولة
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
            {/* Mode Toggle */}
            <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl mb-8">
              <button
                onClick={() => setMode("text")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                  mode === "text"
                    ? "bg-white dark:bg-zinc-700 text-red-600 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="solar:text-field-bold" className="w-5 h-5" />
                  من نص
                </div>
              </button>
              <button
                onClick={() => setMode("pdf")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                  mode === "pdf"
                    ? "bg-white dark:bg-zinc-700 text-red-600 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="solar:file-text-bold" className="w-5 h-5" />
                  من ملف PDF
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    عنوان الاختبار
                  </label>
                  <input
                    type="text"
                    name="exam_title"
                    value={formData.exam_title}
                    onChange={handleInputChange}
                    placeholder="مثال: اختبار التاريخ"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    عدد الأسئلة
                  </label>
                  <input
                    type="number"
                    name="num_questions"
                    min="1"
                    max="100"
                    value={formData.num_questions}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    نوع الأسئلة
                  </label>
                  <select
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white"
                  >
                    <option value="mcq">اختيار من متعدد</option>
                    <option value="true_false">صح أم خطأ</option>
                    <option value="essay">مقال</option>
                    <option value="mixed">مختلط</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    مستوى الصعوبة
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {mode === "text" ? "النص المصدري" : "ملف PDF المصدري"}
                </label>
                {mode === "text" ? (
                  <textarea
                    name="content"
                    rows="8"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="الصق النص هنا..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white resize-none"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-8 text-center hover:border-red-500 transition-colors bg-gray-50 dark:bg-zinc-800/50">
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
                        icon="solar:cloud-upload-bold-duotone"
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
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                <input
                  type="checkbox"
                  name="include_answers"
                  id="include_answers"
                  checked={formData.include_answers}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
                />
                <label
                  htmlFor="include_answers"
                  className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  تضمين نموذج الإجابة في نهاية الملف
                </label>
              </div>

              {/* Submit Button */}
              <Button
                text={loading ? "جاري الإنشاء..." : "إنشاء الاختبار وتحميل PDF"}
                color="red"
                icon={!loading ? "solar:printer-bold-duotone" : null}
                isLoading={loading}
                full
                className="!py-4 !text-lg shadow-lg shadow-red-500/20"
              />
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <Icon icon="solar:info-circle-bold" />
              كيف يعمل؟
            </h3>
            <ul className="space-y-4 text-sm font-medium opacity-90">
              <li className="flex gap-3">
                <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </span>
                اختر مصدر المحتوى (نص أو ملف PDF).
              </li>
              <li className="flex gap-3">
                <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </span>
                حدد عدد الأسئلة ونوعها ومستوى الصعوبة.
              </li>
              <li className="flex gap-3">
                <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </span>
                اضغط على "إنشاء" وسيقوم الذكاء الاصطناعي بتحليل المحتوى وتوليد
                الأسئلة.
              </li>
              <li className="flex gap-3">
                <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  4
                </span>
                سيتم تحميل ملف PDF جاهز للطباعة تلقائياً.
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
