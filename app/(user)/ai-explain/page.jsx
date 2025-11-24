"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/hooks/useAuth";
import { postData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import remarkGfm from "remark-gfm";

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

export default function AIExplainPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const fileRef = useRef(null);
  const resultsRef = useRef(null);

  // Tabs State
  const [activeTab, setActiveTab] = useState("pdf"); // 'pdf' | 'topic'

  // PDF State
  const [file, setFile] = useState(null);

  // Topic State
  const [topic, setTopic] = useState("");
  const [subjectBreakdown, setSubjectBreakdown] = useState(true);

  // Shared State
  const [includeExamples, setIncludeExamples] = useState(true);
  const [detailedExplanation, setDetailedExplanation] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // --- Handlers ---

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== "application/pdf") {
      toast.error("يرجى رفع ملف PDF فقط.");
      e.target.value = null;
      setFile(null);
      return;
    }
    if (f.size > MAX_PDF_SIZE) {
      toast.error("حجم الملف كبير جداً — الحد الأقصى 50MB.");
      e.target.value = null;
      setFile(null);
      return;
    }
    setFile(f);
  };

  const resetForm = () => {
    setFile(null);
    setTopic("");
    setIncludeExamples(true);
    setDetailedExplanation(true);
    setSubjectBreakdown(true);
    setResults(null);
    if (fileRef.current) fileRef.current.value = null;
  };

  const downloadAsPDF = async () => {
    if (!resultsRef.current) {
      toast.error("لا يوجد محتوى للتحميل");
      return;
    }

    setGeneratingPDF(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      let currentY = margin;

      // Capture Summary Card
      const summaryElement = document.getElementById("pdf-summary-card");
      if (summaryElement) {
        const summaryCanvas = await html2canvas(summaryElement, {
          scale: 2,
          useCORS: true,
        });
        const summaryImgData = summaryCanvas.toDataURL("image/png");
        const summaryProps = pdf.getImageProperties(summaryImgData);
        const summaryHeight =
          (summaryProps.height * contentWidth) / summaryProps.width;

        pdf.addImage(
          summaryImgData,
          "PNG",
          margin,
          currentY,
          contentWidth,
          summaryHeight
        );
        currentY += summaryHeight + 10;
      }

      // Capture Cards (Works for both PDF Pages and Topic Subjects)
      const cards = resultsRef.current.querySelectorAll(".explanation-card");

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const canvas = await html2canvas(card, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, "PNG", margin, currentY, contentWidth, imgHeight);
        currentY += imgHeight + 10;
      }

      // Determine Filename
      const baseName = results.filename
        ? results.filename.replace(".pdf", "")
        : results.topic || "Explanation";
      const fileName = `Explanations_${baseName}.pdf`;

      pdf.save(fileName);
      toast.success("تم تحميل ملف PDF بنجاح!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("حدث خطأ أثناء إنشاء ملف PDF.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResults(null);

    try {
      const form = new FormData();
      form.append("include_examples", includeExamples ? "true" : "false");
      form.append(
        "detailed_explanation",
        detailedExplanation ? "true" : "false"
      );

      let endpoint = "";

      if (activeTab === "pdf") {
        if (!file) {
          toast.error("يرجى اختيار ملف PDF أولاً.");
          setSubmitting(false);
          return;
        }
        form.append("file", file);
        endpoint = "/ai/explain-pdf-content";
      } else {
        if (!topic.trim()) {
          toast.error("يرجى كتابة الموضوع.");
          setSubmitting(false);
          return;
        }
        form.append("topic", topic);
        form.append("subject_breakdown", subjectBreakdown ? "true" : "false");
        endpoint = "/ai/explain-topic-content";
      }

      const data = await postData(endpoint, form, true);

      if (!data.success) {
        throw new Error(data.message || "فشل في معالجة الطلب");
      }

      if (activeTab === "pdf") {
        toast.info(
          "تنبيه: الصفحات التي تحتوي على صور فقط أو نص بجودة منخفضة سيتم تخطيها.",
          { autoClose: 6000 }
        );
      } else {
        toast.success("تم شرح الموضوع بنجاح!");
      }

      setResults(data);
    } catch (err) {
      console.error(err);
      toast.error(
        activeTab === "pdf"
          ? "حدث خطأ أثناء شرح محتوى الـ PDF."
          : "حدث خطأ أثناء شرح الموضوع."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl sm:rounded-3xl shadow-lg mb-4">
            <Icon
              icon="solar:magic-stick-3-bold-duotone"
              className="w-8 h-8 sm:w-10 sm:h-10 text-white"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            الشرح الذكي
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            شرح باللهجة المصرية مع الحفاظ على المصطلحات الطبية، سواء من ملف PDF
            أو موضوع معين.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab("pdf");
                setResults(null);
              }}
              className={`flex-1 py-4 text-sm sm:text-base font-semibold text-center transition-colors duration-200 flex items-center justify-center gap-2 ${
                activeTab === "pdf"
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <Icon icon="solar:file-text-bold" className="w-5 h-5" />
              من ملف PDF
            </button>
            <button
              onClick={() => {
                setActiveTab("topic");
                setResults(null);
              }}
              className={`flex-1 py-4 text-sm sm:text-base font-semibold text-center transition-colors duration-200 flex items-center justify-center gap-2 ${
                activeTab === "topic"
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <Icon icon="solar:bookmark-circle-bold" className="w-5 h-5" />
              من موضوع
            </button>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Input Section */}
              {activeTab === "pdf" ? (
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
                    اختر ملف PDF
                  </label>
                  <div className="relative">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                          <Icon
                            icon={
                              file
                                ? "solar:file-check-bold"
                                : "solar:cloud-upload-bold"
                            }
                            className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${
                              file
                                ? "text-green-500"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          />
                          <p className="mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center font-medium">
                            {file ? (
                              <span className="flex items-center gap-2 flex-wrap justify-center">
                                <Icon
                                  icon="solar:file-bold"
                                  className="w-5 h-5"
                                />
                                {file.name}
                              </span>
                            ) : (
                              <>
                                <span className="font-semibold">
                                  اضغط لرفع الملف
                                </span>{" "}
                                أو اسحب وأفلت
                              </>
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                            PDF فقط (حد أقصى 50MB)
                          </p>
                        </div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-2 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                    <Icon
                      icon="solar:info-circle-bold"
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                      تأكد من أن ملف الـ PDF يحتوي على نص قابل للنسخ.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
                    الموضوع الطبي
                  </label>
                  <div className="relative">
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="مثال: Diabetes Mellitus, Hypertension..."
                      className="w-full p-4 rounded-xl sm:rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[120px]"
                    />
                    <Icon
                      icon="solar:pen-new-square-linear"
                      className="absolute top-4 right-4 w-5 h-5 text-gray-400"
                    />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    اكتب اسم المرض أو الموضوع الطبي الذي تريد شرحه.
                  </p>
                </div>
              )}

              {/* Options Section */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  خيارات الشرح
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Common Options */}
                  <label className="relative flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeExamples}
                      onChange={() => setIncludeExamples(!includeExamples)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          icon="solar:clipboard-list-bold"
                          className="w-5 h-5 text-indigo-600"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          إضافة أمثلة
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        أمثلة توضيحية للمفاهيم
                      </p>
                    </div>
                  </label>

                  <label className="relative flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={detailedExplanation}
                      onChange={() =>
                        setDetailedExplanation(!detailedExplanation)
                      }
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          icon="solar:book-2-bold"
                          className="w-5 h-5 text-indigo-600"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          شرح مفصّل
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        معلومات إضافية وتفاصيل
                      </p>
                    </div>
                  </label>

                  {/* Topic Specific Option */}
                  {activeTab === "topic" && (
                    <label className="relative flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={subjectBreakdown}
                        onChange={() => setSubjectBreakdown(!subjectBreakdown)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            icon="solar:layers-minimalistic-bold"
                            className="w-5 h-5 text-indigo-600"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            تقسيم الموضوعات
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          تقسيم الشرح إلى عناوين فرعية (مثل: الأسباب، الأعراض،
                          العلاج)
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || (activeTab === "pdf" && !file)}
                  className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl sm:rounded-2xl font-semibold hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner />
                      <span>جاري المعالجة...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:magic-wand-bold" className="w-6 h-6" />
                      <span>
                        {activeTab === "pdf" ? "اشرح الـ PDF" : "اشرح الموضوع"}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="sm:flex-shrink-0 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="solar:refresh-bold" className="w-5 h-5" />
                    إعادة تعيين
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            {/* Summary Card */}
            <div
              id="pdf-summary-card"
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex-shrink-0">
                    <Icon
                      icon={
                        results.pages
                          ? "solar:document-text-bold"
                          : "solar:bookmark-circle-bold"
                      }
                      className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {results.pages ? "الملف" : "الموضوع"}
                    </div>
                    <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white break-all">
                      {results.filename || results.topic}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto"
                  data-html2canvas-ignore
                >
                  <div className="px-3 sm:px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      اللغة
                    </div>
                    <div className="font-medium text-sm text-green-800 dark:text-green-300">
                      {results.language || "Egyptian Arabic"}
                    </div>
                  </div>

                  <button
                    onClick={downloadAsPDF}
                    disabled={generatingPDF}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg sm:rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {generatingPDF ? (
                      <>
                        <LoadingSpinner />
                        <span>جاري...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:download-bold" className="w-4 h-4" />
                        <span>تحميل PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {results.medical_terms_preserved && (
                <div className="mt-4 sm:mt-5 flex items-center gap-2 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                  />
                  <p className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">
                    تم الحفاظ على المصطلحات الطبية
                  </p>
                </div>
              )}
            </div>

            {/* Results Grid (Pages OR Subjects) */}
            <div className="space-y-4" ref={resultsRef}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white px-1">
                {results.pages
                  ? `الصفحات (${results.pages.length})`
                  : `الموضوعات (${results.subjects?.length || 0})`}
              </h2>

              {/* PDF PAGES RENDER */}
              {results.pages && results.pages.length > 0 && (
                <div className="grid gap-4 sm:gap-5">
                  {results.pages.map((p) => (
                    <div
                      key={p.page_number}
                      className="explanation-card bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-md"
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {p.page_number}
                          </div>
                          <span className="font-semibold text-lg text-gray-900 dark:text-white">
                            الصفحة {p.page_number}
                          </span>
                        </div>
                        {p.excerpt_count > 0 && (
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-lg text-sm font-medium">
                            {p.excerpt_count} مقطع
                          </span>
                        )}
                      </div>
                      <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 dark:text-gray-300">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({ children }) => (
                              <strong className="text-indigo-700 dark:text-indigo-300">
                                {children}
                              </strong>
                            ),
                          }}
                        >
                          {p.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TOPIC SUBJECTS RENDER */}
              {results.subjects && results.subjects.length > 0 && (
                <div className="grid gap-4 sm:gap-5">
                  {results.subjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="explanation-card bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-md"
                    >
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {sub.subject_title}
                        </h3>
                      </div>
                      <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 dark:text-gray-300">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({ children }) => (
                              <strong className="text-indigo-700 dark:text-indigo-300">
                                {children}
                              </strong>
                            ),
                          }}
                        >
                          {sub.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!results.pages?.length && !results.subjects?.length && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <Icon
                    icon="solar:file-remove-bold-duotone"
                    className="w-20 h-20 text-gray-400 mx-auto mb-4"
                  />
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    لا توجد محتويات للعرض
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
