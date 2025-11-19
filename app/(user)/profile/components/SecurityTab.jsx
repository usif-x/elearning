import {
  forgotPassword,
  resetPassword,
  updateUserPassword,
  verifyResetCode,
} from "@/services/User";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "react-toastify";

const SecurityTab = ({ user }) => {
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Forgot Password states
  const [resetStep, setResetStep] = useState(1); // 1: request code, 2: verify code, 3: reset password
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetData, setResetData] = useState({
    phone_number: "",
    code: "",
    new_password: "",
    confirm_password: "",
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setPasswordLoading(true);
    try {
      await updateUserPassword(passwordData);
      toast.success("تم تحديث كلمة المرور بنجاح!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("حدث خطأ أثناء تحديث كلمة المرور");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();

    if (!resetData.phone_number.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    // Basic phone number validation for Egyptian numbers
    const phoneRegex = /^(?:\+20|0)(10|11|12|15)\d{8}$/;
    if (!phoneRegex.test(resetData.phone_number.replace(/\s+/g, ""))) {
      toast.error("يرجى إدخال رقم هاتف صالح");
      return;
    }

    setResetLoading(true);
    try {
      await forgotPassword({ phone_number: resetData.phone_number });
      toast.success("تم إرسال رمز التحقق إلى تيليجرام الخاص بك");
      setResetStep(2);
    } catch (error) {
      console.error("Error requesting reset code:", error);
      toast.error("حدث خطأ أثناء طلب رمز التحقق");
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyResetCode = async (e) => {
    e.preventDefault();
    if (!resetData.code.trim()) {
      toast.error("يرجى إدخال رمز التحقق");
      return;
    }

    setResetLoading(true);
    try {
      await verifyResetCode({
        phone_number: resetData.phone_number,
        code: resetData.code,
      });
      toast.success("تم التحقق من الرمز بنجاح");
      setResetStep(3);
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("رمز التحقق غير صحيح أو منتهي الصلاحية");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetData.new_password !== resetData.confirm_password) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    if (resetData.new_password.length < 8) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword({
        phone_number: resetData.phone_number,
        code: resetData.code,
        new_password: resetData.new_password,
        confirm_password: resetData.confirm_password,
      });
      toast.success("تم إعادة تعيين كلمة المرور بنجاح!");
      setResetData({
        phone_number: "",
        code: "",
        new_password: "",
        confirm_password: "",
      });
      setShowResetForm(false);
      setResetStep(1);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("حدث خطأ أثناء إعادة تعيين كلمة المرور");
    } finally {
      setResetLoading(false);
    }
  };

  const resetResetForm = () => {
    setShowResetForm(false);
    setResetStep(1);
    setResetData({
      phone_number: "",
      code: "",
      new_password: "",
      confirm_password: "",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        الأمان والخصوصية
      </h2>

      <div className="space-y-4">
        {/* Account Verification Status */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon
              icon="solar:verified-check-bold"
              className="w-8 h-8 text-green-500"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                حالة التوثيق
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.is_verified ? "حساب موثق" : "حساب غير موثق"}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              user?.is_verified
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            }`}
          >
            {user?.is_verified ? "موثق" : "غير موثق"}
          </div>
        </div>

        {/* Telegram Account */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="bxl:telegram" className="w-8 h-8 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                حساب تيليجرام
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.telegram_username
                  ? `@${user.telegram_username}`
                  : "غير مربوط"}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              user?.telegram_verified
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
            }`}
          >
            {user?.telegram_verified ? "مربوط" : "غير مربوط"}
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon
                icon="solar:lock-password-bold"
                className="w-8 h-8 text-purple-500"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  تغيير كلمة المرور
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  قم بتحديث كلمة مرور حسابك
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {showPasswordForm ? "إلغاء" : "تغيير"}
            </button>
          </div>

          {showPasswordForm && (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور الحالية *
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm_password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <Icon
                      icon="solar:loading-bold"
                      className="w-4 h-4 animate-spin"
                    />
                  ) : (
                    <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                  )}
                  تحديث كلمة المرور
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Password Reset Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon
                icon="solar:lock-keyhole-bold"
                className="w-8 h-8 text-orange-500"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  إعادة تعيين كلمة المرور
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  إعادة تعيين كلمة المرور عبر تيليجرام
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (showResetForm) {
                  resetResetForm();
                } else {
                  setShowResetForm(true);
                }
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {showResetForm ? "إلغاء" : "إعادة تعيين"}
            </button>
          </div>

          {showResetForm && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          resetStep >= stepNumber
                            ? "bg-orange-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div
                          className={`w-8 h-1 mx-2 ${
                            resetStep > stepNumber
                              ? "bg-orange-600"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              {resetStep === 1 && (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                      <Icon
                        icon="solar:key-bold"
                        className="w-8 h-8 text-orange-600 dark:text-orange-400"
                      />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      أدخل رقم هاتفك وسنرسل رمز التحقق إلى حساب تيليجرام المربوط
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      value={resetData.phone_number}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          phone_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 text-center border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="01012345678"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      أدخل رقم الهاتف المسجل في حسابك
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {resetLoading ? (
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
              )}

              {resetStep === 2 && (
                <form onSubmit={handleVerifyResetCode} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      تم إرسال رمز التحقق إلى تيليجرام الخاص بك
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                      رمز التحقق *
                    </label>
                    <input
                      type="text"
                      value={resetData.code}
                      onChange={(e) =>
                        setResetData({ ...resetData, code: e.target.value })
                      }
                      className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleRequestResetCode}
                      disabled={resetLoading}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                    >
                      إعادة إرسال
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resetLoading ? (
                        <Icon
                          icon="solar:loading-bold"
                          className="w-4 h-4 animate-spin"
                        />
                      ) : (
                        <Icon
                          icon="solar:check-circle-bold"
                          className="w-4 h-4"
                        />
                      )}
                      التحقق
                    </button>
                  </div>
                </form>
              )}

              {resetStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      أدخل كلمة المرور الجديدة
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      كلمة المرور الجديدة *
                    </label>
                    <input
                      type="password"
                      value={resetData.new_password}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          new_password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <input
                      type="password"
                      value={resetData.confirm_password}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          confirm_password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {resetLoading ? (
                      <Icon
                        icon="solar:loading-bold"
                        className="w-5 h-5 animate-spin"
                      />
                    ) : (
                      <Icon
                        icon="solar:refresh-circle-bold"
                        className="w-5 h-5"
                      />
                    )}
                    إعادة تعيين كلمة المرور
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
