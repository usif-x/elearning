"use client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Main Login Component
export default function TelegramLoginPage() {
  const [step, setStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState(null); // 'phone' or 'email'
  const [telegramData, setTelegramData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/telegram/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ telegram_auth: authData }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.detail);
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
        telegram_id: telegramData.id,
        telegram_username: telegramData.username,
        telegram_hash: telegramData.hash,
        auth_date: telegramData.auth_date,
        ...(loginMethod === "phone"
          ? { phone_number: formData.phoneNumber }
          : { email: formData.email, password: formData.password }),
      };

      console.log("Login data:", loginData);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert("تم تسجيل الدخول بنجاح!");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 smooth" dir="rtl">
      <div className="flex min-h-screen">
        {/* Image Section */}
        <div className="hidden lg:block lg:w-1/2">
          <img
            src="/images/login.png"
            alt="Login"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Login Content */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 smooth">
          <div className="w-full max-w-md">
            {/* Logo/Header */}
            <div className="text-center mb-8 flex flex-col items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center">
                <img src="images/logo-bg.png" alt="" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 smooth">
                {step === 1 ? "أهلاً بك! جاهز للمذاكرة" : "إكمال تسجيل الدخول"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm smooth">
                {step === 1
                  ? "سجل دخولك من خلال بوت التليجرام الخاص بنا"
                  : "اختر طريقة تسجيل الدخول المناسبة لك"}
              </p>
            </div>

            {/* Step 1: Telegram Auth */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6 border border-blue-100 dark:border-blue-800">
                    <Icon
                      icon="logos:telegram"
                      className="text-6xl mx-auto mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      التحقق من تليجرام
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      قم بتسجيل الدخول باستخدام حساب التليجرام الخاص بك
                    </p>

                    {/* Telegram Widget Container */}
                    <div
                      id="telegram-widget"
                      className="flex justify-center mb-4"
                    ></div>

                    {/* Test Button */}
                    <button
                      onClick={handleMockTelegramAuth}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Icon icon="logos:telegram" className="ml-2" />
                      تسجيل الدخول بتليجرام (تجريبي)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Login Method Selection and Form */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Telegram User Info */}
                {telegramData && (
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg smooth">
                      {telegramData.photo_url ? (
                        <img
                          src={telegramData.photo_url}
                          alt="Profile"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center smooth">
                          <Icon
                            icon="material-symbols:person"
                            className="w-5 h-5 text-white"
                          />
                        </div>
                      )}
                      <div className="text-right">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 smooth">
                          {telegramData.first_name} {telegramData.last_name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 smooth">
                          @{telegramData.username}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Method Selection */}
                {!loginMethod && (
                  <div className="w-full flex items-center gap-2">
                    <Button
                      onClick={() => setLoginMethod("phone")}
                      color="blue"
                      icon="material-symbols:phone-android"
                      text="تسجيل الدخول برقم الهاتف"
                      className="w-1/3"
                    ></Button>

                    <Button
                      onClick={() => setLoginMethod("email")}
                      color="gray"
                      text={"تسجيل الدخول بالبريد الإلكتروني / كلمة المرور"}
                      icon={"material-symbols:mail"}
                      className="w-3/4"
                    ></Button>
                  </div>
                )}

                {/* Login Form */}
                {loginMethod === "phone" && (
                  <div className="space-y-4">
                    <Input
                      icon="material-symbols:phone-android"
                      placeholder="رقم الهاتف"
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
                )}

                {/* Buttons */}
                {loginMethod && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLoginMethod(null)}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ليس لديك حساب؟{" "}
                <Link
                  href="/register"
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
