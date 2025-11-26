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

export default function UnifiedRegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  // State: 'selection' | 'telegram' | 'academic'
  const [method, setMethod] = useState("selection");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Telegram Specific State
  const [telegramData, setTelegramData] = useState(null);
  const [telegramHash, setTelegramHash] = useState(null);

  // Unified Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "", // For Telegram flow
    academicId: "", // For Academic flow
    password: "",
    confirmPassword: "",
  });

  // --- Telegram Widget Loader ---
  useEffect(() => {
    if (method === "telegram" && step === 1) {
      // Small timeout to ensure DOM element exists
      const timer = setTimeout(() => {
        if (!document.getElementById("telegram-login-script")) {
          const script = document.createElement("script");
          script.id = "telegram-login-script";
          script.async = true;
          script.src = "https://telegram.org/js/telegram-widget.js?22";
          script.setAttribute("data-telegram-login", "DahhehetMedicalBot"); // Ensure this matches your bot name
          script.setAttribute("data-size", "large");
          script.setAttribute("data-onauth", "onTelegramAuth(user)");
          script.setAttribute("data-request-access", "write");

          const widgetContainer = document.getElementById("telegram-widget");
          if (widgetContainer) {
            widgetContainer.innerHTML = ""; // Clear previous if any
            widgetContainer.appendChild(script);
          }
        }
      }, 100);

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

        setTelegramData(authData);

        try {
          const data = await postData("/auth/telegram/verify", {
            telegram_auth: authData,
          });

          if (data.error) {
            toast.error(data.error || "خطأ في التحقق من تليجرام");
            return;
          }
          if (data.next_step === "register") {
            setTelegramHash(data.telegram_hash);
            setStep(2); // Move to Personal Info
          } else if (data.next_step === "login") {
            toast.info("لديك حساب بالفعل. تسجيل الدخول الآن.");
            router.push("/login");
          }
        } catch (err) {
          console.error(err);
          toast.error("خطأ في الاتصال بالخادم");
        }
      };

      return () => clearTimeout(timer);
    }

    // Cleanup global function on unmount
    return () => {
      // delete window.onTelegramAuth; // Optional: keep it if re-rendering causes issues
    };
  }, [method, step, router]);

  // --- Validation Helpers ---
  const validatePhoneNumber = (phone) =>
    /^(?:\+20|0)(10|11|12|15)\d{8}$/.test(phone?.replace(/\s+/g, ""));
  const validateFullName = (name) =>
    name && name.length >= 3 && /^[a-zA-Zأ-ي\s]+$/.test(name);
  const validatePassword = (pass) => pass && pass.length >= 8;

  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // --- Logic Control ---
  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(1);
    setErrors({});
  };

  const handleBackToSelection = () => {
    setMethod("selection");
    setStep(1);
    setFormData({ ...formData, password: "", confirmPassword: "" }); // Reset sensitive data
    setErrors({});
  };

  // --- Step Validation ---
  const validateCurrentStep = () => {
    const newErrors = {};

    if (method === "telegram") {
      // Telegram Steps: 1(Widget), 2(Name+Phone), 3(Password)
      if (step === 2) {
        if (!validateFullName(formData.fullName))
          newErrors.fullName = "الاسم يجب أن يكون 3 أحرف على الأقل";
        if (!validatePhoneNumber(formData.phoneNumber))
          newErrors.phoneNumber = "رقم الهاتف غير صحيح";
      } else if (step === 3) {
        if (!validatePassword(formData.password))
          newErrors.password = "كلمة المرور قصيرة جداً";
        if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "كلمات المرور غير متطابقة";
      }
    } else if (method === "academic") {
      // Academic Steps: 1(Name+ID), 2(Password)
      if (step === 1) {
        if (!validateFullName(formData.fullName))
          newErrors.fullName = "الاسم يجب أن يكون 3 أحرف على الأقل";
        if (!formData.academicId)
          newErrors.academicId = "رقم الهوية الأكاديمي مطلوب";
      } else if (step === 2) {
        if (!validatePassword(formData.password))
          newErrors.password = "كلمة المرور قصيرة جداً";
        if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "كلمات المرور غير متطابقة";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) setStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (step === 1) {
      handleBackToSelection();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  // --- Submission ---
  const handleRegister = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setErrors({});

    let endpoint = "";
    let payload = {};

    if (method === "telegram") {
      endpoint = "/auth/register"; // Your standard register endpoint
      payload = {
        telegram_hash: telegramHash,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };
    } else if (method === "academic") {
      endpoint = "/auth/academic/register"; // Your academic endpoint
      payload = {
        full_name: formData.fullName,
        academic_id: formData.academicId,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: "student",
      };
    }

    try {
      const res = await postData(endpoint, payload);

      if (res.error) {
        if (typeof res.error === "object") {
          setErrors(res.error);
          toast.error("يرجى مراجعة البيانات.");
        } else {
          throw new Error(res.error);
        }
        return;
      }

      login({
        user: res.user,
        token: res.access_token,
        refresh_token: res.refresh_token,
      });

      await Swal.fire({
        icon: "success",
        title: "تم التسجيل بنجاح!",
        text: "مرحباً بك في المنصة.",
        confirmButtonText: "بدء التعلم",
      });

      router.push("/profile"); // Or dashboard
    } catch (err) {
      console.error(err);
      toast.error(err.message || "فشل التسجيل");
      setErrors({ general: err.message || "فشل التسجيل" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper for Progress Bar ---
  const getMaxSteps = () => (method === "telegram" ? 3 : 2);
  const getProgressWidth = () => `${((step - 1) / (getMaxSteps() - 1)) * 100}%`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex min-h-screen">
        {/* Left Side - Forms Area */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800 transition-all duration-500">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="filter brightness-0 invert"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {method === "selection"
                  ? "إنشاء حساب جديد"
                  : method === "telegram"
                  ? "تسجيل عبر تليجرام"
                  : "تسجيل طالب أكاديمي"}
              </h1>
              {method === "selection" && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  اختر الطريقة المناسبة لك للتسجيل في المنصة
                </p>
              )}
            </div>

            {/* --- VIEW 1: Selection Boxes --- */}
            {method === "selection" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Telegram Box */}
                <button
                  onClick={() => handleMethodSelect("telegram")}
                  className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-sky-500 dark:hover:border-sky-500 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all group text-right flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                    <Icon icon="logos:telegram" className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      التسجيل عبر تليجرام
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      للمستخدمين العامين، التحقق السريع عبر حساب تليجرام
                    </p>
                  </div>
                </button>

                {/* Academic Box */}
                <button
                  onClick={() => handleMethodSelect("academic")}
                  className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group text-right flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                    <Icon icon="material-symbols:school" className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-green-600 dark:group-hover:text-green-400">
                      التسجيل الأكاديمي
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      لطلاب الكلية، باستخدام كود الطالب (Academic ID)
                    </p>
                  </div>
                </button>

                <div className="text-center pt-6">
                  <p className="text-sm text-gray-500">
                    لديك حساب بالفعل؟{" "}
                    <Link
                      href="/login"
                      className="text-green-600 font-bold hover:underline"
                    >
                      تسجيل الدخول
                    </Link>
                    <br />
                    <hr />
                    <br />
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 px-4 py-2 rounded-lg text-green-600 dark:text-green-400 font-medium transition-colors text-sm"
                    >
                      <Icon icon="material-symbols:home" className="w-4 h-4" />
                      العودة للرئيسية
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* --- VIEW 2: Registration Forms (Telegram OR Academic) --- */}
            {method !== "selection" && (
              <div className="animate-slideInUp">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">
                      الخطوة {step} من {getMaxSteps()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: getProgressWidth() }}
                    ></div>
                  </div>
                </div>

                {/* --- TELEGRAM FLOW CONTENT --- */}
                {method === "telegram" && (
                  <div className="space-y-6">
                    {/* Step 1: Widget */}
                    {step === 1 && (
                      <div className="text-center bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">
                          التحقق من الهوية
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                          يرجى الضغط أدناه للمتابعة باستخدام تليجرام
                        </p>
                        <div
                          id="telegram-widget"
                          className="flex justify-center min-h-[50px]"
                        ></div>
                      </div>
                    )}

                    {/* Step 2: Personal Data (Tel) */}
                    {step === 2 && (
                      <div className="space-y-4">
                        {telegramData && (
                          <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-lg mb-4">
                            <img
                              src={
                                telegramData.photo_url ||
                                "/images/avatar-placeholder.png"
                              }
                              alt="User"
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="text-right">
                              <p className="text-sm font-bold text-sky-800 dark:text-sky-300">
                                {telegramData.first_name}
                              </p>
                              <p className="text-xs text-sky-600 dark:text-sky-400">
                                @{telegramData.username}
                              </p>
                            </div>
                          </div>
                        )}
                        <Input
                          icon="material-symbols:person"
                          placeholder="الاسم الكامل"
                          value={formData.fullName}
                          onChange={handleInputChange("fullName")}
                          error={errors.fullName}
                          dir="rtl"
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
                      </div>
                    )}

                    {/* Step 3: Password (Tel) */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <Input
                          icon="material-symbols:lock"
                          placeholder="كلمة المرور ) 8 أحرف على الأقل("
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
                    )}
                  </div>
                )}

                {/* --- ACADEMIC FLOW CONTENT --- */}
                {method === "academic" && (
                  <div className="space-y-6">
                    {/* Step 1: Academic Data */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <Input
                          icon="material-symbols:person"
                          placeholder="الاسم الكامل"
                          value={formData.fullName}
                          onChange={handleInputChange("fullName")}
                          error={errors.fullName}
                          dir="rtl"
                        />
                        <Input
                          icon="material-symbols:badge"
                          placeholder="كود الطالب"
                          value={formData.academicId}
                          onChange={handleInputChange("academicId")}
                          error={errors.academicId}
                          dir="rtl"
                        />
                      </div>
                    )}

                    {/* Step 2: Password (Academic) */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg mb-4">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600">
                            <Icon icon="material-symbols:person" />
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-800 dark:text-green-300">
                              {formData.fullName}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              ID: {formData.academicId}
                            </p>
                          </div>
                        </div>
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
                    )}
                  </div>
                )}

                {/* --- SHARED BUTTONS --- */}
                <div className="flex gap-3 pt-8">
                  <button
                    onClick={handlePrevious}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                  >
                    رجوع
                  </button>

                  {/* Logic for Next/Submit Button */}
                  {step < getMaxSteps() ? (
                    // Hide "Next" button on Telegram Step 1 because the Widget handles the action
                    method === "telegram" && step === 1 ? null : (
                      <button
                        onClick={handleNext}
                        className="flex-1 py-3 px-4 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 font-medium flex items-center justify-center"
                      >
                        التالي{" "}
                        <Icon
                          icon="material-symbols:arrow-back"
                          className="mr-2 rotate-180"
                        />
                      </button>
                    )
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 font-medium flex items-center justify-center disabled:opacity-50"
                    >
                      {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
                    </button>
                  )}
                </div>

                {errors.general && (
                  <div className="mt-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
                    {errors.general}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Info (Static/Dynamic based on method) */}
        <div
          className={`hidden lg:flex lg:w-1/2 items-center justify-center p-8 transition-colors duration-500 ${
            method === "telegram"
              ? "bg-sky-600 dark:bg-sky-800"
              : "bg-green-600 dark:bg-green-800"
          }`}
        >
          <div className="text-center text-white max-w-md animate-fadeIn">
            <div className="w-24 h-24 mx-auto mb-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Icon
                icon={
                  method === "telegram"
                    ? "logos:telegram"
                    : "material-symbols:school"
                }
                className={`w-12 h-12 ${
                  method === "telegram" ? "grayscale-0" : "text-white"
                }`}
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {method === "selection"
                ? "مرحباً بك مجدداً!"
                : method === "telegram"
                ? "مجتمع تليجرام"
                : "التميز الأكاديمي"}
            </h1>
            <p className="text-lg opacity-90">
              {method === "selection"
                ? "انضم إلى منصتنا التعليمية المتطورة. اختر الطريقة التي تناسبك للبدء."
                : method === "telegram"
                ? "استفد من سرعة التسجيل والمزامنة المباشرة مع بوت تليجرام الخاص بنا."
                : "سجل ببياناتك الجامعية للوصول إلى المحتوى الأكاديمي المخصص لك."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
