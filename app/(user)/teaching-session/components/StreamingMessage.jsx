"use client";

import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function StreamingMessage({ content }) {
  // Detect if message is in Arabic (RTL) or English (LTR)
  const isArabic = (text) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  const messageIsArabic = isArabic(content);
  const textDirection = messageIsArabic ? "rtl" : "ltr";

  return (
    <div className="flex justify-start animate-fade-in">
      <div
        dir={textDirection}
        className="max-w-[80%] rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-blue-500">
            <Icon
              icon="solar:user-speak-rounded-bold"
              className="w-4 h-4 text-white"
            />
          </div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            المعلم
          </span>
          <span
            className={`text-xs text-gray-400 dark:text-gray-500 ${
              messageIsArabic ? "mr-auto" : "ml-auto"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span>يكتب...</span>
            </div>
          </span>
        </div>

        {/* Streaming Content */}
        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200">
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
            {content}
          </ReactMarkdown>
          {/* Cursor blink effect */}
          <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-0.5"></span>
        </div>
      </div>
    </div>
  );
}
