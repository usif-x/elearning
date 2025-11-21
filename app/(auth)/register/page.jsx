"use client";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useAuthStore } from "@/hooks/useAuth";
import { postData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Main Register Component
export default function TelegramRegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState(1);
  const [telegramData, setTelegramData] = useState(null);
  const [telegramHash, setTelegramHash] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const genderOptions = [
    { value: "Male", label: "ذكر" },
    { value: "Female", label: "أنثى" },
  ];

  // Load Telegram Login Widget script
  useEffect(() => {
    if (step === 1 && !document.getElementById("telegram-login-script")) {
      const script = document.createElement("script");
      script.id = "telegram-login-script";
      script.async = true;
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", "ElearningApplicationBot");
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
          console.error("Telegram verification error:", data);
          toast.error(data.error || "خطأ في التحقق من تليجرام");
          setErrors((prev) => ({ ...prev, telegram: data.error }));
          return;
        }
        if (data.next_step === "register") {
          setTelegramHash(data.telegram_hash); // Store the hash for registration
          setStep(2); // Move to step 2 after successful auth
        } else if (data.next_step === "login") {
          toast.info("لديك حساب بالفعل. تسجيل الدخول الآن.");
          router.push("/login");
          return;
        }

        console.log("Telegram verified:", data);
      } catch (err) {
        console.error("Error sending telegram verification:", err);
        setErrors((prev) => ({ ...prev, telegram: "خطأ في توصيل التحقق" }));
      }
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [step, router]);

  // Validation functions
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(?:\+20|0)(10|11|12|15)\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFullName = (name) => {
    return name.length >= 3 && /^[a-zA-Zأ-ي\s]+$/.test(name);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Handle form input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate current step
  const validateStep = (stepNumber) => {
    const newErrors = {};

    switch (stepNumber) {
      case 2:
        if (!validateFullName(formData.fullName)) {
          newErrors.fullName = "يرجى إدخال اسم صالح (3 أحرف على الأقل)";
        }
        if (!validatePhoneNumber(formData.phoneNumber)) {
          newErrors.phoneNumber = "يرجى إدخال رقم هاتف صالح";
        }
        if (!formData.gender) {
          newErrors.gender = "يرجى اختيار النوع";
        }
        break;

      case 3:
        if (!validateEmail(formData.email)) {
          newErrors.email = "يرجى إدخال بريد إلكتروني صالح";
        }
        if (!validatePassword(formData.password)) {
          newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "كلمة المرور غير متطابقة";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    // Validate the current step before moving to the next
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Handle final registration
  const handleRegister = async () => {
    // Final validation before submitting
    if (!validateStep(3)) return;

    setIsLoading(true);
    setErrors({});

    try {
      const registrationData = {
        telegram_hash: telegramHash, // Use the hash from verification response
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        sex: formData.gender,
      };

      const registerResponse = await postData(
        "/auth/register",
        registrationData
      );

      if (registerResponse.error) {
        // Handle backend validation errors
        if (typeof registerResponse.error === "object") {
          setErrors(registerResponse.error);
          toast.error("يرجى مراجعة الحقول المدخلة.");
        } else {
          throw new Error(registerResponse.error);
        }
        return;
      }

      login({
        user: registerResponse.user,
        token: registerResponse.access_token,
        refresh_token: registerResponse.refresh_token,
      });

      await Swal.fire({
        icon: "success",
        title: "تم إنشاء الحساب بنجاح!",
        text: "يرجي تسجيل الدخول للمتابعة.",
        confirmButtonText: "حسناً",
      });

      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.");
      setErrors({
        general: error.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Progress indicator
  const getProgressWidth = () => {
    // Adjusted for a 3-step process (0%, 50%, 100%)
    return `${((step - 1) / 2) * 100}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex min-h-screen">
        {/* Main Container */}
        <div className="w-full flex">
          {/* Left Side - Forms */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800">
            <div className="w-full max-w-md">
              {/* Logo/Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="filter brightness-0 invert"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  إنشاء حساب جديد
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  انضم إلى منصة التعلم الإلكتروني
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    الخطوة {step} من 3
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {Math.round(((step - 1) / 2) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: getProgressWidth() }}
                  ></div>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between mt-3">
                  {[1, 2, 3].map((stepNum) => (
                    <div key={stepNum} className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                          stepNum <= step
                            ? "bg-green-600 dark:bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {stepNum <= step ? (
                          <Icon
                            icon="material-symbols:check"
                            className="w-3 h-3"
                          />
                        ) : (
                          stepNum
                        )}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {stepNum === 1 && "تليجرام"}
                        {stepNum === 2 && "شخصي"}
                        {stepNum === 3 && "أمان"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Telegram Authentication */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Icon icon="logos:telegram" className="text-2xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        التحقق من تليجرام
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                        ابدأ بالتحقق من هويتك باستخدام تليجرام
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

              {/* Step 2: Personal Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                      <Icon
                        icon="material-symbols:person"
                        className="w-6 h-6 text-white"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      المعلومات الشخصية
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      أدخل بياناتك الشخصية الأساسية
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      icon="material-symbols:person"
                      placeholder="الاسم الكامل (مثل: أحمد محمد علي)"
                      value={formData.fullName}
                      onChange={handleInputChange("fullName")}
                      error={errors.fullName}
                      dir="rtl"
                      type="text"
                    />

                    <Input
                      icon="material-symbols:phone-android"
                      placeholder="رقم الهاتف (مثل: 01012345678)"
                      value={formData.phoneNumber}
                      onChange={handleInputChange("phoneNumber")}
                      error={errors.phoneNumber}
                      dir="rtl"
                      type="tel"
                    />

                    <Select
                      icon="material-symbols:person"
                      placeholder="اختر النوع"
                      options={genderOptions}
                      value={formData.gender}
                      onChange={handleInputChange("gender")}
                      error={errors.gender}
                      dir="rtl"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handlePrevious}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-1 py-3 px-4 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center font-medium"
                    >
                      <Icon
                        icon="material-symbols:arrow-forward"
                        className="w-4 h-4 ml-2"
                      />
                      التالي
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Security Information */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-3 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center">
                      <Icon
                        icon="material-symbols:security"
                        className="w-6 h-6 text-white"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      معلومات الأمان
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      اختر بريد إلكتروني وكلمة مرور قوية
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      icon="material-symbols:mail"
                      placeholder="البريد الإلكتروني (مثل: ahmed@example.com)"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      error={errors.email}
                      dir="rtl"
                      type="email"
                    />

                    <Input
                      icon="material-symbols:lock"
                      placeholder="كلمة المرور (8 أحرف على الأقل)"
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      error={errors.password}
                      dir="rtl"
                      type="password"
                    />

                    <Input
                      icon="material-symbols:lock-open"
                      placeholder="تأكيد كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={handleInputChange("confirmPassword")}
                      error={errors.confirmPassword}
                      dir="rtl"
                      type="password"
                    />
                  </div>

                  {errors.general && (
                    <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                      <Icon
                        icon="material-symbols:error"
                        className="w-4 h-4 mx-auto mb-1"
                      />
                      {errors.general}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handlePrevious}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                          جاري التسجيل...
                        </>
                      ) : (
                        <>
                          <Icon
                            icon="material-symbols:person-add"
                            className="w-4 h-4 ml-2"
                          />
                          إنشاء الحساب
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terms and Privacy */}
                  <div className="text-center bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      بإنشاء حساب، أنت توافق على{" "}
                      <a
                        href="#"
                        className="text-green-600 hover:text-green-700 font-medium underline"
                      >
                        الشروط والأحكام
                      </a>{" "}
                      و{" "}
                      <a
                        href="#"
                        className="text-green-600 hover:text-green-700 font-medium underline"
                      >
                        سياسة الخصوصية
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Telegram Data Display */}
              {telegramData && step > 1 && (
                <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
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
                  <div className="text-center mt-2">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✅ تم التحقق من حساب تليجرام بنجاح
                    </p>
                  </div>
                </div>
              )}

              {/* Login Link */}
              <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  لديك حساب بالفعل؟
                </p>

                <div className="flex flex-col gap-2 items-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-green-600 dark:text-green-400 font-medium transition-colors text-sm"
                  >
                    <Icon icon="material-symbols:login" className="w-4 h-4" />
                    تسجيل الدخول
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
          <div className="hidden lg:flex lg:w-1/2 bg-green-600 dark:bg-green-700 items-center justify-center p-8">
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
              <h1 className="text-4xl font-bold mb-6">انضم إلى عائلتنا!</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
