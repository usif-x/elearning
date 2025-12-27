"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { getData } from "@/libs/axios"; // Ensure this path is correct
import { getSearchAutocomplete } from "@/services/Courses";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import DarkModeSwitcher from "../ui/DarkModeSwitcher";
import Input from "../ui/Input";

const Navbar = ({ children }) => {
  // --- UI States ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScroll, setIsScroll] = useState(false);

  // --- Search States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // --- Notification States ---
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [hasNewNotifs, setHasNewNotifs] = useState(false);
  const [notifSkip, setNotifSkip] = useState(0);
  const [hasMoreNotifs, setHasMoreNotifs] = useState(true);
  const notifDropdownRef = useRef(null);

  // --- Hooks ---
  const { isAuthenticated, user, userType } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // ----------------------------------------------------------------
  // 1. Notification Logic
  // ----------------------------------------------------------------

  // Fetch Notifications
  const fetchNotifications = async (reset = false) => {
    try {
      setNotifLoading(true);
      const limit = 5;
      const skip = reset ? 0 : notifSkip;

      // Endpoint: GET /notifications/user?skip=0&limit=5
      const data = await getData(
        `/notifications/user?skip=${skip}&limit=${limit}`,
        true
      );

      if (Array.isArray(data)) {
        if (reset) {
          setNotifications(data);
          setNotifSkip(limit);
          checkNewNotifications(data);
        } else {
          setNotifications((prev) => [...prev, ...data]);
          setNotifSkip((prev) => prev + limit);
        }

        // If we got fewer items than the limit, we reached the end
        if (data.length < limit) setHasMoreNotifs(false);
        else setHasMoreNotifs(true);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setNotifLoading(false);
    }
  };

  // Check if there is a new ID compared to LocalStorage
  const checkNewNotifications = (currentNotifs) => {
    if (!currentNotifs || currentNotifs.length === 0) return;

    const lastSeenId = localStorage.getItem("lastSeenNotificationId");
    // Assuming API returns newest first, so index 0 is the latest ID
    const latestNotifId = currentNotifs[0].id;

    if (!lastSeenId || latestNotifId > parseInt(lastSeenId)) {
      setHasNewNotifs(true);
    } else {
      setHasNewNotifs(false);
    }
  };

  // Toggle Dropdown & Mark as Read locally
  const toggleNotifications = () => {
    const newState = !isNotifOpen;
    setIsNotifOpen(newState);

    if (newState && notifications.length > 0) {
      // User opened dropdown, save the latest ID
      const latestId = notifications[0].id;
      localStorage.setItem("lastSeenNotificationId", latestId.toString());
      setHasNewNotifs(false); // Stop animation
    }
  };

  // Load More Handler
  const handleLoadMoreNotifs = (e) => {
    e.stopPropagation();
    fetchNotifications(false);
  };

  // Initial Fetch on Login
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(true);
    }
  }, [isAuthenticated]);

  // Click Outside to Close Notification Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format Date Helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    // If less than 24 hours, show time
    if (diff < 86400000) {
      return date.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // Else show date
    return date.toLocaleDateString("ar-EG");
  };

  // ----------------------------------------------------------------
  // 2. Search & Scroll Logic
  // ----------------------------------------------------------------

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery("");
      setAutocompleteSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setIsCoursesDropdownOpen(false);
  };
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Scroll Progress Logic
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      if (scrollHeight - clientHeight === 0) {
        setScrollProgress(100);
        setIsScroll(false);
        return;
      }
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
      setIsScroll(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const progressCircleStyle = {
    background: `conic-gradient(#3b82f6 ${scrollProgress * 3.6}deg, #e5e7eb ${
      scrollProgress * 3.6
    }deg)`,
  };

  // Search Autocomplete
  const getAutocompleteSuggestions = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }
    try {
      const suggestions = await getSearchAutocomplete(query, 8);
      setAutocompleteSuggestions(suggestions);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setAutocompleteSuggestions([]);
    }
  }, []);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    if (searchTimeout) clearTimeout(searchTimeout);
    const newTimeout = setTimeout(() => {
      getAutocompleteSuggestions(value);
    }, 300);
    setSearchTimeout(newTimeout);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(
        `/courses/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      setIsSearchOpen(false);
      setSearchQuery("");
      setAutocompleteSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setAutocompleteSuggestions([]);
    router.push(`/courses/search?q=${encodeURIComponent(suggestion)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // ----------------------------------------------------------------
  // 3. Layout Helpers
  // ----------------------------------------------------------------
  const shouldShowExpanded = !isSidebarCollapsed || isHovering;

  const handleMouseEnter = () => {
    if (isSidebarCollapsed) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (isSidebarCollapsed) {
      setIsHovering(false);
      setIsCoursesDropdownOpen(false);
    }
  };

  const getMainContentMarginClass = () => {
    if (!isAuthenticated) return "";
    if (isSidebarCollapsed) return "lg:mr-20";
    return "lg:mr-80";
  };

  const isProfileDropdownActive = () => pathname.startsWith("/profile");
  const isCoursesDropdownActive = () => pathname.startsWith("/courses");
  const isCommunityActive = () => pathname.startsWith("/community");

  const getVerificationBadge = () => {
    return user?.is_verified ? (
      <Icon
        icon="solar:verified-check-bold"
        className="w-4 h-4 text-green-500"
        title="حساب موثق"
      />
    ) : (
      <Icon
        icon="solar:verified-close-bold"
        className="w-4 h-4 text-red-500"
        title="حساب غير موثق"
      />
    );
  };

  const getTelegramVerificationBadge = () => {
    return user?.telegram_verified ? (
      <Icon
        icon="solar:verified-check-bold"
        className="w-4 h-4 text-blue-500"
        title="حساب تليجرام موثق"
      />
    ) : null;
  };

  // ----------------------------------------------------------------
  // 4. Render
  // ----------------------------------------------------------------
  return (
    <div dir="rtl">
      {/* --- Navbar (Fixed Position) --- */}
      <nav
        className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 smooth fixed top-0 left-0 right-0 z-30
          ${
            isAuthenticated
              ? "border-b"
              : "w-[95%] m-auto mt-4 rounded-lg overflow-hidden"
          }`}
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between">
            {/* === DESKTOP NAVBAR === */}

            {/* Right: Logo & Dark Mode */}
            <div className="hidden lg:flex items-center gap-4">
              <div
                style={isAuthenticated && isScroll ? progressCircleStyle : {}}
                className="w-12 h-12 rounded-full p-0.5 flex items-center justify-center transition-all duration-300"
                title={`Page scrolled: ${Math.round(scrollProgress)}%`}
              >
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center p-1">
                  <Link href="/">
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </Link>
                </div>
              </div>
              <DarkModeSwitcher />
            </div>

            {/* Left: Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Search Button */}
                  <button
                    onClick={toggleSearch}
                    className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
                  >
                    <Icon
                      icon="solar:magnifer-bold-duotone"
                      className="w-5 h-5"
                    />
                  </button>

                  {/* Notification Button (Desktop) */}
                  <div className="relative" ref={notifDropdownRef}>
                    <button
                      onClick={toggleNotifications}
                      className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center relative"
                    >
                      <Icon
                        icon="solar:bell-bold-duotone"
                        className="w-6 h-6"
                      />

                      {/* Pump Circle Animation */}
                      {hasNewNotifs && (
                        <span className="absolute top-2 right-2 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown Panel */}
                    {isNotifOpen && (
                      <div className="absolute top-full left-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in origin-top-left">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                          <h3 className="font-bold text-gray-800 dark:text-white">
                            الإشعارات
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchNotifications(true);
                            }}
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <Icon icon="solar:refresh-bold" /> تحديث
                          </button>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto">
                          {notifications.length === 0 && !notifLoading ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                              <Icon
                                icon="solar:bell-off-bold-duotone"
                                className="w-12 h-12 mx-auto mb-2 opacity-50"
                              />
                              <p>لا توجد إشعارات حالياً</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                              {notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-3"
                                >
                                  <div
                                    className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                      notif.type === "error"
                                        ? "bg-red-500"
                                        : notif.type === "success"
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                                    }`}
                                  ></div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                                      {notif.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                                      {notif.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                      {formatDate(notif.created_at)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Loading State */}
                          {notifLoading && (
                            <div className="p-4 text-center">
                              <Icon
                                icon="solar:loading-bold-duotone"
                                className="w-6 h-6 animate-spin text-blue-500 mx-auto"
                              />
                            </div>
                          )}

                          {/* Load More Button */}
                          {!notifLoading &&
                            hasMoreNotifs &&
                            notifications.length > 0 && (
                              <button
                                onClick={handleLoadMoreNotifs}
                                className="w-full py-3 text-sm text-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium border-t border-gray-100 dark:border-gray-700 transition-colors"
                              >
                                عرض المزيد
                              </button>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href={"/login"}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth font-medium border border-gray-200 dark:border-gray-700"
                  >
                    <Icon icon="solar:login-3-bold" className="w-4 h-4" />
                    تسجيل الدخول
                  </Link>
                  <Link
                    href={"/register"}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white hover:bg-blue-600 rounded-xl smooth font-medium"
                  >
                    <Icon icon="solar:user-plus-bold" className="w-4 h-4" />
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>

            {/* === MOBILE NAVBAR === */}
            <div
              className={`lg:hidden flex items-center justify-between w-full`}
            >
              {/* Left Side: Actions */}
              <div className="flex-1 flex justify-start items-center gap-1">
                {isAuthenticated && (
                  <>
                    <button
                      onClick={toggleSearch}
                      className="w-10 h-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
                    >
                      <Icon
                        icon="solar:magnifer-bold-duotone"
                        className="w-5 h-5"
                      />
                    </button>

                    {/* Mobile Notification Button */}
                    <div className="relative" ref={notifDropdownRef}>
                      <button
                        onClick={toggleNotifications}
                        className="w-10 h-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center relative"
                      >
                        <Icon
                          icon="solar:bell-bold-duotone"
                          className="w-5 h-5"
                        />
                        {hasNewNotifs && (
                          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                          </span>
                        )}
                      </button>

                      {/* Mobile Notification Dropdown */}
                      {isNotifOpen && (
                        <div className="absolute top-full right-[-60px] xs:right-0 mt-2 w-[85vw] max-w-[320px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
                          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                            <h3 className="font-bold text-gray-800 dark:text-white text-sm">
                              الإشعارات
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchNotifications(true);
                              }}
                              className="text-xs text-blue-500"
                            >
                              تحديث
                            </button>
                          </div>
                          <div className="max-h-[50vh] overflow-y-auto">
                            {notifications.length === 0 && !notifLoading ? (
                              <div className="p-6 text-center text-gray-500">
                                <p className="text-sm">لا توجد إشعارات</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map((notif) => (
                                  <div
                                    key={notif.id}
                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex gap-3 text-right"
                                  >
                                    <div
                                      className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        notif.type === "error"
                                          ? "bg-red-500"
                                          : "bg-blue-500"
                                      }`}
                                    ></div>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {notif.title}
                                      </h4>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 my-1">
                                        {notif.message}
                                      </p>
                                      <span className="text-[10px] text-gray-400">
                                        {formatDate(notif.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!notifLoading && hasMoreNotifs && (
                              <button
                                onClick={handleLoadMoreNotifs}
                                className="w-full py-3 text-sm text-blue-600 border-t border-gray-100 dark:border-gray-700"
                              >
                                عرض المزيد
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {/* Mobile Profile Photo Button */}
                {isAuthenticated ? (
                  <button
                    onClick={toggleMobileMenu}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 hover:border-blue-600 smooth flex items-center justify-center relative"
                  >
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Icon
                          icon="solar:user-bold"
                          className="w-5 h-5 text-white"
                        />
                      </div>
                    )}
                    {hasNewNotifs && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={toggleMobileMenu}
                    className="w-10 h-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
                  >
                    <Icon
                      icon="solar:hamburger-menu-bold"
                      className="w-5 h-5"
                    />
                  </button>
                )}
              </div>

              {/* Center: Logo */}
              <div className="flex-shrink-0">
                <div
                  style={isAuthenticated && isScroll ? progressCircleStyle : {}}
                  className="w-12 h-12 rounded-full p-0.5 flex items-center justify-center transition-all duration-150"
                  title={`Page scrolled: ${Math.round(scrollProgress)}%`}
                >
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center p-1">
                    <Link href="/">
                      <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Side: Dark Mode */}
              <div className="flex-1 flex justify-end">
                <DarkModeSwitcher />
              </div>
            </div>
          </div>
          {/* === MOBILE MENU (Sliding Sidebar) === */}
          {/* Backdrop/Overlay */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
              isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sliding Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-2xl z-50 lg:hidden overflow-y-auto transition-all duration-300 ease-out ${
              isMobileMenuOpen
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            {/* Close Button */}
            <div className="sticky top-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-10">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 smooth flex items-center justify-center ml-auto"
              >
                <Icon
                  icon="solar:close-circle-bold"
                  className="w-6 h-6 text-gray-600 dark:text-gray-400"
                />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {isAuthenticated ? (
                <>
                  {/* User Profile Card */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-5 py-6 rounded-2xl shadow-lg mb-6 transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-3 border-white/30 flex items-center justify-center ring-4 ring-blue-400/30">
                        {user?.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon
                            icon="solar:user-bold"
                            className="w-8 h-8 text-white"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-white text-base truncate">
                            أهلاً {user?.display_name || user?.full_name}
                          </p>
                          {getVerificationBadge()}
                        </div>

                        {user?.phone_number && (
                          <p className="text-sm text-blue-100 flex items-center gap-1">
                            <Icon
                              icon="solar:phone-bold"
                              className="w-3.5 h-3.5"
                            />
                            {user.phone_number}
                          </p>
                        )}

                        {user?.telegram_username && (
                          <div className="flex items-center gap-1 mt-1">
                            <Icon
                              icon="bxl:telegram"
                              className="w-4 h-4 text-blue-100"
                            />
                            <p className="text-sm text-blue-100 truncate">
                              @{user.telegram_username}
                            </p>
                            {getTelegramVerificationBadge()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links with Animation */}
                  <div className="space-y-1.5">
                    {/* Home Link */}
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                        pathname === "/"
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          pathname === "/"
                            ? "bg-white/20"
                            : "bg-blue-100 dark:bg-blue-900/30"
                        }`}
                      >
                        <Icon
                          icon="solar:home-bold-duotone"
                          className={`w-5 h-5 ${
                            pathname === "/"
                              ? "text-white"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      </div>
                      <span className="font-semibold">الصفحة الرئيسية</span>
                    </Link>

                    {userType === "admin" ? (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <Icon
                            icon="solar:shield-user-bold"
                            className="w-5 h-5 text-white"
                          />
                        </div>
                        <span className="font-semibold">لوحة الإدارة</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                            isProfileDropdownActive()
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                              : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isProfileDropdownActive()
                                ? "bg-white/20"
                                : "bg-blue-100 dark:bg-blue-900/30"
                            }`}
                          >
                            <Icon
                              icon="solar:user-circle-bold-duotone"
                              className={`w-5 h-5 ${
                                isProfileDropdownActive()
                                  ? "text-white"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            />
                          </div>
                          <span className="font-semibold">حسابي</span>
                        </Link>
                      </>
                    )}

                    <Link
                      href="/practice-quiz"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                        pathname === "/practice-quiz"
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon
                        icon="solar:clipboard-list-bold"
                        className="w-5 h-5"
                      />
                      <span>اختبارات تدريبية</span>
                    </Link>

                    <Link
                      href="/questions-forum"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                        pathname === "/questions-forum"
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          pathname === "/questions-forum"
                            ? "bg-white/20"
                            : "bg-green-100 dark:bg-green-900/30"
                        }`}
                      >
                        <Icon
                          icon="solar:chat-square-like-bold-duotone"
                          className={`w-5 h-5 ${
                            pathname === "/questions-forum"
                              ? "text-white"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        />
                      </div>
                      <span className="font-semibold">منتدى الأسئلة</span>
                    </Link>

                    <Link
                      href="/community"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                        isCommunityActive()
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCommunityActive()
                            ? "bg-white/20"
                            : "bg-cyan-100 dark:bg-cyan-900/30"
                        }`}
                      >
                        <Icon
                          icon="solar:users-group-rounded-bold-duotone"
                          className={`w-5 h-5 ${
                            isCommunityActive()
                              ? "text-white"
                              : "text-cyan-600 dark:text-cyan-400"
                          }`}
                        />
                      </div>
                      <span className="font-semibold">منتدى الطلاب</span>
                    </Link>

                    <Link
                      href="/courses"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                        isCoursesDropdownActive()
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCoursesDropdownActive()
                            ? "bg-white/20"
                            : "bg-orange-100 dark:bg-orange-900/30"
                        }`}
                      >
                        <Icon
                          icon="solar:book-bookmark-bold-duotone"
                          className={`w-5 h-5 ${
                            isCoursesDropdownActive()
                              ? "text-white"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        />
                      </div>
                      <span className="font-semibold">كورساتي</span>
                    </Link>

                    <Link
                      href="/teaching-session"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                        pathname === "/teaching-session"
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          pathname === "/teaching-session"
                            ? "bg-white/20"
                            : "bg-indigo-100 dark:bg-indigo-900/30"
                        }`}
                      >
                        <Icon
                          icon="solar:chat-round-dots-bold-duotone"
                          className={`w-5 h-5 ${
                            pathname === "/teaching-session"
                              ? "text-white"
                              : "text-indigo-600 dark:text-indigo-400"
                          }`}
                        />
                      </div>
                      <span className="font-semibold">جلسة تعليمية</span>
                    </Link>

                    <Link
                      href="/ai-explain"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                        pathname === "/ai-explain"
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          pathname === "/ai-explain"
                            ? "bg-white/20"
                            : "bg-pink-100 dark:bg-pink-900/30"
                        }`}
                      >
                        <Icon
                          icon="solar:stars-bold-duotone"
                          className={`w-5 h-5 ${
                            pathname === "/ai-explain"
                              ? "text-white"
                              : "text-pink-600 dark:text-pink-400"
                          }`}
                        />
                      </div>
                      <span className="font-semibold">شرح محتوى AI</span>
                    </Link>

                    <Link
                      href="/pdf-question-file"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                        pathname === "/pdf-question-file"
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          pathname === "/pdf-question-file"
                            ? "bg-white/20"
                            : "bg-teal-100 dark:bg-teal-900/30"
                        }`}
                      >
                        <Icon
                          icon="solar:document-add-bold-duotone"
                          className={`w-5 h-5 ${
                            pathname === "/pdf-question-file"
                              ? "text-white"
                              : "text-teal-600 dark:text-teal-400"
                          }`}
                        />
                      </div>
                      <span className="font-semibold">مولد اختبارات PDF</span>
                    </Link>

                    <Link
                      href="/practice-quiz"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] ${
                        pathname === "/practice-quiz"
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          pathname === "/practice-quiz"
                            ? "bg-white/20"
                            : "bg-purple-100 dark:bg-purple-900/30"
                        }`}
                      >
                        <Icon
                          icon="solar:clipboard-list-bold-duotone"
                          className={`w-5 h-5 ${
                            pathname === "/practice-quiz"
                              ? "text-white"
                              : "text-purple-600 dark:text-purple-400"
                          }`}
                        />
                      </div>
                      <span className="font-semibold">اختبارات تدريبية</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href="/logout"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 w-full p-3.5 rounded-xl smooth transform transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-rose-600"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon
                          icon="solar:logout-2-bold-duotone"
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <span className="font-semibold">تسجيل خروج</span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-3 pt-10">
                  <div className="text-center mb-6">
                    <Icon
                      icon="solar:user-circle-bold-duotone"
                      className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600 mb-3"
                    />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                      مرحباً بك
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      سجل دخولك للوصول لجميع الميزات
                    </p>
                  </div>

                  <Link
                    href={"/login"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 w-full p-4 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl smooth font-semibold border-2 border-blue-200 dark:border-blue-800 transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Icon
                      icon="solar:login-3-bold-duotone"
                      className="w-5 h-5"
                    />
                    تسجيل الدخول
                  </Link>
                  <Link
                    href={"/register"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl smooth font-semibold shadow-lg shadow-blue-500/30 transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Icon
                      icon="solar:user-plus-bold-duotone"
                      className="w-5 h-5"
                    />
                    إنشاء حساب جديد
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        {!isAuthenticated && (
          <div
            dir="ltr"
            className={`
      absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50
      transition-all duration-300 ease-out
      transform
      ${isScroll ? "translate-y-0" : "translate-y-full"}
    `}
          >
            <div
              className="h-1 bg-blue-500 transition-colors duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        )}
      </nav>

      {/* --- Sidebar (Fixed Position) --- */}
      {isAuthenticated && (
        <div
          className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 overflow-hidden transition-all smooth
              ${isSidebarCollapsed && !isHovering ? "lg:w-20" : "lg:w-80"}
              ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
              lg:top-20 lg:h-[calc(100vh-5rem)] w-80 lg:translate-x-0
            `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              {shouldShowExpanded && (
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  لوحة التنقل
                </h2>
              )}
              <button
                onClick={toggleSidebarCollapse}
                className="w-10 h-10 text-gray-600 dark:text-gray-400 bg-gray-300 dark:bg-gray-800 rounded-xl smooth hidden lg:flex items-center justify-center"
              >
                <Icon
                  icon={
                    isSidebarCollapsed
                      ? "ion:lock-open"
                      : "famicons:lock-closed"
                  }
                  className="w-5 h-5"
                />
              </button>
              <button
                onClick={toggleSidebar}
                className="w-10 h-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex lg:hidden items-center justify-center"
              >
                <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar User Info */}
            {shouldShowExpanded &&
            userType !== "admin" &&
            userType === "user" ? (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                  {user?.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon
                      icon="solar:user-bold"
                      className="w-6 h-6 text-white"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                      {user?.display_name || user?.full_name}
                    </p>

                    {user?.phone_number && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        • {user.phone_number}
                      </p>
                    )}

                    {user?.status && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        {user.status === "student" ? "طالب" : user.status}
                      </span>
                    )}

                    {getVerificationBadge()}
                  </div>

                  {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  )}

                  {user?.telegram_username && (
                    <div className="flex items-center gap-1 mt-1">
                      <Icon
                        icon="bxl:telegram"
                        className="w-4 h-4 text-blue-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{user.telegram_username}
                      </p>
                      {getTelegramVerificationBadge()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                  {user?.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon
                      icon="solar:user-bold"
                      className="w-5 h-5 text-white"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Links */}
          <div className="p-4 space-y-2 overflow-y-auto h-full pb-32">
            {userType === "admin" ? (
              <Link
                href="/admin/dashboard"
                className={`flex items-center w-full p-3 rounded-xl smooth ${
                  !shouldShowExpanded ? "justify-center" : "gap-3"
                } ${
                  pathname.startsWith("/admin")
                    ? "bg-red-500 text-white"
                    : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700"
                }`}
                title={!shouldShowExpanded ? "لوحة الإدارة" : ""}
              >
                <Icon icon="solar:shield-user-bold" className="w-6 h-6" />
                {shouldShowExpanded && (
                  <span className="font-medium">لوحة الإدارة</span>
                )}
              </Link>
            ) : (
              <Link
                href="/profile"
                className={`flex items-center w-full p-3 rounded-xl smooth ${
                  !shouldShowExpanded ? "justify-center" : "gap-3"
                } ${
                  isProfileDropdownActive()
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={!shouldShowExpanded ? "ملفي الشخصي" : ""}
              >
                <Icon icon="solar:user-circle-bold" className="w-6 h-6" />
                {shouldShowExpanded && (
                  <span className="font-medium">ملفي الشخصي</span>
                )}
              </Link>
            )}

            <Link
              href="/practice-quiz"
              className={`flex items-center w-full p-3 rounded-xl smooth ${
                !shouldShowExpanded ? "justify-center" : "gap-3"
              } ${
                pathname === "/practice-quiz"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={!shouldShowExpanded ? "اختبارات تدريبية" : ""}
            >
              <Icon icon="solar:clipboard-list-bold" className="w-6 h-6" />
              {shouldShowExpanded && (
                <span className="font-medium">اختبارات تدريبية</span>
              )}
            </Link>

            <Link
              href="/questions-forum"
              className={`flex items-center w-full p-3 rounded-xl smooth ${
                !shouldShowExpanded ? "justify-center" : "gap-3"
              } ${
                pathname === "/questions-forum"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={!shouldShowExpanded ? "منتدي الأسئلة" : ""}
            >
              <Icon icon="mdi:frequently-asked-questions" className="w-6 h-6" />
              {shouldShowExpanded && (
                <span className="font-medium">منتدي الأسئلة</span>
              )}
            </Link>

            <Link
              href="/pdf-question-file"
              className={`flex items-center w-full p-3 rounded-xl smooth ${
                !shouldShowExpanded ? "justify-center" : "gap-3"
              } ${
                pathname === "/pdf-question-file"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={!shouldShowExpanded ? "مولد الاختبارات PDF" : ""}
            >
              <Icon icon="solar:document-add-bold" className="w-6 h-6" />
              {shouldShowExpanded && (
                <span className="font-medium">مولد الاختبارات PDF</span>
              )}
            </Link>

            <Link
              href="/teaching-session"
              className={`flex items-center w-full p-3 rounded-xl smooth ${
                !shouldShowExpanded ? "justify-center" : "gap-3"
              } ${
                pathname === "/teaching-session"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={!shouldShowExpanded ? "جلسة تعليمية" : ""}
            >
              <Icon icon="solar:chat-round-dots-bold" className="w-6 h-6" />
              {shouldShowExpanded && (
                <span className="font-medium">جلسة تعليمية</span>
              )}
            </Link>

            <Link
              href="/ai-explain"
              className={`flex items-center w-full p-3 rounded-xl smooth ${
                !shouldShowExpanded ? "justify-center" : "gap-3"
              } ${
                pathname === "/ai-explain"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={!shouldShowExpanded ? "شرح محتوى " : ""}
            >
              <Icon icon="ri:book-ai-fill" className="w-6 h-6" />
              {shouldShowExpanded && (
                <span className="font-medium">شرح محتوى </span>
              )}
            </Link>

            <Link
              href="/community"
              className={`flex items-center w-full p-3 rounded-xl smooth ${
                !shouldShowExpanded ? "justify-center" : "gap-3"
              } ${
                pathname === "/community"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={!shouldShowExpanded ? "منتدى الطلاب" : ""}
            >
              <Icon icon="solar:users-group-rounded-bold" className="w-6 h-6" />
              {shouldShowExpanded && (
                <span className="font-medium">منتدى الطلاب</span>
              )}
            </Link>

            <div
              className={`${
                isCoursesDropdownOpen && isCoursesDropdownActive()
                  ? "bg-blue-500/15 dark:bg-blue-900/50"
                  : ""
              } rounded-xl p-1`}
            >
              <button
                onClick={() => {
                  if (shouldShowExpanded)
                    setIsCoursesDropdownOpen(!isCoursesDropdownOpen);
                }}
                className={`flex items-center justify-between w-full p-3 rounded-xl smooth ${
                  !shouldShowExpanded ? "justify-center" : ""
                } ${
                  isCoursesDropdownActive()
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={!shouldShowExpanded ? "الكورسات" : ""}
              >
                <div
                  className={`flex items-center ${
                    shouldShowExpanded ? "gap-3" : ""
                  }`}
                >
                  <Icon icon="solar:book-bookmark-bold" className="w-6 h-6" />
                  {shouldShowExpanded && (
                    <span className="font-medium">الكورسات</span>
                  )}
                </div>
                {shouldShowExpanded && (
                  <Icon
                    icon="solar:alt-arrow-down-bold"
                    className={`w-4 h-4 smooth ${
                      isCoursesDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {isCoursesDropdownOpen && shouldShowExpanded && (
                <div className="mt-2 space-y-1 mr-6">
                  <Link
                    href="/courses/my"
                    className={`flex items-center gap-3 w-full p-3 rounded-xl smooth text-sm ${
                      pathname === "/courses/my"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon icon="solar:bookmark-bold" className="w-4 h-4" />
                    <span>كورساتي</span>
                  </Link>
                  <Link
                    href="/courses"
                    className={`flex items-center gap-3 w-full p-3 rounded-xl smooth text-sm ${
                      pathname === "/courses"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon icon="solar:library-bold" className="w-4 h-4" />
                    <span>جميع الكورسات</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/logout"
              className={`flex items-center w-full p-3 rounded-xl smooth ${
                !shouldShowExpanded ? "justify-center" : "gap-3"
              } text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-800`}
              title={!shouldShowExpanded ? "تسجيل الخروج" : ""}
            >
              <Icon icon="solar:logout-bold" className="w-6 h-6" />
              {shouldShowExpanded && (
                <span className="font-medium">تسجيل الخروج</span>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ease-in-out ${getMainContentMarginClass()}`}
      >
        {children}
      </main>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24"
          onClick={toggleSearch}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                🔎 البحث في الكورسات
              </h2>
              <button
                onClick={toggleSearch}
                className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
              >
                <Icon
                  icon="solar:close-circle-bold"
                  className="w-5 h-5 lg:w-6 lg:h-6"
                />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ابحث عن كورسات"
                  icon={"solar:magnifer-bold"}
                  className="w-full"
                  dir="rtl"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  disabled={!searchQuery.trim()}
                >
                  <Icon icon="material-symbols:search" className="w-6 h-6" />
                </button>
              </div>
              {showSuggestions && autocompleteSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {autocompleteSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          icon="material-symbols:search"
                          className="w-5 h-5 text-gray-400"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {suggestion}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-center gap-3">
                <Button
                  type="submit"
                  text="بحث"
                  disabled={!searchQuery.trim()}
                />
                <Button
                  type="button"
                  onClick={toggleSearch}
                  text="إلغاء"
                  color="gray"
                  shade={500}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Backdrop for mobile */}
      {isAuthenticated && isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 top-0 bg-black/30 z-30 transition-opacity"
        />
      )}
    </div>
  );
};

export default Navbar;
