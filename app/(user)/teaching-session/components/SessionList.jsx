"use client";

import { Icon } from "@iconify/react";

export default function SessionList({
  sessions,
  onSelectSession,
  onDeleteSession,
}) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full mb-6">
          <Icon
            icon="solar:chat-round-bold"
            className="w-16 h-16 text-blue-500"
          />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          لا توجد جلسات بعد
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          ابدأ بإنشاء جلسة تعليمية جديدة!
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-600"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon
                  icon="solar:chat-round-bold"
                  className="w-6 h-6 text-blue-500"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                  {session.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      session.is_active
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {session.is_active ? "نشط" : "غير نشط"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {session.language === "ar" ? "عربي" : "English"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Icon icon="solar:chat-line-bold" className="w-4 h-4" />
              <span>{session.message_count} رسالة</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
              <span>{formatDate(session.created_at)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onSelectSession(session)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Icon icon="solar:chat-round-bold" className="w-4 h-4" />
              <span>فتح</span>
            </button>
            <button
              onClick={() => onDeleteSession(session.id)}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
