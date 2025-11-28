"use client";

import { useAuthStore } from "@/hooks/useAuth"; // Assuming you have this
import { postData } from "@/libs/axios"; // Your axios helper
import { useEffect, useRef } from "react";

const SessionTracker = () => {
  const { isAuthenticated } = useAuthStore();
  const isStartedRef = useRef(false);

  useEffect(() => {
    // 1. Only run if user is logged in
    if (!isAuthenticated) return;

    const PING_INTERVAL_MS = 3 * 60 * 1000; // 3 Minutes

    // Function to start the session
    const startSession = async () => {
      try {
        // Prevent double-firing in React Strict Mode dev
        if (isStartedRef.current) return;
        isStartedRef.current = true;

        await postData("/usage/start", {}, true); // auth=true
        console.log("Session started");
      } catch (error) {
        console.error("Failed to start session:", error);
      }
    };

    // Function to ping
    const pingSession = async () => {
      try {
        // Optional: Check if tab is visible before pinging?
        if (document.visibilityState === "visible") {
          await postData("/usage/ping", {}, true);
          console.log("Session pinged");
        }
      } catch (error) {
        console.error("Failed to ping session:", error);
      }
    };

    // --- Execution ---

    // Call Start immediately on mount
    startSession();

    // Set up the Interval for Pings
    const intervalId = setInterval(pingSession, PING_INTERVAL_MS);

    // Cleanup: Clear interval when user leaves/logs out
    return () => {
      clearInterval(intervalId);
      isStartedRef.current = false;
    };
  }, [isAuthenticated]);

  // This component renders nothing, it just runs logic
  return null;
};

export default SessionTracker;
