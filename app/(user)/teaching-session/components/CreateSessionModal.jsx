"use client";

import { createChatSession, createChatSessionFromPdf } from "@/services/Chat";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CreateSessionModal({ onClose, onSessionCreated }) {
  const [mode, setMode] = useState("text"); // 'text' or 'pdf'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    language: "ar",
    pdf_file: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("يرجى إدخال عنوان الجلسة");
      return;
    }

    setLoading(true);

    try {
      let newSession;

      if (mode === "text") {
        if (!formData.content.trim()) {
          toast.error("يرجى إدخال المحتوى التعليمي");
          setLoading(false);
          return;
        }

        newSession = await createChatSession({
          title: formData.title,
          content: formData.content,
          language: formData.language,
        });
      } else {
        if (!formData.pdf_file) {
          toast.error("يرجى رفع ملف PDF");
          setLoading(false);
          return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("language", formData.language);
        data.append("pdf_file", formData.pdf_file);

        newSession = await createChatSessionFromPdf(data);
      }

      onSessionCreated(newSession);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("حدث خطأ أثناء إنشاء الجلسة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Icon
                icon="solar:add-circle-bold"
                className="w-8 h-8 text-blue-500"
              />
              إنشاء جلسة تعليمية جديدة
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
            >
              <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 border border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                type="button"
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
                type="button"
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

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              عنوان الجلسة
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="مثال: مقدمة في البيوكيمياء"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              اللغة
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {mode === "text" ? "المحتوى التعليمي" : "ملف PDF"}
            </label>
            {mode === "text" ? (
              <textarea
                name="content"
                rows="10"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="الصق المحتوى التعليمي هنا..."
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

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Icon
                icon="solar:info-circle-bold"
                className="w-5 h-5 text-blue-500 mt-0.5"
              />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold mb-1">نصيحة:</p>
                <p>
                  الذكاء الاصطناعي سيعمل كمعلم تفاعلي، يسأل أسئلة ويشرح المفاهيم
                  بناءً على المحتوى المقدم.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Icon
                    icon="solar:loading-bold"
                    className="w-5 h-5 animate-spin"
                  />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                  <span>إنشاء الجلسة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
