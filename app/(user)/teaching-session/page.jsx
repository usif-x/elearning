"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { deleteChatSession, getChatSessions } from "@/services/Chat";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ChatInterface from "./components/ChatInterface";
import CreateSessionModal from "./components/CreateSessionModal";
import SessionList from "./components/SessionList";

export default function TeachingSessionPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSessions();
  }, [page, activeOnly]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getChatSessions({
        page,
        page_size: 20,
        active_only: activeOnly,
      });
      setSessions(data.sessions || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("حدث خطأ أثناء تحميل الجلسات");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCreated = (newSession) => {
    setSessions([newSession, ...sessions]);
    setCurrentSession(newSession);
    setIsCreateModalOpen(false);
    toast.success("تم إنشاء الجلسة بنجاح!");
  };

  const handleSelectSession = (session) => {
    setCurrentSession(session);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm("هل أنت متأكد من حذف هذه الجلسة؟")) return;

    try {
      await deleteChatSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
      toast.success("تم حذف الجلسة بنجاح");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("حدث خطأ أثناء حذف الجلسة");
    }
  };

  const handleBackToSessions = () => {
    setCurrentSession(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Icon
                icon="solar:chat-round-dots-bold"
                className="w-12 h-12 text-blue-500"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  جلسة تعليمية تفاعلية
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  تفاعل مع معلم ذكي مبني على الذكاء الاصطناعي لمساعدتك في تعلم
                  المواضيع التي تدرسها.
                </p>
              </div>
            </div>
            {!currentSession && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                <span>جلسة جديدة</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {currentSession ? (
          <ChatInterface
            session={currentSession}
            onBack={handleBackToSessions}
            onSessionUpdated={fetchSessions}
          />
        ) : (
          <>
            {/* Filter Toggle */}
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={() => setActiveOnly(false)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  !activeOnly
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                }`}
              >
                جميع الجلسات
              </button>
              <button
                onClick={() => setActiveOnly(true)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeOnly
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                }`}
              >
                الجلسات النشطة
              </button>
            </div>

            {/* Sessions List */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <SessionList
                  sessions={sessions}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Icon
                        icon="solar:alt-arrow-right-bold"
                        className="w-5 h-5"
                      />
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-300 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600">
                      صفحة {page} من {totalPages}
                    </span>

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Icon
                        icon="solar:alt-arrow-left-bold"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Create Session Modal */}
        {isCreateModalOpen && (
          <CreateSessionModal
            onClose={() => setIsCreateModalOpen(false)}
            onSessionCreated={handleSessionCreated}
          />
        )}
      </div>
    </div>
  );
}
