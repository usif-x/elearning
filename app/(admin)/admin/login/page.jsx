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

// Admin Login Component
export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صالح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const loginData = {
        username_or_email: formData.email,
        password: formData.password,
        remember_me: formData.rememberMe,
      };

      const loginResponse = await postData("/auth/admin/login", loginData);

      if (loginResponse.error) {
        throw new Error(loginResponse.error);
      }

      Swal.fire({
        icon: "success",
        title: "تم تسجيل الدخول بنجاح!",
        text: "مرحباً بك في لوحة التحكم",
        showConfirmButton: false,
        timer: 1500,
      });

      adminLogin({
        admin: loginResponse.user,
        token: loginResponse.access_token,
        refresh_token: loginResponse.refresh_token,
      });

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);

      let errorMessage = "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.";

      if (error.message.includes("Invalid credentials")) {
        errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      } else if (error.message.includes("Account not found")) {
        errorMessage = "لا يوجد حساب إداري بهذا البريد الإلكتروني";
      } else if (error.message.includes("Access denied")) {
        errorMessage = "ليس لديك صلاحيات للوصول لهذه المنطقة";
      }

      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex min-h-screen">
        {/* Main Container */}
        <div className="w-full flex">
          {/* Left Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="filter brightness-0 invert"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  تسجيل دخول الإداريين
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  دخول إلى لوحة التحكم الإدارية
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    <Input
                      icon="material-symbols:admin-panel-settings"
                      placeholder="البريد الإلكتروني او اسم المستخدم"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      error={errors.email}
                      dir="rtl"
                      type="email"
                      required
                    />

                    <Input
                      icon="material-symbols:lock"
                      placeholder="كلمة المرور"
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      error={errors.password}
                      dir="rtl"
                      type="password"
                      required
                    />

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={handleInputChange("rememberMe")}
                          className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
                        />
                        تذكرني
                      </label>
                    </div>
                  </div>
                </div>

                {/* General Error Display */}
                {errors.general && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                      <Icon icon="material-symbols:error" className="w-5 h-5" />
                      <span className="text-sm">{errors.general}</span>
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-red-600 dark:bg-red-500 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري تسجيل الدخول...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Icon icon="material-symbols:login" className="w-4 h-4" />
                      <span>تسجيل الدخول</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Back to Main Site */}
              <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  العودة إلى الموقع الرئيسي
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 font-medium transition-colors text-sm"
                >
                  <Icon icon="material-symbols:home" className="w-4 h-4" />
                  الصفحة الرئيسية
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Info */}
          <div className="hidden lg:flex lg:w-1/2 bg-red-600 dark:bg-red-700 items-center justify-center p-8">
            <div className="text-center text-white max-w-md">
              <div className="w-20 h-20 mx-auto mb-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Icon
                  icon="material-symbols:admin-panel-settings"
                  className="w-12 h-12 text-white"
                />
              </div>
              <h1 className="text-4xl font-bold mb-6">لوحة التحكم الإدارية</h1>
              <p className="text-red-100 text-lg leading-relaxed mb-8">
                إدارة شاملة للمنصة التعليمية مع أدوات متقدمة لمتابعة الطلاب
                والمحتوى
              </p>

              {/* Admin Features */}
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Icon
                      icon="material-symbols:people"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">إدارة المستخدمين</p>
                    <p className="text-red-100 text-sm">
                      متابعة وإدارة حسابات الطلاب والمعلمين
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Icon
                      icon="material-symbols:analytics"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      التقارير والإحصائيات
                    </p>
                    <p className="text-red-100 text-sm">
                      تحليلات شاملة لأداء المنصة
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Icon
                      icon="material-symbols:school"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">إدارة المحتوى</p>
                    <p className="text-red-100 text-sm">
                      إضافة وتعديل الدورات والمواد التعليمية
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Icon
                      icon="material-symbols:settings"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">إعدادات النظام</p>
                    <p className="text-red-100 text-sm">
                      تخصيص وضبط إعدادات المنصة
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 bg-white bg-opacity-10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    icon="material-symbols:security"
                    className="w-5 h-5 text-white"
                  />
                  <p className="font-semibold text-white text-sm">منطقة آمنة</p>
                </div>
                <p className="text-red-100 text-xs">
                  هذه منطقة إدارية محمية. يتم تسجيل جميع العمليات ومراقبتها
                  لضمان الأمان.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
