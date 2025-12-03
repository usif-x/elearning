"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { postData } from "@/libs/axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";

const TokenValidator = () => {
  const { isAuthenticated, token, logout } = useAuthStore();
  const router = useRouter();
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    // Only validate once when component mounts
    if (!isAuthenticated || !token || hasValidatedRef.current) {
      return;
    }

    const validateToken = async () => {
      try {
        hasValidatedRef.current = true;

        const response = await postData(
          "/auth/check-token",
          { token },
          false // Don't use auth header since we're validating the token itself
        );

        // If token is invalid, show alert and logout
        if (!response.valid) {
          await Swal.fire({
            icon: "warning",
            title: "انتهت الجلسة",
            text: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.",
            confirmButtonText: "تسجيل الدخول",
            confirmButtonColor: "#3085d6",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });

          // Clear auth storage and redirect to login
          logout();
          router.push("/login");
        } else {
          console.log("✅ Token is valid");
        }
      } catch (error) {
        console.error("❌ Token validation failed:", error);

        // On error, also logout and redirect
        await Swal.fire({
          icon: "error",
          title: "انتهت الجلسة",
          text: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.",
          confirmButtonText: "تسجيل الدخول",
          confirmButtonColor: "#3085d6",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        logout();
        router.push("/login");
      }
    };

    validateToken();
  }, [isAuthenticated, token, logout, router]);

  return null;
};

export default TokenValidator;
