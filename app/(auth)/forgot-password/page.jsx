"use client";

import Input from "@/components/ui/Input";
import {
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from "@/services/User";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: request code, 2: verify code, 3: reset password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: "",
    code: "",
    new_password: "",
    confirm_password: "",
  });

  const handleRequestCode = async (e) => {
    e.preventDefault();

    if (!formData.phone_number.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    // Basic phone number validation for Egyptian numbers
    const phoneRegex = /^(?:\+20|0)(10|11|12|15)\d{8}$/;
    if (!phoneRegex.test(formData.phone_number.replace(/\s+/g, ""))) {
      toast.error("يرجى إدخال رقم هاتف صالح");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ phone_number: formData.phone_number });
      toast.success("تم إرسال رمز التحقق إلى تيليجرام الخاص بك");
      setStep(2);
    } catch (error) {
      console.error("Error requesting reset code:", error);
      toast.error("حدث خطأ أثناء طلب رمز التحقق");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("يرجى إدخال رمز التحقق");
      return;
    }

    setLoading(true);
    try {
      await verifyResetCode({
        phone_number: formData.phone_number,
        code: formData.code,
      });
      toast.success("تم التحقق من الرمز بنجاح");
      setStep(3);
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("رمز التحقق غير صحيح أو منتهي الصلاحية");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        phone_number: formData.phone_number,
        code: formData.code,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      toast.success("تم إعادة تعيين كلمة المرور بنجاح!");
      // Redirect to login page after success
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("حدث خطأ أثناء إعادة تعيين كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <Input
              icon="material-symbols:phone-android"
              placeholder="رقم الهاتف (مثل: 01012345678)"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              dir="rtl"
              type="tel"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              سيتم إرسال رمز التحقق إلى حساب تيليجرام المرتبط بهذا الرقم
            </p>

            <button
              onClick={handleRequestCode}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Icon icon="bxl:telegram" className="w-5 h-5" />
                  إرسال رمز التحقق
                </>
              )}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <Icon
                  icon="material-symbols:check-circle"
                  className="w-6 h-6 text-green-500 dark:text-green-400"
                />
                <div className="flex-1 text-right">
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    تم إرسال الرمز بنجاح
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    تحقق من تيليجرام الخاص بك
                  </p>
                </div>
              </div>
            </div>

            <Input
              icon="material-symbols:lock"
              placeholder="000000"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              dir="ltr"
              type="text"
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />

            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <Icon
                    icon="material-symbols:check-circle"
                    className="w-5 h-5"
                  />
                  التحقق من الرمز
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={handleRequestCode}
                disabled={loading}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-2"
              >
                <Icon icon="material-symbols:refresh" className="w-4 h-4" />
                إعادة إرسال الرمز
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Icon
                    icon="material-symbols:lock"
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) =>
                    setFormData({ ...formData, new_password: e.target.value })
                  }
                  className="w-full pr-10 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="كلمة المرور الجديدة"
                  dir="rtl"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                يجب أن تكون 8 أحرف على الأقل
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Icon
                    icon="material-symbols:lock"
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirm_password: e.target.value,
                    })
                  }
                  className="w-full pr-10 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="تأكيد كلمة المرور"
                  dir="rtl"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري إعادة التعيين...</span>
                </>
              ) : (
                <>
                  <Icon icon="material-symbols:refresh" className="w-5 h-5" />
                  إعادة تعيين كلمة المرور
                </>
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex min-h-screen">
        {/* Main Container */}
        <div className="w-full flex">
          {/* Left Side - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="filter brightness-0 invert"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  إعادة تعيين كلمة المرور
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {step === 1 && "أدخل رقم هاتفك لاستعادة كلمة المرور"}
                  {step === 2 && "أدخل الرمز المرسل إلى تيليجرام"}
                  {step === 3 && "أدخل كلمة المرور الجديدة"}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                          step >= stepNumber
                            ? "bg-blue-600 dark:bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div
                          className={`w-8 h-1 mx-1 transition-all duration-200 ${
                            step > stepNumber
                              ? "bg-blue-600 dark:bg-blue-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                {renderStepContent()}
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  تذكرت كلمة المرور؟
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 font-medium transition-colors text-sm"
                  >
                    <Icon icon="material-symbols:login" className="w-4 h-4" />
                    تسجيل الدخول
                  </Link>

                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 font-medium transition-colors text-sm"
                  >
                    <Icon
                      icon="material-symbols:person-add"
                      className="w-4 h-4"
                    />
                    إنشاء حساب جديد
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 px-4 py-2 rounded-lg text-green-600 dark:text-green-400 font-medium transition-colors text-sm"
                  >
                    <Icon icon="material-symbols:home" className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Info */}
          <div className="hidden lg:flex lg:w-1/2 bg-red-600 dark:bg-red-700 items-center justify-center p-8">
            <div className="text-center text-white max-w-md">
              <div className="w-20 h-20 mx-auto mb-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="filter brightness-0 invert"
                />
              </div>
              <h1 className="text-4xl font-bold mb-6">استعادة كلمة المرور</h1>
              <p className="text-red-100 mb-8 text-lg">
                اتبع الخطوات البسيطة لاستعادة الوصول إلى حسابك
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
