"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Register the service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered successfully:",
            registration.scope
          );

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New service worker is ready
                toast.info(
                  <div dir="rtl">
                    <strong>تحديث جديد متاح!</strong>
                    <p className="text-sm mt-1">
                      انقر لإعادة تحميل الصفحة والحصول على آخر التحديثات
                    </p>
                  </div>,
                  {
                    position: "bottom-right",
                    autoClose: false,
                    closeOnClick: false,
                    onClick: () => {
                      newWorker.postMessage({ type: "SKIP_WAITING" });
                      window.location.reload();
                    },
                    style: { cursor: "pointer" },
                  }
                );
              }
            });
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Handle controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("New Service Worker activated");
      });

      // Listen for online/offline events
      window.addEventListener("online", () => {
        toast.success("تم استعادة الاتصال بالإنترنت! 🎉", {
          position: "bottom-center",
          autoClose: 3000,
        });
      });

      window.addEventListener("offline", () => {
        toast.warning("لا يوجد اتصال بالإنترنت ⚠️", {
          position: "bottom-center",
          autoClose: false,
        });
      });
    }
  }, []);

  return null;
}
