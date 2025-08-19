"use client";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Main Register Component
export default function TelegramRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [telegramData, setTelegramData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    parentPhoneNumber: "",
    government: "",
    gender: "",
    level: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Government options for Egypt
  const governments = [
    { value: "cairo", label: "القاهرة" },
    { value: "alexandria", label: "الإسكندرية" },
    { value: "giza", label: "الجيزة" },
    { value: "aswan", label: "أسوان" },
    { value: "asyut", label: "أسيوط" },
    { value: "beheira", label: "البحيرة" },
    { value: "beni_suef", label: "بني سويف" },
    { value: "dakahlia", label: "الدقهلية" },
    { value: "damietta", label: "دمياط" },
    { value: "fayyum", label: "الفيوم" },
    { value: "gharbia", label: "الغربية" },
    { value: "ismailia", label: "الإسماعيلية" },
    { value: "kafr_el_sheikh", label: "كفر الشيخ" },
    { value: "luxor", label: "الأقصر" },
    { value: "matrouh", label: "مطروح" },
    { value: "minya", label: "المنيا" },
    { value: "monufia", label: "المنوفية" },
    { value: "new_valley", label: "الوادي الجديد" },
    { value: "north_sinai", label: "شمال سيناء" },
    { value: "port_said", label: "بورسعيد" },
    { value: "qalyubia", label: "القليوبية" },
    { value: "qena", label: "قنا" },
    { value: "red_sea", label: "البحر الأحمر" },
    { value: "sharqia", label: "الشرقية" },
    { value: "sohag", label: "سوهاج" },
    { value: "south_sinai", label: "جنوب سيناء" },
    { value: "suez", label: "السويس" },
  ];

  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ];

  const levelOptions = [
    { value: "grade_1", label: "الصف الأول الثانوي" },
    { value: "grade_2", label: "الصف الثاني الثانوي" },
    { value: "grade_3", label: "الصف الثالث الثانوي" },
  ];

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
          console.error("Telegram verification error:", data);
          toast.error(data.detail || "خطأ في التحقق من تليجرام");
          setErrors((prev) => ({ ...prev, telegram: data.message }));
          return;
        }
        if (data.next_step === "register") {
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
  }, [step]);

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
        if (!validatePhoneNumber(formData.parentPhoneNumber)) {
          newErrors.parentPhoneNumber = "يرجى إدخال رقم هاتف ولي الأمر";
        }
        break;

      case 3:
        if (!formData.government) {
          newErrors.government = "يرجى اختيار المحافظة";
        }
        if (!formData.gender) {
          newErrors.gender = "يرجى اختيار النوع";
        }
        if (!formData.level) {
          newErrors.level = "يرجى اختيار المرحلة الدراسية";
        }
        break;

      case 4:
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
    if (!validateStep(4)) return;

    setIsLoading(true);

    try {
      const registrationData = {
        telegram_id: telegramData?.id,
        telegram_username: telegramData?.username,
        telegram_hash: telegramData?.hash,
        auth_date: telegramData?.auth_date,
        first_name: telegramData?.first_name,
        last_name: telegramData?.last_name,
        ...formData,
      };

      console.log("Registration data:", registrationData);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("تم التسجيل بنجاح!");

      // Reset form for demo
      setStep(1);
      setTelegramData(null);
      setFormData({
        fullName: "",
        phoneNumber: "",
        parentPhoneNumber: "",
        government: "",
        gender: "",
        level: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: "فشل التسجيل. يرجى المحاولة مرة أخرى." });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Telegram authentication for demo
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

  // Progress indicator
  const getProgressWidth = () => {
    return `${(step / 4) * 100}%`;
  };

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors smooth"
      dir="rtl"
    >
      <div className="flex min-h-screen">
        {/* Image Section */}
        <div className="hidden lg:block lg:w-1/2">
          <img
            src="/images/register.png"
            alt="Login"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Registration Content */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <div className="w-full max-w-md">
            {/* Logo/Header */}
            <div className="text-center mb-8 flex flex-col items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                إنشاء حساب جديد
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200">
                انضم إلى منصة التعلم الإلكتروني
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  الخطوة {step} من 4
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((step / 4) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: getProgressWidth() }}
                ></div>
              </div>
            </div>

            {/* Step 1: Telegram Authentication */}
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

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    المعلومات الشخصية
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    أدخل بياناتك الشخصية
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    icon="material-symbols:person"
                    placeholder="الاسم الكامل"
                    value={formData.fullName}
                    onChange={handleInputChange("fullName")}
                    error={errors.fullName}
                    dir="rtl"
                    type="text"
                  />

                  <Input
                    icon="material-symbols:phone-android"
                    placeholder="رقم الهاتف"
                    value={formData.phoneNumber}
                    onChange={handleInputChange("phoneNumber")}
                    error={errors.phoneNumber}
                    dir="rtl"
                    type="tel"
                  />

                  <Input
                    icon="material-symbols:family-restroom"
                    placeholder="رقم هاتف ولي الأمر"
                    value={formData.parentPhoneNumber}
                    onChange={handleInputChange("parentPhoneNumber")}
                    error={errors.parentPhoneNumber}
                    dir="rtl"
                    type="tel"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handlePrevious}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Location and Academic Info */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    المعلومات الأكاديمية
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    اختر محافظتك ومستواك الدراسي
                  </p>
                </div>

                <div className="space-y-4">
                  <Select
                    icon="material-symbols:location-on"
                    placeholder="المحافظة"
                    options={governments}
                    value={formData.government}
                    onChange={handleInputChange("government")}
                    error={errors.government}
                    dir="rtl"
                  />

                  <Select
                    icon="material-symbols:person"
                    placeholder="النوع"
                    options={genderOptions}
                    value={formData.gender}
                    onChange={handleInputChange("gender")}
                    error={errors.gender}
                    dir="rtl"
                  />

                  <Select
                    icon="material-symbols:school"
                    placeholder="المرحلة الدراسية"
                    options={levelOptions}
                    value={formData.level}
                    onChange={handleInputChange("level")}
                    error={errors.level}
                    dir="rtl"
                  />
                </div>

                {/* Show validation errors if any */}
                {(errors.government || errors.gender || errors.level) && (
                  <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {errors.government || errors.gender || errors.level}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handlePrevious}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Security Information */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    معلومات الأمان
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    اختر كلمة مرور قوية لحسابك
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    icon="material-symbols:mail"
                    placeholder="البريد الإلكتروني"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    error={errors.email}
                    dir="rtl"
                    type="email"
                  />

                  <Input
                    icon="material-symbols:lock"
                    placeholder="كلمة المرور"
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
                  <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {errors.general}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                        جاري التسجيل...
                      </>
                    ) : (
                      "إنشاء الحساب"
                    )}
                  </button>
                </div>

                {/* Terms and Privacy */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    بإنشاء حساب، أنت توافق على{" "}
                    <a href="#" className="text-blue-500 hover:text-blue-600">
                      الشروط والأحكام
                    </a>{" "}
                    و{" "}
                    <a href="#" className="text-blue-500 hover:text-blue-600">
                      سياسة الخصوصية
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Telegram Data Display (for demo) */}
            {telegramData && step > 1 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center text-green-700 dark:text-green-400">
                  <Icon icon="logos:telegram" className="ml-2" />
                  <span className="text-sm font-medium">
                    مرحباً {telegramData.first_name} {telegramData.last_name}
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  تم التحقق من حساب تليجرام بنجاح
                </p>
              </div>
            )}

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                لديك حساب بالفعل؟{" "}
                <Link
                  href="/login"
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
