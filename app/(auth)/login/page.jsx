"use client";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/hooks/useAuth";
import { postData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Main Login Component
export default function TelegramLoginPage() {
  const router = useRouter();
  const [expandedMethod, setExpandedMethod] = useState(null); // 'phone' or 'academic'
  const [telegramData, setTelegramData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [telegram_hash, setTelegramHash] = useState(null);
  const login = useAuthStore((state) => state.login);

  // Form data
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    academicId: "",
    academicPassword: "",
  });

  // Load Telegram Login Widget script
  useEffect(() => {
    if (!document.getElementById("telegram-login-script")) {
      const script = document.createElement("script");
      script.id = "telegram-login-script";
      script.async = true;
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", "DahhehetMedicalBot");
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");

      const widgetContainer = document.getElementById("telegram-widget");
      if (widgetContainer) {
        widgetContainer.appendChild(script);
      }
    }

    window.onTelegramAuth = async (user) => {
      toast.success("تم التحقق من حساب تليجرام محلياً");
      const authData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        auth_date: user.auth_date,
        hash: user.hash,
      };

      // Update state with Telegram data
      setTelegramData(authData);

      // Send verification to backend and handle all possible server flows
      try {
        const data = await postData("/auth/telegram/verify", {
          telegram_auth: authData,
        });

        if (data.error) {
          toast.error(data.error || "خطأ في التحقق من تليجرام");
          setError(data.error || "خطأ في التحقق من تليجرام");
          return;
        }

        // If backend tells client to register
        if (data.next_step === "register") {
          toast.info("لا يوجد حساب مرتبط. يمكنك التسجيل الآن.");
          router.push("/register");
          return;
        }

        // If backend returned tokens and authenticated the user immediately
        if (data.next_step === "authenticated" || data.access_token) {
          const userObj = data.user || data.user_data || data.userData;
          login({
            user: userObj,
            token: data.access_token,
            refresh_token: data.refresh_token,
          });
          toast.success("تم تسجيل الدخول عبر تليجرام بنجاح!");
          router.push("/profile");
          return;
        }

        // If backend asks to continue with manual login
        if (data.next_step === "login") {
          setTelegramHash(data.telegram_hash || null);
          toast.info("يمكنك الآن اختيار طريقة تسجيل الدخول");
          return;
        }
      } catch (err) {
        console.error("Error sending telegram verification:", err);
        setError("خطأ في توصيل التحقق");
      }
    };
  }, []);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(?:\+20|0)(10|11|12|15)\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setError("");
  };

  const handleLogin = async (method) => {
    setError("");
    setIsLoading(true);

    try {
      let loginResponse = null;

      if (method === "telegram") {
        const telegramIdToSend = telegramData?.id;
        if (!telegramIdToSend) {
          throw new Error("يرجى التحقق من حساب تليجرام أولاً");
        }
        loginResponse = await postData("/auth/direct-login", {
          login_method: "telegram",
          telegram_id: telegramIdToSend,
        });
      } else if (method === "phone") {
        if (!validatePhoneNumber(formData.phoneNumber)) {
          throw new Error("يرجى إدخال رقم هاتف صالح");
        }
        if (!formData.password) {
          throw new Error("يرجى إدخال كلمة المرور");
        }
        loginResponse = await postData("/auth/direct-login", {
          login_method: "phone",
          phone_number: formData.phoneNumber,
          password: formData.password,
        });
      } else if (method === "academic") {
        if (!formData.academicId) {
          throw new Error("يرجى إدخال كود الطالب");
        }
        if (!formData.academicPassword) {
          throw new Error("يرجى إدخال كلمة المرور");
        }
        loginResponse = await postData("/auth/academic/login", {
          academic_id: formData.academicId,
          password: formData.academicPassword,
        });
      }

      if (!loginResponse) {
        throw new Error("لم يتم استلام استجابة من الخادم");
      }

      if (loginResponse.error) {
        throw new Error(loginResponse.error);
      }

      const token = loginResponse.access_token || loginResponse.token;
      const refresh =
        loginResponse.refresh_token || loginResponse.refreshToken || null;
      const userObj = loginResponse.user || loginResponse.user_data || null;

      if (token) {
        Swal.fire({
          icon: "success",
          title: "تم تسجيل الدخول بنجاح!",
          showConfirmButton: false,
          timer: 1500,
        });
        login({
          user: userObj,
          token: token,
          refresh_token: refresh,
        });
        router.push("/profile");
      } else {
        throw new Error("فشل في تسجيل الدخول. لم يتم استلام رمز وصول.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
      toast.error(error.message || "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex min-h-screen">
        {/* Main Container */}
        <div className="w-full flex">
          {/* Left Side - Forms */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="filter brightness-0 invert"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  تسجيل الدخول
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  مرحباً بك مرة أخرى
                </p>
              </div>

              {/* All Login Methods Visible */}
              <div className="space-y-4">
                {/* Method 1: Telegram Login */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Icon icon="logos:telegram" className="text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      تسجيل الدخول عبر تليجرام
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                      استخدم حساب تليجرام للمصادقة السريعة
                    </p>

                    {/* Telegram User Info if verified */}
                    {telegramData && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          {telegramData.photo_url ? (
                            <img
                              src={telegramData.photo_url}
                              alt="Profile"
                              className="w-10 h-10 rounded-full border-2 border-green-300 dark:border-green-600"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                              <Icon
                                icon="material-symbols:person"
                                className="w-5 h-5 text-white"
                              />
                            </div>
                          )}
                          <div className="flex-1 text-right">
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                              {telegramData.first_name} {telegramData.last_name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              @{telegramData.username}
                            </p>
                          </div>
                          <Icon
                            icon="material-symbols:check-circle"
                            className="w-5 h-5 text-green-500 dark:text-green-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Telegram Widget Container */}
                    <div
                      id="telegram-widget"
                      className="flex justify-center mb-4"
                    ></div>

                    {telegramData && (
                      <button
                        onClick={() => handleLogin("telegram")}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>جاري التسجيل...</span>
                          </div>
                        ) : (
                          "تسجيل الدخول عبر تليجرام"
                        )}
                      </button>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      🔒 آمن ومشفر
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                      أو
                    </span>
                  </div>
                </div>

                {/* Method 2: Phone Number Login */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedMethod(
                        expandedMethod === "phone" ? null : "phone"
                      )
                    }
                    className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                        <Icon
                          icon="material-symbols:phone-android"
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          رقم الهاتف
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          تسجيل دخول برقم الهاتف وكلمة المرور
                        </p>
                      </div>
                      <Icon
                        icon={
                          expandedMethod === "phone"
                            ? "material-symbols:expand-less"
                            : "material-symbols:expand-more"
                        }
                        className="w-6 h-6 text-gray-400"
                      />
                    </div>
                  </button>

                  {expandedMethod === "phone" && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <Input
                        icon="material-symbols:phone-android"
                        placeholder="رقم الهاتف (مثل: 01012345678)"
                        value={formData.phoneNumber}
                        onChange={handleInputChange("phoneNumber")}
                        error={error}
                        dir="rtl"
                        type="tel"
                      />
                      <Input
                        icon="material-symbols:lock"
                        placeholder="كلمة المرور"
                        value={formData.password}
                        onChange={handleInputChange("password")}
                        error={error}
                        dir="rtl"
                        type="password"
                      />
                      <button
                        onClick={() => handleLogin("phone")}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>جاري التسجيل...</span>
                          </div>
                        ) : (
                          "تسجيل الدخول"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Method 3: Academic Login */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedMethod(
                        expandedMethod === "academic" ? null : "academic"
                      )
                    }
                    className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                        <Icon
                          icon="material-symbols:school"
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          تسجيل أكاديمي
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          تسجيل دخول بكود الطالب وكلمة المرور
                        </p>
                      </div>
                      <Icon
                        icon={
                          expandedMethod === "academic"
                            ? "material-symbols:expand-less"
                            : "material-symbols:expand-more"
                        }
                        className="w-6 h-6 text-gray-400"
                      />
                    </div>
                  </button>

                  {expandedMethod === "academic" && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <Input
                        icon="material-symbols:badge"
                        placeholder="كود الطالب"
                        value={formData.academicId}
                        onChange={handleInputChange("academicId")}
                        error={error}
                        dir="rtl"
                      />
                      <Input
                        icon="material-symbols:lock"
                        placeholder="كلمة المرور"
                        value={formData.academicPassword}
                        onChange={handleInputChange("academicPassword")}
                        error={error}
                        dir="rtl"
                        type="password"
                      />
                      <button
                        onClick={() => handleLogin("academic")}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>جاري التسجيل...</span>
                          </div>
                        ) : (
                          "تسجيل الدخول الأكاديمي"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  ليس لديك حساب؟
                </p>

                <div className="flex flex-col gap-2 items-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 font-medium transition-colors text-sm"
                  >
                    <Icon
                      icon="material-symbols:person-add"
                      className="w-4 h-4"
                    />
                    إنشاء حساب جديد
                  </Link>

                  <Link
                    href="/academic/register"
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 font-medium transition-colors text-sm"
                  >
                    <Icon icon="material-symbols:badge" className="w-4 h-4" />
                    تسجيل أكاديمي
                  </Link>

                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center gap-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 font-medium transition-colors text-sm"
                  >
                    <Icon
                      icon="material-symbols:lock-reset"
                      className="w-4 h-4"
                    />
                    نسيت كلمة المرور؟
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
          <div className="hidden lg:flex lg:w-1/2 bg-blue-600 dark:bg-blue-700 items-center justify-center p-8">
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
              <h1 className="text-4xl font-bold mb-6">أهلاً بك مرة أخرى!</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
