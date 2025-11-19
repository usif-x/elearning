"use client";

import {
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from "@/services/User";
import { Icon } from "@iconify/react";
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
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                <Icon
                  icon="solar:key-bold"
                  className="w-10 h-10 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                نسيت كلمة المرور؟
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                أدخل رقم هاتفك وسنرسل رمز التحقق إلى حساب تيليجرام المربوط
              </p>
            </div>

            <form onSubmit={handleRequestCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-4 py-4 text-center text-xl border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="01012345678"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  أدخل رقم الهاتف المسجل في حسابك
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Icon
                    icon="solar:loading-bold"
                    className="w-5 h-5 animate-spin"
                  />
                ) : (
                  <Icon icon="bxl:telegram" className="w-5 h-5" />
                )}
                إرسال رمز التحقق عبر تيليجرام
              </button>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                <Icon
                  icon="solar:verified-check-bold"
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                أدخل رمز التحقق
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                تم إرسال رمز التحقق إلى تيليجرام الخاص بك
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رمز التحقق *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Icon
                    icon="solar:loading-bold"
                    className="w-5 h-5 animate-spin"
                  />
                ) : (
                  <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                )}
                التحقق من الرمز
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={handleRequestCode}
                disabled={loading}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                إعادة إرسال الرمز
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
                <Icon
                  icon="solar:lock-password-bold"
                  className="w-10 h-10 text-purple-600 dark:text-purple-400"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                إعادة تعيين كلمة المرور
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                أدخل كلمة المرور الجديدة
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) =>
                    setFormData({ ...formData, new_password: e.target.value })
                  }
                  className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirm_password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Icon
                    icon="solar:loading-bold"
                    className="w-5 h-5 animate-spin"
                  />
                ) : (
                  <Icon icon="solar:refresh-circle-bold" className="w-5 h-5" />
                )}
                إعادة تعيين كلمة المرور
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step > stepNumber
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {renderStepContent()}
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-2"
          >
            <Icon
              icon="solar:arrow-right-bold"
              className="w-4 h-4 rotate-180"
            />
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
