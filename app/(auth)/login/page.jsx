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
  const [step, setStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState(null); // 'phone' or 'email'
  const [telegramData, setTelegramData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [telegram_hash, setTelegramHash] = useState(null);
  const login = useAuthStore((state) => state.login);

  // Form data
  const [formData, setFormData] = useState({
    phoneNumber: "",
    email: "",
    password: "",
  });

  // Load Telegram Login Widget script
  useEffect(() => {
    if (step === 1 && !document.getElementById("telegram-login-script")) {
      const script = document.createElement("script");
      script.id = "telegram-login-script";
      script.async = true;
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", "ELearningApplicationBot");
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");

      const widgetContainer = document.getElementById("telegram-widget");
      if (widgetContainer) {
        widgetContainer.appendChild(script);
      }
    }

    window.onTelegramAuth = async (user) => {
      toast.success("تم التحقق من حساب تليجرام بنجاح!");
      setStep(2); // Move to step 2 after successful auth
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

      // Send verification to backend
      try {
        const data = await postData("/auth/telegram/verify", {
          telegram_auth: authData,
        });

        if (data.error) {
          toast.error(data.error || "خطأ في التحقق من تليجرام");
          setError(data.error);
          return;
        }

        if (data.next_step === "register") {
          toast.info("لا يوجد حساب مرتبط. يمكنك التسجيل الآن.");
          router.push("/register");
          return;
        } else if (data.next_step === "login") {
          setStep(2);
          setTelegramHash(data.telegram_hash);
          return;
        }
      } catch (err) {
        console.error("Error sending telegram verification:", err);
        setErrors((prev) => ({ ...prev, telegram: "خطأ في توصيل التحقق" }));
      }
    };
  }, [step]);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(?:\+20|0)(10|11|12|15)\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setError("");
  };

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!telegramData) {
        throw new Error("يرجى التحقق من حساب تليجرام أولاً");
      }

      if (loginMethod === "phone") {
        if (!validatePhoneNumber(formData.phoneNumber)) {
          throw new Error("يرجى إدخال رقم هاتف صالح");
        }
      } else {
        if (!validateEmail(formData.email)) {
          throw new Error("يرجى إدخال بريد إلكتروني صالح");
        }
        if (!formData.password) {
          throw new Error("يرجى إدخال كلمة المرور");
        }
      }

      const loginData = {
        telegram_hash: telegram_hash,
        login_method: loginMethod,
        ...(loginMethod === "phone"
          ? {
              phone_number: formData.phoneNumber,
            }
          : {
              email: formData.email,
              password: formData.password,
            }),
      };
      const loginResponse = await postData("/auth/login", loginData);
      if (loginResponse.error) {
        throw new Error(loginResponse.error);
      }
      Swal.fire({
        icon: "success",
        title: "تم تسجيل الدخول بنجاح!",
        showConfirmButton: false,
        timer: 1500,
      });
      login({
        user: loginResponse.user,
        token: loginResponse.access_token,
        refresh_token: loginResponse.refresh_token,
      });
      router.push("/profile");
      /* 
      
      {
        "success": true,
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidGVsZWdyYW1faWQiOiI3NTk1NDc5MjM2IiwidXNlcl9pZCI6MSwicm9sZSI6InN0dWRlbnQiLCJlbWFpbCI6InlvdXNzZWlmQGdtYWlsLmNvbSIsInBob25lIjoiMDEwNzA0NDA4NjEiLCJ2ZXJpZmllZCI6ZmFsc2UsImV4cCI6MTc1NjEzNTIyNiwiaWF0IjoxNzU1NTMwNDI2LCJpc3MiOiJFLUxlYXJuaW5nIFBsYXRmb3JtIiwidHlwZSI6ImFjY2VzcyIsInVzZXJfdXBkYXRlZCI6MTc1NTUzMDMyNH0.-cdU5IOgHswV6A0Q5nA9tnsuIo3P6AeobzEhMsF2brk",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidGVsZWdyYW1faWQiOiI3NTk1NDc5MjM2IiwidXNlcl9pZCI6MSwiZXhwIjoxNzU4MTIyNDI2LCJpYXQiOjE3NTU1MzA0MjYsImlzcyI6IkUtTGVhcm5pbmcgUGxhdGZvcm0iLCJ0eXBlIjoicmVmcmVzaCIsInVzZXJfdXBkYXRlZCI6MTc1NTUzMDMyNH0.fA2mi42ESEqa9p9OLrnnO5FyXlZ8srwApcUXbXjxhck",
        "token_type": "bearer",
        "expires_in": 420,
        "user": {
            "id": 1,
            "email": "yousseif@gmail.com",
            "full_name": "Yousseif Muhammed",
            "display_name": "Yousseif Muhammed",
            "phone_number": "01070440861",
            "parent_phone_number": "01070440862",
            "profile_picture": "https://t.me/i/userpic/320/adhbY7GrEIGqLgiI0mqLgAsvn-guKv2odE4kTitRkIX59HNSRyqCmHApbJeyy0Xd.jpg",
            "is_active": true,
            "is_verified": false,
            "status": "student",
            "telegram_id": "7595479236",
            "telegram_username": "YousseifMuhammed",
            "telegram_first_name": "Yousseif Muhammed",
            "telegram_last_name": null,
            "telegram_verified": true,
            "created_at": "2025-08-18T16:51:25",
            "updated_at": "2025-08-18T18:20:26",
            "last_login": "2025-08-18T15:20:26",
            "identifier": "YousseifMuhammed",
            "login_methods": [
                "email",
                "phone",
                "telegram"
            ]
        },
        "message": "Login successful via email"
    }
      */

      // Here you would typically redirect to dashboard or home page
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Telegram authentication for testing
  const handleMockTelegramAuth = () => {
    setTelegramData({
      id: "123456789",
      username: "demo_user",
      first_name: "أحمد",
      last_name: "محمد",
      photo_url: "",
      auth_date: Date.now(),
      hash: "mock_hash",
    });
    setStep(2);
  };

  const resetLogin = () => {
    setStep(1);
    setTelegramData(null);
    setLoginMethod(null);
    setFormData({
      phoneNumber: "",
      email: "",
      password: "",
    });
    setError("");
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
              {/* Step 1: Telegram Auth */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Icon icon="logos:telegram" className="text-2xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        التحقق من تليجرام
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                        استخدم حساب تليجرام للمصادقة
                      </p>

                      {/* Telegram Widget Container */}
                      <div
                        id="telegram-widget"
                        className="flex justify-center mb-4"
                      ></div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        🔒 آمن ومشفر
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Step 2: Login Method Selection and Form */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Telegram User Info */}
                  {telegramData && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
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

                  {/* Login Method Selection */}
                  {!loginMethod && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center mb-4">
                        اختر طريقة تسجيل الدخول
                      </h4>
                      <div className="space-y-3">
                        <button
                          onClick={() => setLoginMethod("phone")}
                          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-right"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                              <Icon
                                icon="material-symbols:phone-android"
                                className="w-5 h-5 text-white"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                رقم الهاتف
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                تسجيل دخول سريع برقم الهاتف
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setLoginMethod("email")}
                          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-right"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-500 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <Icon
                                icon="material-symbols:mail"
                                className="w-5 h-5 text-white"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                البريد الإلكتروني
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                تسجيل دخول بالبريد وكلمة المرور
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Login Form */}
                  {loginMethod === "phone" && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
                        تسجيل الدخول برقم الهاتف
                      </h4>
                      <Input
                        icon="material-symbols:phone-android"
                        placeholder="رقم الهاتف (مثل: 01012345678)"
                        value={formData.phoneNumber}
                        onChange={handleInputChange("phoneNumber")}
                        error={error}
                        dir="rtl"
                        type="tel"
                      />
                    </div>
                  )}

                  {loginMethod === "email" && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
                        تسجيل الدخول بالبريد الإلكتروني
                      </h4>
                      <div className="space-y-3">
                        <Input
                          icon="material-symbols:mail"
                          placeholder="البريد الإلكتروني"
                          value={formData.email}
                          onChange={handleInputChange("email")}
                          error={error}
                          dir="rtl"
                          type="email"
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
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  {loginMethod && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setLoginMethod(null)}
                        className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                      >
                        رجوع
                      </button>
                      <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
              )}
              <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  ليس لديك حساب؟
                </p>
                <div className="flex flex-col gap-2">
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
                    href="/auth/forgot-password"
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

              {/* Features */}
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Icon
                      icon="material-symbols:security"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">تسجيل دخول آمن</p>
                    <p className="text-blue-100 text-sm">
                      حماية متقدمة لبياناتك
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Icon
                      icon="material-symbols:speed"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">دخول سريع</p>
                    <p className="text-blue-100 text-sm">وصول فوري للمحتوى</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Icon
                      icon="material-symbols:school"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
