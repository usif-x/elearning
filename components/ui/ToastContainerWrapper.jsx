"use client";
import { useTheme } from "@/context/ThemeProvider";
import { ToastContainer } from "react-toastify";

export function ToastContainerWrapper() {
  const { isDarkMode } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={true}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDarkMode ? "dark" : "light"} // ✅ يتزامن مع السويتشر
    />
  );
}
