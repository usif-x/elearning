"use client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/hooks/useAuth";
import { postData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
        const res = postData("/auth/telegram/verify", {
          telegram_auth: authData,
        });

        const data = await res;
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
        ...(loginMethod === "phone"
          ? {
              telegram_hash: telegram_hash,
              login_method: "phone",
              phone_number: formData.phoneNumber,
            }
          : {
              telegram_hash: telegram_hash,
              login_method: "email",
              email: formData.email,
              password: formData.password,
            }),
      };
      const loginResponse = await postData("/auth/login", loginData);
      if (loginResponse.error) {
        throw new Error(loginResponse.error);
      }
      toast.success("تم تسجيل الدخول بنجاح!");
      login({
        user: loginResponse.user,
        token: loginResponse.access_token,
        refresh_token: loginResponse.refresh_token,
      });
      router.push("/");
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
                <Image
                  src="/images/logo-bg.png"
                  alt="Logo"
                  width={40}
                  height={40}
                />
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
                      اضغط على الزر أدناه للتحقق من الهوية باستخدام تليجرام
                    </p>

                    {/* Telegram Widget Container */}
                    <div
                      id="telegram-widget"
                      className="flex justify-center mb-4"
                    ></div>
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
