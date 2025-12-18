"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getChatSession,
  sendChatMessageStream,
  updateChatSession,
} from "@/services/Chat";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ChatMessage from "./ChatMessage";
import StreamingMessage from "./StreamingMessage";

export default function ChatInterface({ session, onBack, onSessionUpdated }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(session);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [session.id]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const data = await getChatSession(session.id);
      setSessionDetails(data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching session details:", error);
      toast.error("حدث خطأ أثناء تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || sending) return;

    if (!sessionDetails.is_active) {
      toast.error("هذه الجلسة غير نشطة. يرجى تفعيلها أولاً");
      return;
    }

    const userMessageText = inputMessage.trim();
    setInputMessage("");
    setSending(true);
    setStreamingContent("");
    setIsStreaming(true);

    try {
      await sendChatMessageStream(
        session.id,
        userMessageText,
        // onContent: Accumulate streaming chunks
        (content) => {
          setStreamingContent((prev) => prev + content);
        },
        // onUserMessage: Add user message to chat
        (userMessage) => {
          setMessages((prev) => [...prev, userMessage]);
          scrollToBottom();
        },
        // onDone: Add complete assistant message
        (assistantMessage) => {
          setMessages((prev) => [...prev, assistantMessage]);
          setStreamingContent("");
          setIsStreaming(false);
          setSending(false);
          scrollToBottom();
        },
        // onError: Handle errors
        (error) => {
          console.error("Streaming error:", error);
          toast.error("حدث خطأ أثناء إرسال الرسالة");
          setInputMessage(userMessageText);
          setStreamingContent("");
          setIsStreaming(false);
          setSending(false);
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة");
      setInputMessage(userMessageText);
      setStreamingContent("");
      setIsStreaming(false);
      setSending(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateChatSession(session.id, {
        is_active: !sessionDetails.is_active,
      });
      setSessionDetails((prev) => ({
        ...prev,
        is_active: !prev.is_active,
      }));
      onSessionUpdated();
      toast.success(
        sessionDetails.is_active ? "تم إيقاف الجلسة" : "تم تفعيل الجلسة"
      );
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("حدث خطأ أثناء تحديث الجلسة");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300 flex-shrink-0"
            >
              <Icon
                icon="solar:alt-arrow-right-bold"
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400"
              />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {sessionDetails.title}
              </h2>
              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                <span
                  className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    sessionDetails.is_active
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {sessionDetails.is_active ? "نشط" : "غير نشط"}
                </span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {sessionDetails.language === "ar" ? "عربي" : "English"}
                </span>
                <span className="hidden xs:inline text-xs text-gray-500 dark:text-gray-400">
                  {messages.length} رسالة
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleActive}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold transition-all duration-300 flex-shrink-0 ${
              sessionDetails.is_active
                ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400"
                : "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 dark:text-green-400"
            }`}
          >
            {sessionDetails.is_active ? "إيقاف" : "تفعيل"}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="h-[calc(100vh-280px)] sm:h-[calc(100vh-350px)] lg:h-[calc(100vh-400px)] overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 scroll-smooth"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon
              icon="solar:chat-round-bold"
              className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-500 dark:text-gray-400">
              لا توجد رسائل بعد. ابدأ المحادثة!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isStreaming && streamingContent && (
              <StreamingMessage content={streamingContent} />
            )}
            {sending && !streamingContent && (
              <div className="flex justify-start">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 max-w-[80%] border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      المعلم يفكر...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              sessionDetails.is_active ? "اكتب رسالتك..." : "الجلسة غير نشطة"
            }
            disabled={!sessionDetails.is_active || sending}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={
              !inputMessage.trim() || !sessionDetails.is_active || sending
            }
            className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl"
          >
            <Icon icon="solar:plain-3-bold" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">إرسال</span>
          </button>
        </form>
      </div>
    </div>
  );
}
