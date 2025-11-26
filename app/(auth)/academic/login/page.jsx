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

export default function AcademicLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    academicId: "",
    password: "",
  });

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = async () => {
    setErrors({});
    setIsLoading(true);

    try {
      if (!formData.academicId) {
        setErrors({ academicId: "يرجى إدخال الهوية الأكاديمية" });
        setIsLoading(false);
        return;
      }
      if (!formData.password) {
        setErrors({ password: "يرجى إدخال كلمة المرور" });
        setIsLoading(false);
        return;
      }

      const res = await postData("/auth/academic/login", {
        academic_id: formData.academicId,
        password: formData.password,
        remember_me: rememberMe,
      });

      if (!res) throw new Error("لم يتم استلام استجابة من الخادم");
      if (res.error) throw new Error(res.error);

      const token = res.access_token || res.token;
      const refresh = res.refresh_token || null;
      const userObj = res.user || res.user_data || null;

      if (token) {
        await Swal.fire({
          icon: "success",
          title: "تم تسجيل الدخول بنجاح!",
          text: res.message || "مرحباً بك",
          showConfirmButton: false,
          timer: 1500,
        });
        login({ user: userObj, token: token, refresh_token: refresh });
        router.push("/profile");
      } else {
        throw new Error("فشل في تسجيل الدخول. لم يتم استلام رمز وصول.");
      }
    } catch (err) {
      console.error("Academic login error:", err);
      setErrors({ general: err.message || "فشل تسجيل الدخول" });
      toast.error(err.message || "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex min-h-screen">
        {/* Main Container */}
        <div className="w-full flex">
          {/* Left Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800">
            <div className="w-full max-w-md">
              {/* Logo/Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Icon
                    icon="material-symbols:school"
                    className="w-8 h-8 text-white"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  تسجيل الدخول الأكاديمي
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  ادخل الهوية الأكاديمية وكلمة المرور للمتابعة
                </p>
              </div>

              {/* Login Form */}
              <div className="space-y-5">
                {/* Welcome Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <Icon
                        icon="material-symbols:badge"
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        مرحباً بك مجدداً
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        استخدم بيانات اعتمادك الأكاديمية
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input Fields */}
                <Input
                  icon="material-symbols:badge"
                  placeholder="كود الطالب"
                  value={formData.academicId}
                  onChange={handleInputChange("academicId")}
                  onKeyPress={handleKeyPress}
                  error={errors.academicId}
                  dir="rtl"
                />

                <Input
                  icon="material-symbols:lock"
                  placeholder="كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  onKeyPress={handleKeyPress}
                  error={errors.password}
                  dir="rtl"
                  type="password"
                />

                {/* General Error */}
                {errors.general && (
                  <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                    <Icon
                      icon="material-symbols:error"
                      className="w-4 h-4 mx-auto mb-1"
                    />
                    {errors.general}
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      تذكرني
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <Icon icon="material-symbols:login" className="w-6 h-6" />
                      تسجيل الدخول
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      أو
                    </span>
                  </div>
                </div>

                {/* Alternative Options */}
                <div className="space-y-3">
                  <Link
                    href="/academic/register"
                    className="w-full py-4 px-6 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium flex items-center justify-center gap-2 text-lg"
                  >
                    <Icon
                      icon="material-symbols:person-add"
                      className="w-6 h-6"
                    />
                    إنشاء حساب أكاديمي جديد
                  </Link>

                  <Link
                    href="/auth/login"
                    className="w-full py-4 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium flex items-center justify-center gap-2 text-lg"
                  >
                    <Icon icon="logos:telegram" className="w-6 h-6" />
                    تسجيل الدخول بتليجرام
                  </Link>
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors text-sm"
                >
                  <Icon
                    icon="material-symbols:arrow-back"
                    className="w-4 h-4"
                  />
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Info Panel */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 items-center justify-center p-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="text-center text-white max-w-md relative z-10">
              <div className="w-20 h-20 mx-auto mb-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon icon="material-symbols:school" className="w-12 h-12" />
              </div>

              <h1 className="text-4xl font-bold mb-4">
                مرحباً بك في النظام الأكاديمي
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                الوصول السريع والآمن لجميع الموارد التعليمية
              </p>

              {/* Features */}
              <div className="space-y-4 text-right">
                <div className="flex items-start gap-3 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold mb-1">وصول فوري</h3>
                    <p className="text-sm text-blue-100">
                      دخول سريع باستخدام كود الطالب الخاص بك
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold mb-1">محتوى شامل</h3>
                    <p className="text-sm text-blue-100">
                      الوصول إلى جميع الدورات والمواد الدراسية
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold mb-1">تتبع متقدم</h3>
                    <p className="text-sm text-blue-100">
                      راقب تقدمك الأكاديمي ونتائجك بسهولة
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold mb-1">آمن ومحمي</h3>
                    <p className="text-sm text-blue-100">
                      بياناتك محمية بأعلى معايير الأمان
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white border-opacity-20">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">500+</div>
                  <div className="text-sm text-blue-100">طالب نشط</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">50+</div>
                  <div className="text-sm text-blue-100">دورة متاحة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-blue-100">دعم فني</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
