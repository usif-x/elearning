"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLogoutPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Simulate logout delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Clear auth state
        logout();

        // Redirect to login page
        router.push("/admin/login");
      } catch (error) {
        console.error("Logout error:", error);
        // Still redirect even if there's an error
        router.push("/admin/login");
      } finally {
        setIsLoggingOut(false);
      }
    };

    handleLogout();
  }, [logout, router]);

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          {isLoggingOut ? (
            <div className="animate-spin">
              <Icon
                icon="solar:logout-2-bold"
                className="w-12 h-12 text-red-600 dark:text-red-400"
              />
            </div>
          ) : (
            <Icon
              icon="solar:check-circle-bold"
              className="w-12 h-12 text-green-600 dark:text-green-400"
            />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isLoggingOut ? "جاري تسجيل الخروج..." : "تم تسجيل الخروج بنجاح"}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isLoggingOut
            ? "يرجى الانتظار قليلاً"
            : "سيتم تحويلك إلى صفحة تسجيل الدخول"}
        </p>

        {!isLoggingOut && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
            <span>التحويل التلقائي...</span>
          </div>
        )}
      </div>
    </div>
  );
}
