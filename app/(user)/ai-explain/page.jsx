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
const HISTORY_KEY = "ai-explain-history";

export default function AIExplainPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const fileRef = useRef(null);
  const resultsRef = useRef(null);

  const [activeTab, setActiveTab] = useState("pdf");
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState("");
  const [subjectBreakdown, setSubjectBreakdown] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [detailedExplanation, setDetailedExplanation] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const saveToHistory = (data) => {
    try {
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: data.pages ? "pdf" : "topic",
        title: data.filename || data.topic,
        data: data,
      };
      const updated = [historyItem, ...history].slice(0, 50);
      setHistory(updated);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const deleteHistoryItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    toast.success("تم حذف العنصر من السجل");
  };

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

  const downloadAsPDF = async (data = results) => {
    if (!data) {
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

      const cards = data.pages || data.subjects || [];
      for (let i = 0; i < cards.length; i++) {
        const cardElement = document.createElement("div");
        cardElement.className = "p-6 bg-white";
        cardElement.innerHTML = `
          <div class="mb-4 pb-4 border-b border-gray-200">
            <h3 class="font-bold text-lg">${
              data.pages
                ? `الصفحة ${cards[i].page_number}`
                : cards[i].subject_title
            }</h3>
          </div>
          <div class="prose">${cards[i].explanation}</div>
        `;
        document.body.appendChild(cardElement);

        const canvas = await html2canvas(cardElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        document.body.removeChild(cardElement);

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

      const baseName = data.filename
        ? data.filename.replace(".pdf", "")
        : data.topic || "Explanation";
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
      form.append("detailed_explanation", detailedExplanation ? "true" : "false");

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
      saveToHistory(data);
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

  const tabs = [
    { id: "pdf", label: "شرح من PDF", icon: "solar:file-text-bold" },
    { id: "topic", label: "شرح من موضوع", icon: "solar:bookmark-circle-bold" },
    { id: "history", label: "سجل الشروحات", icon: "solar:history-bold" },
  ];

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderHistory = () => {
    if (filteredHistory.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full mb-6">
            <Icon icon="solar:history-bold" className="w-16 h-16 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            لا يوجد سجل شروحات
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            ابدأ بشرح محتوى جديد لإنشاء سجل
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    icon={
                      item.type === "pdf"
                        ? "solar:document-text-bold"
                        : "solar:bookmark-circle-bold"
                    }
                    className="w-5 h-5 text-indigo-500"
                  />
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.type === "pdf"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    }`}
                  >
                    {item.type === "pdf" ? "PDF" : "موضوع"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Icon icon="solar:clock-circle-bold" className="w-4 h-4 text-gray-400" />
                <span>{new Date(item.timestamp).toLocaleDateString("ar-EG")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Icon icon="solar:document-bold" className="w-4 h-4 text-purple-500" />
                <span>
                  {item.data.pages?.length || item.data.subjects?.length || 0}{" "}
                  {item.type === "pdf" ? "صفحة" : "موضوع فرعي"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResults(item.data);
                  setActiveTab(item.type);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl text-center text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Icon icon="solar:eye-bold" className="w-4 h-4" />
                <span>عرض</span>
              </button>
              <button
                onClick={() => downloadAsPDF(item.data)}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Icon icon="solar:download-bold" className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteHistoryItem(item.id)}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderForm = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "pdf" ? (
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              اختر ملف PDF
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Icon
                    icon={file ? "solar:file-check-bold" : "solar:cloud-upload-bold"}
                    className={`w-12 h-12 mb-3 ${
                      file ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {file ? (
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:file-bold" className="w-5 h-5" />
                        {file.name}
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold">اضغط لرفع الملف</span> أو اسحب وأفلت
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">PDF فقط (حد أقصى 50MB)</p>
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
        ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              الموضوع الطبي
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: Diabetes Mellitus, Hypertension..."
              className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[120px]"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <input
              type="checkbox"
              checked={includeExamples}
              onChange={() => setIncludeExamples(!includeExamples)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="solar:clipboard-list-bold" className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">إضافة أمثلة</span>
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <input
              type="checkbox"
              checked={detailedExplanation}
              onChange={() => setDetailedExplanation(!detailedExplanation)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="solar:book-2-bold" className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">شرح مفصّل</span>
              </div>
            </div>
          </label>

          {activeTab === "topic" && (
            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors sm:col-span-2">
              <input
                type="checkbox"
                checked={subjectBreakdown}
                onChange={() => setSubjectBreakdown(!subjectBreakdown)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="solar:layers-minimalistic-bold" className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">تقسيم الموضوعات</span>
                </div>
              </div>
            </label>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || (activeTab === "pdf" && !file)}
            className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <LoadingSpinner />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:magic-wand-bold" className="w-6 h-6" />
                <span>{activeTab === "pdf" ? "اشرح الـ PDF" : "اشرح الموضوع"}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon icon="solar:refresh-bold" className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg">
              <Icon icon="solar:magic-stick-3-bold-duotone" className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                شرح المحتوى
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                شرح باللهجة المصرية مع الحفاظ على المصطلحات الطبية
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto md:overflow-visible scrollbar-hide">
            <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setResults(null);
                  }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon icon={tab.icon} className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search for History */}
        {activeTab === "history" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Icon
                icon="solar:search-bold"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                type="text"
                placeholder="البحث في السجل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Form */}
        {activeTab !== "history" && renderForm()}

        {/* Content */}
        {activeTab === "history" ? (
          renderHistory()
        ) : results ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Icon
                    icon={
                      results.pages
                        ? "solar:document-text-bold"
                        : "solar:bookmark-circle-bold"
                    }
                    className="w-6 h-6 text-blue-500"
                  />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {results.filename || results.topic}
                  </h2>
                </div>
                <button
                  onClick={() => downloadAsPDF()}
                  disabled={generatingPDF}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
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

            <div className="grid gap-6">
              {(results.pages || results.subjects || []).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {results.pages ? item.page_number : idx + 1}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {results.pages ? `الصفحة ${item.page_number}` : item.subject_title}
                    </h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({ children }) => (
                          <strong className="text-indigo-700 dark:text-indigo-300 font-bold">
                            {children}
                          </strong>
                        ),
                      }}
                    >
                      {item.explanation}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
