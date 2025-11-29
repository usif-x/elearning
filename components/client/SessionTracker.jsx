"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { postData } from "@/libs/axios";
import { useEffect, useRef } from "react";

const SessionTracker = () => {
  const { isAuthenticated, userType } = useAuthStore();
  const isStartedRef = useRef(false);
  const intervalIdRef = useRef(null);
  const lastPingRef = useRef(0);

  useEffect(() => {
    // Only track regular users, not admins
    if (!isAuthenticated || userType !== "user") {
      // Clean up if user logs out or changes type
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        isStartedRef.current = false;
      }
      return;
    }

    const PING_INTERVAL_MS = 70 * 1000; // 70 seconds

    const startSession = async () => {
      try {
        if (isStartedRef.current) return;
        isStartedRef.current = true;

        await postData("/usage/start", {}, true);
        lastPingRef.current = Date.now();
        console.log("✅ Session started");
      } catch (error) {
        console.error("❌ Failed to start session:", error);
        isStartedRef.current = false; // Reset on error so it can retry
      }
    };

    const pingSession = async () => {
      try {
        // Prevent duplicate pings (extra safety layer)
        const now = Date.now();
        const timeSinceLastPing = now - lastPingRef.current;

        // If less than 60 seconds since last ping, skip (safety check)
        if (timeSinceLastPing < 60000) {
          console.log("⏭️ Skipping ping (too soon)");
          return;
        }

        await postData("/usage/ping", {}, true);
        lastPingRef.current = now;
        console.log("📡 Session pinged");
      } catch (error) {
        console.error("❌ Failed to ping session:", error);
        // Don't throw - let it retry on next interval
      }
    };

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isStartedRef.current) {
        // User came back to tab - send immediate ping
        const timeSinceLastPing = Date.now() - lastPingRef.current;

        // Only ping if it's been more than 60 seconds
        if (timeSinceLastPing > 60000) {
          console.log("👁️ Tab visible again - pinging");
          pingSession();
        }
      }
    };

    // Handle page unload (user closing tab/browser)
    const handleBeforeUnload = () => {
      // Send final ping (best effort - may not always work)
      if (isStartedRef.current && navigator.sendBeacon) {
        // Use sendBeacon for reliability during page unload
        const blob = new Blob([JSON.stringify({})], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/usage/ping", blob);
      }
    };

    // Start session immediately
    startSession();

    // Set up ping interval
    intervalIdRef.current = setInterval(pingSession, PING_INTERVAL_MS);

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      isStartedRef.current = false;
    };
  }, [isAuthenticated, userType]);

  return null;
};

export default SessionTracker;
