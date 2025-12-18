"use client";

import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({ message }) {
  const isAssistant = message.role === "assistant";

  // Detect if message is in Arabic (RTL) or English (LTR)
  const isArabic = (text) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  const messageIsArabic = isArabic(message.content);
  const textDirection = messageIsArabic ? "rtl" : "ltr";
  // AI messages on left (like WhatsApp), user messages on right
  const justifyContent = isAssistant ? "justify-start" : "justify-end";

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${justifyContent}`}>
      <div
        dir={textDirection}
        className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4 ${
          isAssistant
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
            : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
          <div
            className={`p-1 sm:p-1.5 rounded-lg ${
              isAssistant ? "bg-blue-500" : "bg-gray-500 dark:bg-gray-600"
            }`}
          >
            <Icon
              icon={
                isAssistant
                  ? "solar:user-speak-rounded-bold"
                  : "solar:user-bold"
              }
              className="w-3 h-3 sm:w-4 sm:h-4 text-white"
            />
          </div>
          <span
            className={`text-[10px] sm:text-xs font-semibold ${
              isAssistant
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {isAssistant ? "المعلم" : "أنت"}
          </span>
          <span
            className={`text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 ${
              messageIsArabic ? "mr-auto" : "ml-auto"
            }`}
          >
            {formatTime(message.created_at)}
          </span>
        </div>

        {/* Content */}
        <div
          className={`prose prose-sm max-w-none ${
            isAssistant
              ? "text-gray-700 dark:text-gray-200"
              : "text-gray-800 dark:text-gray-100"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => (
                <p className="mb-2 last:mb-0" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong
                  className="font-bold text-blue-600 dark:text-blue-400"
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside mb-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside mb-2" {...props} />
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code
                    className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm"
                    {...props}
                  />
                ) : (
                  <code
                    className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto"
                    {...props}
                  />
                ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
