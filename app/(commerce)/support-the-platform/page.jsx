"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

const SupportPage = () => {
  const [copiedMethod, setCopiedMethod] = useState(null);

  const copyToClipboard = (text, method) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMethod(method);
      setTimeout(() => setCopiedMethod(null), 2000);
    });
  };

  const paymentMethods = [
    {
      id: "instapay",
      name: "إنستاباي",
      description: "الدفع عبر تطبيق إنستاباي",
      details: "usif.1@instapay",
      icon: "solar:card-bold",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      instructions: [
        "افتح تطبيق إنستاباي على هاتفك",
        "اختر خيار التحويل",
        "أدخل المعرف: usif.1@instapay",
        "أدخل المبلغ المطلوب",
        "أكد العملية",
      ],
    },
    {
      id: "vodafone-cash",
      name: "فودافون كاش",
      description: "الدفع عبر فودافون كاش",
      details: "01070440861",
      icon: "solar:phone-bold",
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      instructions: [
        "افتح تطبيق فودافون كاش على هاتفك",
        "اختر خيار إرسال أموال",
        "أدخل الرقم: 01070440861",
        "أدخل المبلغ المطلوب",
        "أكد العملية بكلمة السر",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-6">
            <Icon
              icon="solar:hand-heart-bold-duotone"
              className="text-3xl text-white"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            دعم المنصة
          </h1>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Icon
              icon="solar:info-circle-bold"
              className="text-green-600 dark:text-green-400 text-2xl mt-1 flex-shrink-0"
            />
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-200 text-lg mb-2">
                ملاحظة مهمة
              </h3>
              <p className="text-green-700 dark:text-green-300 leading-relaxed mb-3">
                جميع خدمات المنصة مجانية تماماً ولا تتطلب أي رسوم أو اشتراكات.
                هذا الدعم مخصص لتطوير المنصة وتحسين الخدمات فقط. جميع التبرعات
                تساعدنا في إضافة ميزات جديدة، تحسين الأداء، وتغطية تكاليف
                التشغيل.
              </p>
              <div className="bg-green-100 dark:bg-green-800/50 rounded-lg p-3 border border-green-300 dark:border-green-600">
                <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                  ✅ جميع الدورات والمحتويات والاختبارات متاحة مجاناً للجميع
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`bg-gradient-to-br ${method.bgColor} dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border ${method.borderColor} dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              {/* Method Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${method.color} rounded-xl shadow-md`}
                >
                  <Icon icon={method.icon} className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {method.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {method.description}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {method.id === "instapay"
                      ? "معرف إنستاباي"
                      : "رقم فودافون كاش"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(method.details, method.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Icon
                      icon={
                        copiedMethod === method.id
                          ? "solar:check-circle-bold"
                          : "solar:copy-bold"
                      }
                      className="w-4 h-4"
                    />
                    {copiedMethod === method.id ? "تم النسخ!" : "نسخ"}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xl font-bold text-gray-900 dark:text-white text-center font-mono">
                    {method.details}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Icon
                    icon="solar:document-text-bold"
                    className="text-blue-500"
                  />
                  خطوات الدفع
                </h4>
                <ol className="space-y-3">
                  {method.instructions.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Support Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            كيف سيتم استخدام دعمك؟
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
              <Icon
                icon="solar:server-bold"
                className="w-12 h-12 text-blue-600 mx-auto mb-4"
              />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                الخوادم والبنية التحتية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                تغطية تكاليف السيرفرات واستضافة المنصة لضمان سرعة وأداء أفضل
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700">
              <Icon
                icon="solar:code-bold"
                className="w-12 h-12 text-green-600 mx-auto mb-4"
              />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                التطوير والتحسين
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                إضافة ميزات جديدة وتحسين الواجهات وتجربة المستخدم باستمرار
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-700">
              <Icon
                icon="solar:shield-check-bold"
                className="w-12 h-12 text-purple-600 mx-auto mb-4"
              />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                الأمان والصيانة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                تحديثات الأمان والصيانة الدورية
              </p>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="text-center">
              <Icon
                icon="solar:heart-bold"
                className="w-16 h-16 text-purple-600 mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-3">
                شكراً لدعمك!
              </h3>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Icon icon="solar:arrow-right-bold" className="w-6 h-6" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
