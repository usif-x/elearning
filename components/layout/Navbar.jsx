"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { getSearchAutocomplete } from "@/services/Courses";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react"; // Import useRef and useEffect
import Button from "../ui/Button";
import DarkModeSwitcher from "../ui/DarkModeSwitcher";
import Input from "../ui/Input";

const Navbar = ({ children }) => {
  // Accept children to render inside the main content area
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isAuthenticated, user, userType } = useAuthStore();
  const pathname = usePathname(); // Get current route
  const router = useRouter(); // For navigation

  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Clear search when opening
      setSearchQuery("");
      setAutocompleteSuggestions([]);
      setShowSuggestions(false);
    }
  };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setIsCoursesDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  };
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const shouldShowExpanded = !isSidebarCollapsed || isHovering;

  const handleMouseEnter = () => {
    if (isSidebarCollapsed) {
      setIsHovering(true);
    }
  };

  const [isScroll, setIsScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      if (scrollHeight - clientHeight === 0) {
        setScrollProgress(100);
        setIsScroll(false); // no scrolling possible
        return;
      }

      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);

      // if user has scrolled from top
      setIsScroll(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);

    // Run once on mount in case page is already scrolled
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // --- NEW: Dynamic style for the conic gradient background ---
  const progressCircleStyle = {
    background: `conic-gradient(
      #3b82f6 ${scrollProgress * 3.6}deg, 
      #e5e7eb ${scrollProgress * 3.6}deg
    )`,
    // Note for dark mode: You can replace '#e5e7eb' (gray-200) with a darker color
    // using a theme provider or another state check. For simplicity, we use a light gray track.
  };

  const handleMouseLeave = () => {
    if (isSidebarCollapsed) {
      setIsHovering(false);
      setIsCoursesDropdownOpen(false);
      setIsProfileDropdownOpen(false);
    }
  };

  // Get autocomplete suggestions
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

  // Handle search input change with autocomplete
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for autocomplete
    const newTimeout = setTimeout(() => {
      getAutocompleteSuggestions(value);
    }, 300);

    setSearchTimeout(newTimeout);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      // Navigate to search page with query
      router.push(
        `/courses/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      setIsSearchOpen(false);
      setSearchQuery("");
      setAutocompleteSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setAutocompleteSuggestions([]);
    // Navigate to search page with suggestion
    router.push(`/courses/search?q=${encodeURIComponent(suggestion)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const getMainContentMarginClass = () => {
    if (!isAuthenticated) {
      return ""; // No margin if user is not logged in
    }
    // These classes have the `lg:` prefix, so they only apply on large screens.
    if (isSidebarCollapsed) {
      return "lg:mr-20"; // 5rem margin for the collapsed sidebar
    }
    return "lg:mr-80"; // 20rem margin for the expanded sidebar
  };

  // Helper function to check if a profile link is active
  const isProfileDropdownActive = () => {
    return pathname.startsWith("/profile");
  };

  // Helper function to check if a courses link is active
  const isCoursesDropdownActive = () => {
    return pathname.startsWith("/courses");
  };

  const isCommunityActive = () => {
    return pathname.startsWith("/community");
  };

  // Helper function to format user status
  const getUserStatusDisplay = (status) => {
    const statusMap = {
      student: "طالب",
      teacher: "مدرس",
      admin: "مدير",
      moderator: "مشرف",
    };
    return statusMap[status] || status;
  };

  // Helper function to get verification badge
  const getVerificationBadge = () => {
    if (user?.is_verified) {
      return (
        <Icon
          icon="solar:verified-check-bold"
          className="w-4 h-4 text-green-500"
          title="حساب موثق"
        />
      );
    } else {
      return (
        <Icon
          icon="solar:verified-close-bold"
          className="w-4 h-4 text-red-500"
          title="حساب غير موثق"
        />
      );
    }
  };

  // Helper function to get Telegram verification badge
  const getTelegramVerificationBadge = () => {
    if (user?.telegram_verified) {
      return (
        <Icon
          icon="solar:verified-check-bold"
          className="w-4 h-4 text-blue-500"
          title="حساب تليجرام موثق"
        />
      );
    }
    // Return null if not verified, so nothing shows up
    return null;
  };

  return (
    <div dir="rtl">
      {/* Navbar (Fixed Position) */}
      <nav
        className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 smooth fixed top-0 left-0 right-0 z-30
          ${
            isAuthenticated ? "border-b" : "w-[95%] m-auto mt-4 rounded-lg"
          } overflow-hidden`} // <-- CHANGE HERE
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between ">
            {/* --- DESKTOP NAVBAR --- */}

            {/* Right side - Logo & Dark Mode */}
            <div className="hidden lg:flex items-center gap-4">
              <div
                style={isAuthenticated && isScroll ? progressCircleStyle : {}}
                className="w-12 h-12 rounded-full p-0.5 flex items-center justify-center transition-all duration-300"
                title={`Page scrolled: ${Math.round(scrollProgress)}%`}
              >
                {/* This inner div provides a solid background to cover the center of the gradient */}
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

            {/* Left side - Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {userType !== "admin" && (
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl smooth hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Icon
                        icon="solar:wallet-bold"
                        className="w-5 h-5 text-green-500"
                      />
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                          الرصيد{" "}
                        </span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                          {user?.wallet_balance || 0} ج.م
                        </span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={toggleSearch}
                    className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
                  >
                    <Icon
                      icon="solar:magnifer-bold-duotone"
                      className="w-5 h-5"
                    />
                  </button>
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

            {/* --- MOBILE NAVBAR --- */}
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
                  </>
                )}
                <button
                  onClick={toggleMobileMenu}
                  className="w-10 h-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
                >
                  <Icon icon="solar:hamburger-menu-bold" className="w-5 h-5" />
                </button>
              </div>

              {/* Center: Logo */}
              <div className="flex-shrink-0">
                <div
                  style={isAuthenticated && isScroll ? progressCircleStyle : {}}
                  className="w-12 h-12 rounded-full p-0.5 flex items-center justify-center transition-all duration-150"
                  title={`Page scrolled: ${Math.round(scrollProgress)}%`}
                >
                  {/* This inner div provides a solid background to cover the center of the gradient */}
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

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    {/* بطاقة بيانات المستخدم */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">
                      {/* صورة البروفايل */}
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

                      {/* بيانات المستخدم */}
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

                    {/* بطاقة الرصيد */}
                    {userType !== "admin" && (
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm mt-3">
                        <Icon
                          icon="solar:wallet-bold"
                          className="w-5 h-5 text-green-500"
                        />
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                            الرصيد
                          </span>
                          <span className="block text-sm font-bold text-gray-800 dark:text-white leading-none">
                            {user?.wallet_balance || 0} ج.م
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {userType === "admin" ? (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 w-full p-3 rounded-xl smooth bg-red-500 text-white hover:bg-red-600"
                        >
                          <Icon
                            icon="solar:shield-user-bold"
                            className="w-5 h-5"
                          />
                          <span>لوحة الإدارة</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                              isProfileDropdownActive()
                                ? "bg-blue-500 text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <Icon
                              icon="solar:user-circle-bold"
                              className="w-5 h-5"
                            />
                            <span>ملفي الشخصي</span>
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
                        className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                          pathname === "/questions-forum"
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon
                          icon="solar:question-circle-bold"
                          className="w-5 h-5"
                        />
                        <span>منتدي الأسئلة</span>
                      </Link>

                      <Link
                        href="/community"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                          isCommunityActive()
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon
                          icon="solar:users-group-rounded-bold"
                          className="w-5 h-5"
                        />
                        <span>منتدى الطلاب</span>
                      </Link>

                      <Link
                        href="/courses"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                          isCoursesDropdownActive()
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon
                          icon="solar:book-bookmark-bold"
                          className="w-5 h-5"
                        />
                        <span>الكورسات</span>
                      </Link>
                    </div>
                    <Link
                      href="/logout"
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-800`}
                    >
                      <Icon icon="solar:logout-bold" className="w-5 h-5" />
                      <span>تسجيل الخروج</span>
                    </Link>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href={"/login"}
                      className="flex items-center justify-center gap-2 w-full p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth font-medium border border-gray-200 dark:border-gray-700"
                    >
                      <Icon icon="solar:login-3-bold" className="w-4 h-4" />
                      تسجيل الدخول
                    </Link>
                    <Link
                      href={"/register"}
                      className="flex items-center justify-center gap-2 w-full p-3 bg-blue-500 text-white hover:bg-blue-600 rounded-xl smooth font-medium"
                    >
                      <Icon icon="solar:user-plus-bold" className="w-4 h-4" />
                      إنشاء حساب
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
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

      {/* Sidebar (Fixed Position) */}
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

            {/* User Info */}
            {shouldShowExpanded &&
            userType !== "admin" &&
            userType === "user" ? (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">
                {/* صورة البروفايل */}
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

                {/* بيانات المستخدم */}
                <div className="flex-1 min-w-0">
                  {/* الاسم + رقم الهاتف + الحالة */}
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

                  {/* البريد الإلكتروني */}
                  {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  )}

                  {/* التليجرام */}
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

          {/* Sidebar Content */}
          <div className="p-4 space-y-2 overflow-y-auto h-full pb-32">
            {userType === "admin" ? (
              /* Admin Dashboard Link */
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
              <>
                {/* My Profile */}
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
              </>
            )}

            {/* Practice Quiz */}
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

            {/* Questions Forum */}
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
              <Icon icon="solar:question-circle-bold" className="w-6 h-6" />
              {shouldShowExpanded && (
                <span className="font-medium">منتدي الأسئلة</span>
              )}
            </Link>

            {/* Community */}
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

            {/* Courses with Dropdown */}

            <div
              className={`${
                isCoursesDropdownOpen && isCoursesDropdownActive()
                  ? "bg-blue-500/15 dark:bg-blue-900/50"
                  : ""
              } rounded-xl p-1`}
            >
              <button
                onClick={() => {
                  if (shouldShowExpanded) {
                    setIsCoursesDropdownOpen(!isCoursesDropdownOpen);
                  }
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
            {/* Logout */}
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
        className={` transition-all duration-300 ease-in-out ${getMainContentMarginClass()}`}
      >
        {/* All your page content (e.g., from page.js) will be rendered here */}
        {children}
      </main>

      {/* Overlays */}
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

              {/* Autocomplete Suggestions */}
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
