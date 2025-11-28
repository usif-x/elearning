"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { postData } from "@/libs/axios";
import { useEffect, useRef } from "react";

const SessionTracker = () => {
  const { isAuthenticated, userType } = useAuthStore();
  const isStartedRef = useRef(false);

  useEffect(() => {
    // 1. FIX: Stricter Check
    // Stop if not logged in OR if userType is not 'user'
    // (Adjust this if you want to track admins too)
    if (!isAuthenticated || userType !== "user") return;

    // 2. FIX: Set interval to 1 minute (60000ms)
    // This ensures smoother data and avoids backend timeouts
    const PING_INTERVAL_MS = 60 * 1000;

    const startSession = async () => {
      try {
        if (isStartedRef.current) return;
        isStartedRef.current = true;
        await postData("/usage/start", {}, true);
        console.log("✅ Session started");
      } catch (error) {
        console.error("❌ Failed to start session:", error);
      }
    };

    const pingSession = async () => {
      try {
        // 3. OPTIONAL: Remove visibility check if you want to track background usage
        // If you keep this, the ping WON'T send when you switch tabs.
        // if (document.visibilityState === "visible") {
        await postData("/usage/ping", {}, true);
        console.log("📡 Session pinged");
        // }
      } catch (error) {
        console.error("❌ Failed to ping session:", error);
      }
    };

    // --- Execution ---
    startSession();

    const intervalId = setInterval(pingSession, PING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      isStartedRef.current = false;
    };
  }, [isAuthenticated, userType]); // Added userType to dependencies

  return null;
};

export default SessionTracker;
