"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";
import { useState } from "react";

import Link from "next/link";
import Button from "../ui/Button";
import DarkModeSwitcher from "../ui/DarkModeSwitcher";
import Input from "../ui/Input";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [activeItem, setActiveItem] = useState("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isAuthenticated, user } = useAuthStore();

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setIsCoursesDropdownOpen(false);
  };
  const toggleDarkMode = () => setIsDark(!isDark);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const shouldShowExpanded = !isSidebarCollapsed || isHovering;

  const handleMouseEnter = () => {
    if (isSidebarCollapsed) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (isSidebarCollapsed) {
      setIsHovering(false);
      setIsCoursesDropdownOpen(false);
    }
  };

  return (
    <div dir="rtl">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 smooth fixed top-0 left-0 right-0 z-30">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between ">
            {/* Right side - Logo */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center">
                  <img src="images/logo-bg.png" alt="" />
                </div>
              </Link>
              <div className="hidden lg:flex items-center">
                <DarkModeSwitcher />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Wallet Balance */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl smooth hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Icon
                      icon="solar:wallet-bold"
                      className="w-5 h-5 text-green-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                        الرصيد
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                        {user?.wallet_balance || 0} ريال
                      </span>
                    </div>
                  </div>

                  {/* Search Icon */}
                  <button
                    onClick={toggleSearch}
                    className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
                  >
                    <Icon icon="solar:magnifer-bold" className="w-5 h-5" />
                  </button>
                </>
              ) : (
                /* Auth Buttons for non-authenticated users */
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

              {/* Sidebar Toggle - Only show if authenticated */}
              {isAuthenticated && (
                <button
                  onClick={toggleSidebar}
                  className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
                >
                  <Icon icon="solar:hamburger-menu-bold" className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile Right Side */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Dark Mode Toggle Mobile */}
              <DarkModeSwitcher />

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="w-10 h-10 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
              >
                <Icon icon="solar:hamburger-menu-bold" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    {/* User Info Mobile */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Icon
                          icon="solar:user-bold"
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          {user?.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email || "غير متوفر"}
                        </p>
                      </div>
                    </div>

                    {/* Wallet Balance Mobile */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Icon
                        icon="solar:wallet-bold"
                        className="w-5 h-5 text-green-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                          الرصيد
                        </span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                          {user?.wallet_balance || 0} ريال
                        </span>
                      </div>
                    </div>

                    {/* Search Mobile */}
                    <button
                      onClick={toggleSearch}
                      className="flex items-center gap-3 w-full p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth"
                    >
                      <Icon icon="solar:magnifer-bold" className="w-5 h-5" />
                      <span>البحث</span>
                    </button>

                    {/* Mobile Menu Items */}
                    <button
                      onClick={() => {
                        setActiveItem("profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                        activeItem === "profile"
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon icon="solar:user-circle-bold" className="w-5 h-5" />
                      <span>ملفي الشخصي</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveItem("courses");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                        activeItem === "courses"
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon
                        icon="solar:book-bookmark-bold"
                        className="w-5 h-5"
                      />
                      <span>الدورات</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveItem("community");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                        activeItem === "community"
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon
                        icon="solar:users-group-rounded-bold"
                        className="w-5 h-5"
                      />
                      <span>المجتمع</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveItem("settings");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth ${
                        activeItem === "settings"
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon icon="solar:settings-bold" className="w-5 h-5" />
                      <span>الإعدادات</span>
                    </button>
                  </>
                ) : (
                  /* Mobile Auth Buttons */
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
      </nav>

      {/* Main Content Wrapper with top padding for fixed navbar */}
      <div className="pt-20">
        {/* Search Modal */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24">
            {/* Modal Content */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-lg mx-4">
              {/* Search Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  🔎 البحث
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

              {/* Search Input */}
              <Input
                type="text"
                placeholder="ابحث في كورسات الموقع"
                icon={"solar:magnifer-bold"}
                className="w-full"
                dir="rtl"
              />

              {/* Search Button */}
              <div className="mt-4 flex justify-center">
                <Button onClick={() => console.log("بحث")} text="بحث" />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Only render if authenticated and not mobile */}
        {isAuthenticated && isSidebarOpen && (
          <div
            className={`hidden lg:block fixed top-20 right-0 h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 transform smooth overflow-hidden ${
              isSidebarCollapsed && !isHovering ? "w-20" : "w-80"
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                {shouldShowExpanded && (
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    القائمة الرئيسية
                  </h2>
                )}
                <button
                  onClick={toggleSidebarCollapse}
                  className="w-10 h-10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl smooth flex items-center justify-center"
                >
                  <Icon
                    icon={
                      isSidebarCollapsed
                        ? "solar:alt-arrow-left-bold"
                        : "solar:alt-arrow-right-bold"
                    }
                    className="w-5 h-5"
                  />
                </button>
              </div>

              {/* User Info */}
              {shouldShowExpanded ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Icon
                      icon="solar:user-bold"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {user?.full_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email || "غير متوفر"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Icon
                      icon="solar:user-bold"
                      className="w-5 h-5 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Content */}
            <div className="p-4 space-y-2 overflow-y-auto h-full pb-32">
              {/* My Profile */}
              <button
                onClick={() => setActiveItem("profile")}
                className={`flex items-center w-full p-3 rounded-xl smooth ${
                  !shouldShowExpanded ? "justify-center" : "gap-3"
                } ${
                  activeItem === "profile"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={!shouldShowExpanded ? "ملفي الشخصي" : ""}
              >
                <Icon icon="solar:user-circle-bold" className="w-6 h-6" />
                {shouldShowExpanded && (
                  <span className="font-medium">ملفي الشخصي</span>
                )}
              </button>

              {/* Courses with Dropdown */}
              <div>
                <button
                  onClick={() => {
                    setActiveItem("courses");
                    if (shouldShowExpanded) {
                      setIsCoursesDropdownOpen(!isCoursesDropdownOpen);
                    }
                  }}
                  className={`flex items-center justify-between w-full p-3 rounded-xl smooth ${
                    !shouldShowExpanded ? "justify-center" : ""
                  } ${
                    activeItem === "courses"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={!shouldShowExpanded ? "الدورات" : ""}
                >
                  <div
                    className={`flex items-center ${
                      shouldShowExpanded ? "gap-3" : ""
                    }`}
                  >
                    <Icon icon="solar:book-bookmark-bold" className="w-6 h-6" />
                    {shouldShowExpanded && (
                      <span className="font-medium">الدورات</span>
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

                {/* Courses Dropdown */}
                {isCoursesDropdownOpen && shouldShowExpanded && (
                  <div className="mt-2 space-y-1 mr-6">
                    <button
                      onClick={() => setActiveItem("my-courses")}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth text-sm ${
                        activeItem === "my-courses"
                          ? "bg-blue-500 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon icon="solar:bookmark-bold" className="w-4 h-4" />
                      <span>دوراتي المشترك بها</span>
                    </button>
                    <button
                      onClick={() => setActiveItem("suggested-courses")}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth text-sm ${
                        activeItem === "suggested-courses"
                          ? "bg-blue-500 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon icon="solar:star-bold" className="w-4 h-4" />
                      <span>الدورات المقترحة</span>
                    </button>
                    <button
                      onClick={() => setActiveItem("all-courses")}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl smooth text-sm ${
                        activeItem === "all-courses"
                          ? "bg-blue-500 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon icon="solar:library-bold" className="w-4 h-4" />
                      <span>جميع الدورات</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Community */}
              <button
                onClick={() => setActiveItem("community")}
                className={`flex items-center w-full p-3 rounded-xl smooth ${
                  !shouldShowExpanded ? "justify-center" : "gap-3"
                } ${
                  activeItem === "community"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={!shouldShowExpanded ? "المجتمع" : ""}
              >
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="w-6 h-6"
                />
                {shouldShowExpanded && (
                  <span className="font-medium">المجتمع</span>
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => setActiveItem("settings")}
                className={`flex items-center w-full p-3 rounded-xl smooth ${
                  !shouldShowExpanded ? "justify-center" : "gap-3"
                } ${
                  activeItem === "settings"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={!shouldShowExpanded ? "الإعدادات" : ""}
              >
                <Icon icon="solar:settings-bold" className="w-6 h-6" />
                {shouldShowExpanded && (
                  <span className="font-medium">الإعدادات</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
