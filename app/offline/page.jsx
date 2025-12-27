"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Check initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Offline Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Icon Section */}
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 dark:from-sky-600 dark:to-blue-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Icon
                  icon="mdi:wifi-off"
                  className="w-24 h-24 text-white animate-pulse"
                />
                <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-2">
                  <Icon icon="mdi:close" className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              لا يوجد اتصال بالإنترنت
            </h1>
            <p className="text-sky-100 text-lg">No Internet Connection</p>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {isOnline ? (
              // Online Message
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                    <Icon
                      icon="mdi:check-circle"
                      className="w-16 h-16 text-green-500 animate-bounce"
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  تم استعادة الاتصال!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  جاري إعادة تحميل الصفحة...
                </p>
                <div className="flex justify-center">
                  <Icon
                    icon="eos-icons:loading"
                    className="w-8 h-8 text-sky-500"
                  />
                </div>
              </div>
            ) : (
              // Offline Message
              <>
                <div className="space-y-4 mb-8">
                  <h2
                    className="text-2xl font-bold text-gray-900 dark:text-white text-center"
                    dir="rtl"
                  >
                    عذراً، لا يمكنك الوصول إلى هذه الصفحة
                  </h2>
                  <p
                    className="text-gray-600 dark:text-gray-400 text-center"
                    dir="rtl"
                  >
                    يبدو أنك غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة
                    مرة أخرى.
                  </p>
                </div>

                {/* Troubleshooting Steps */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
                  <h3
                    className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
                    dir="rtl"
                  >
                    <Icon icon="mdi:tools" className="w-6 h-6 text-sky-500" />
                    خطوات استكشاف الأخطاء:
                  </h3>
                  <ul className="space-y-3" dir="rtl">
                    <li className="flex items-start gap-3">
                      <Icon
                        icon="mdi:check"
                        className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        تحقق من اتصال Wi-Fi أو بيانات الجوال
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon
                        icon="mdi:check"
                        className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        تأكد من تشغيل وضع الطيران إذا كان مفعلاً
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon
                        icon="mdi:check"
                        className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        أعد تشغيل جهاز التوجيه (Router)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon
                        icon="mdi:check"
                        className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        جرب إعادة تحميل الصفحة بعد استعادة الاتصال
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:refresh" className="w-5 h-5" />
                    <span>إعادة المحاولة</span>
                  </button>
                  <Link
                    href="/"
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:home" className="w-5 h-5" />
                    <span>الصفحة الرئيسية</span>
                  </Link>
                </div>

                {/* Status Indicator */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span>حالة الاتصال: غير متصل</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p dir="rtl">
            سيتم إعادة تحميل الصفحة تلقائياً عند استعادة الاتصال بالإنترنت
          </p>
        </div>
      </div>
    </div>
  );
}
