"use client";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/hooks/useAuth";
import { postData } from "@/libs/axios";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function AcademicRegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    academicId: "",
    password: "",
    confirmPassword: "",
  });

  const validateFullName = (name) => {
    return name && name.length >= 3;
  };

  const validatePassword = (password) => {
    return password && password.length >= 8;
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    switch (stepNumber) {
      case 1:
        if (!validateFullName(formData.fullName)) {
          newErrors.fullName = "يرجى إدخال اسم صالح (3 أحرف على الأقل)";
        }
        if (!formData.academicId) {
          newErrors.academicId = "يرجى إدخال رقم الهوية الأكاديمي";
        }
        break;

      case 2:
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

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleRegister = async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    setErrors({});

    try {
      const payload = {
        full_name: formData.fullName,
        academic_id: formData.academicId,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: "student",
      };

      const res = await postData("/auth/academic/register", payload);

      if (!res) throw new Error("لم يتم استلام استجابة من الخادم");
      if (res.error) {
        if (typeof res.error === "object") {
          setErrors(res.error);
          toast.error("يرجى مراجعة الحقول المدخلة.");
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
        title: "تم إنشاء الحساب بنجاح!",
        text: res.message || "تم التسجيل.",
        confirmButtonText: "حسناً",
      });

      router.push("/profile");
    } catch (err) {
      console.error("Academic registration error:", err);
      toast.error(err.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.");
      setErrors({ general: err.message || "فشل التسجيل" });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressWidth = () => {
    return `${((step - 1) / 1) * 100}%`;
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
                <div className="w-16 h-16 mx-auto mb-4 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Icon
                    icon="material-symbols:school"
                    className="w-8 h-8 text-white"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  تسجيل أكاديمي جديد
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  سجل باستخدام رقم الهوية الأكاديمي
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    الخطوة {step} من 2
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {Math.round(((step - 1) / 1) * 100)}%
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
                  {[1, 2].map((stepNum) => (
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
                        {stepNum === 1 && "بيانات أكاديمية"}
                        {stepNum === 2 && "أمان"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Academic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                      <Icon
                        icon="material-symbols:badge"
                        className="w-6 h-6 text-white"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      البيانات الأكاديمية
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      أدخل معلوماتك الأكاديمية
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

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleNext}
                      className="w-full py-4 px-6 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center font-medium text-lg"
                    >
                      <Icon
                        icon="material-symbols:arrow-forward"
                        className="w-5 h-5 ml-2"
                      />
                      التالي
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Security Information */}
              {step === 2 && (
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
                      اختر كلمة مرور قوية
                    </p>
                  </div>

                  <div className="space-y-4">
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
                      className="flex-1 py-4 px-6 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="flex-1 py-4 px-6 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium text-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                          جاري التسجيل...
                        </>
                      ) : (
                        <>
                          <Icon
                            icon="material-symbols:person-add"
                            className="w-5 h-5 ml-2"
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

              {/* Academic Data Display */}
              {step === 2 && formData.fullName && formData.academicId && (
                <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                      <Icon
                        icon="material-symbols:person"
                        className="w-5 h-5 text-white"
                      />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                        {formData.fullName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        كود: {formData.academicId}
                      </p>
                    </div>
                    <Icon
                      icon="material-symbols:check-circle"
                      className="w-5 h-5 text-green-500 dark:text-green-400"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✅ البيانات الأكاديمية صحيحة
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
                    href="/academic/login"
                    className="inline-flex items-center text-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-green-600 dark:text-green-400 font-medium transition-colors text-sm"
                  >
                    <Icon icon="material-symbols:login" className="w-4 h-4" />
                    تسجيل الدخول الأكاديمي
                  </Link>

                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sky-500 dark:text-sky-400 font-medium transition-colors text-sm"
                  >
                    <Icon icon="logos:telegram" className="w-4 h-4" />
                    تسجيل الدخول بتليجرام
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
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 dark:from-green-700 dark:to-green-900 items-center justify-center p-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="text-center text-white max-w-md relative z-10">
              <div className="w-20 h-20 mx-auto mb-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon icon="material-symbols:school" className="w-12 h-12" />
              </div>

              <h1 className="text-4xl font-bold mb-4">انضم كطالب أكاديمي!</h1>
              <p className="text-lg text-green-100 mb-8">
                سجل باستخدام معلوماتك الأكاديمية للوصول إلى المنصة التعليمية
              </p>

              {/* Features */}
              <div className="space-y-4 text-right">
                <div className="flex items-start gap-3 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold mb-1">وصول سريع</h3>
                    <p className="text-sm text-green-100">
                      استخدم كود الطالب الخاص بك للتسجيل
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold mb-1">محتوى أكاديمي</h3>
                    <p className="text-sm text-green-100">
                      الوصول إلى جميع الدورات والمواد
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold mb-1">تتبع التقدم</h3>
                    <p className="text-sm text-green-100">
                      راقب تقدمك ونتائجك بسهولة
                    </p>
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
