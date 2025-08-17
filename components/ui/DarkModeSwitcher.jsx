"use client";
import "@/styles/darkmode.css";
import { useEffect, useState } from "react";
export default function DarkModeSwitcher() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage on initial load
    const savedTheme = localStorage.getItem("theme");
    const html = document.documentElement;

    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      html.classList.add("dark");
      setIsDarkMode(true);
    } else {
      html.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;

    if (html.classList.contains("dark")) {
      // Switch to light mode
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      // Switch to dark mode
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <div id="darkModeContainer" dir="ltr">
      <button
        className={`dark-mode-btn relative inline-flex items-center py-1.5 px-2 rounded-full smooth duration-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus:outline-none focus-visible:ring-slate-500 cursor-pointer ${
          isDarkMode ? "dark" : ""
        }`}
        role="switch"
        tabIndex="0"
        aria-checked={isDarkMode.toString()}
        onClick={toggleDarkMode}
      >
        <span className="sr-only">Toggle dark mode</span>

        {/* Sun Icon */}
        <svg
          width="24"
          height="24"
          fill="none"
          aria-hidden="true"
          className={`transform transition-transform duration-500 ${
            isDarkMode ? "scale-100" : "scale-0"
          }`}
          style={{ color: "var(--icon-sun)" }}
        >
          <path
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 4v1M18 6l-1 1M20 12h-1M18 18l-1-1M12 19v1M7 17l-1 1M5 12H4M7 7 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          width="24"
          height="24"
          fill="none"
          aria-hidden="true"
          className={`ml-3.5 transform transition-transform duration-500 ${
            !isDarkMode ? "scale-100" : "scale-0"
          }`}
          style={{ color: "var(--icon-sun)" }}
        >
          <path
            d="M18 15.63c-.977.52-1.945.481-3.13.481A6.981 6.981 0 0 1 7.89 9.13c0-1.185-.04-2.153.481-3.13C6.166 7.174 5 9.347 5 12.018A6.981 6.981 0 0 0 11.982 19c2.67 0 4.844-1.166 6.018-3.37ZM16 5c0 2.08-.96 4-3 4 2.04 0 3 .92 3 3 0-2.08.96-3 3-3-2.04 0-3-1.92-3-4Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Moving Circle */}
        <span
          className={`absolute top-0.5 left-0.5 w-8 h-8 rounded-full flex items-center justify-center transition duration-500 transform ${
            isDarkMode ? "translate-x-[2.625rem]" : "translate-x-0"
          }`}
          style={{ backgroundColor: "var(--slider-bg)" }}
        >
          {/* Sun Icon Inside Circle */}
          <svg
            width="24"
            height="24"
            fill="none"
            aria-hidden="true"
            className={`flex-none transition duration-500 transform ${
              !isDarkMode ? "opacity-100 scale-100" : "opacity-0 scale-0"
            }`}
            style={{ color: "var(--icon-inner-sun)" }}
          >
            <path
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 4v1M18 6l-1 1M20 12h-1M18 18l-1-1M12 19v1M7 17l-1 1M5 12H4M7 7 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Moon Icon Inside Circle */}
          <svg
            width="24"
            height="24"
            fill="none"
            aria-hidden="true"
            className={`flex-none -ml-6 transition duration-500 transform ${
              isDarkMode ? "opacity-100 scale-100" : "opacity-0 scale-0"
            }`}
            style={{ color: "var(--icon-inner-moon)" }}
          >
            <path
              d="M18 15.63c-.977.52-1.945.481-3.13.481A6.981 6.981 0 0 1 7.89 9.13c0-1.185-.04-2.153.481-3.13C6.166 7.174 5 9.347 5 12.018A6.981 6.981 0 0 0 11.982 19c2.67 0 4.844-1.166 6.018-3.37ZM16 5c0 2.08-.96 4-3 4 2.04 0 3 .92 3 3 0-2.08.96-3 3-3-2.04 0-3-1.92-3-4Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}
