"use client";

import { useTheme } from "@/context/ThemeProvider";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState([]);
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: "solar:widget-bold-duotone",
      href: "/admin/dashboard",
    },
    {
      title: "إدارة الدورات",
      icon: "solar:book-bold-duotone",
      href: "/admin/dashboard/courses",
    },
    {
      title: "مولد الاختبارات",
      icon: "solar:document-add-bold-duotone",
      href: "/admin/dashboard/pdf-generator",
    },
    {
      title: "إدارة المشرفين",
      icon: "solar:shield-user-bold-duotone",
      href: "/admin/dashboard/admins",
    },
    {
      title: "إدارة المستخدمين",
      icon: "solar:users-group-rounded-bold-duotone",
      href: "/admin/dashboard/users",
    },
    {
      title: " إدارة الإشعارات",
      icon: "basil:notification-on-solid",
      href: "/admin/dashboard/notification",
    },
    {
      title: "إدارة المنتدى",
      icon: "solar:users-group-rounded-bold-duotone",
      isDropdown: true,
      subItems: [
        {
          title: "المجتمعات",
          icon: "solar:chat-round-dots-bold",
          href: "/admin/dashboard/community",
        },
        {
          title: "البلاغات",
          icon: "solar:danger-circle-bold",
          href: "/admin/dashboard/community/reported_posts",
        },
      ],
    },
  ];

  const isActive = (href) => {
    return pathname === href;
  };

  const isDropdownActive = (subItems) => {
    return subItems.some((item) => pathname.startsWith(item.href));
  };

  const toggleDropdown = (index) => {
    setOpenDropdowns((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden bg-white dark:bg-zinc-800 text-gray-900 dark:text-white p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-700 hover:scale-105 transition-transform"
      >
        <Icon
          icon={
            isMobileOpen
              ? "solar:close-square-bold"
              : "solar:hamburger-menu-bold"
          }
          className="w-6 h-6"
        />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white dark:bg-zinc-900 border-l border-gray-100 dark:border-zinc-800 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-28" : "w-80"
        } ${
          isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full py-6 px-4">
          {/* Header */}
          <div className="mb-8 px-2">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Icon
                      icon="solar:shield-user-bold"
                      className="w-7 h-7 text-white"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                      لوحة الإدارة
                    </h2>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      نظام التحكم الكامل
                    </p>
                  </div>
                </div>
              )}
              {isCollapsed && (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
                  <Icon
                    icon="solar:shield-user-bold"
                    className="w-7 h-7 text-white"
                  />
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <Icon
                  icon={
                    isCollapsed
                      ? "solar:alt-arrow-left-bold"
                      : "solar:alt-arrow-right-bold"
                  }
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
            {menuItems.map((item, index) => {
              if (item.isDropdown) {
                const isOpen =
                  openDropdowns.includes(index) ||
                  isDropdownActive(item.subItems);
                const dropdownActive = isDropdownActive(item.subItems);

                return (
                  <div key={index} className="group">
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group-hover:bg-gray-50 dark:group-hover:bg-zinc-800/50 ${
                        dropdownActive
                          ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400"
                      } ${isCollapsed ? "justify-center" : ""}`}
                      title={isCollapsed ? item.title : ""}
                    >
                      <Icon
                        icon={item.icon}
                        className={`w-6 h-6 flex-shrink-0 transition-colors ${
                          dropdownActive
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        }`}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="font-bold text-sm flex-1 text-right">
                            {item.title}
                          </span>
                          <Icon
                            icon="solar:alt-arrow-left-bold"
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isOpen ? "-rotate-90" : "rotate-0"
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {/* Dropdown Items */}
                    {!isCollapsed && isOpen && (
                      <div className="mt-2 mr-4 space-y-1 border-r-2 border-gray-100 dark:border-zinc-800 pr-4">
                        {item.subItems.map((subItem, subIndex) => {
                          const subActive = isActive(subItem.href);
                          return (
                            <Link
                              key={subIndex}
                              href={subItem.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                subActive
                                  ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white"
                              }`}
                            >
                              <Icon
                                icon={subItem.icon}
                                className="w-5 h-5 flex-shrink-0"
                              />
                              <span className="text-sm font-medium">
                                {subItem.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active = isActive(item.href);
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                    active
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.title : ""}
                >
                  <Icon
                    icon={item.icon}
                    className={`w-6 h-6 flex-shrink-0 transition-colors ${
                      active
                        ? "text-white"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="font-bold text-sm">{item.title}</span>
                  )}
                </Link>
              );
            })}

            {/* Theme Toggle Button */}
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white group ${
                  isCollapsed ? "justify-center" : ""
                }`}
                title={
                  isCollapsed
                    ? isDarkMode
                      ? "الوضع النهاري"
                      : "الوضع الليلي"
                    : ""
                }
              >
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Icon
                    icon="solar:sun-bold"
                    className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                      isDarkMode
                        ? "opacity-0 rotate-90 scale-0"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <Icon
                    icon="solar:moon-bold"
                    className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                      isDarkMode
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-90 scale-0"
                    }`}
                  />
                </div>
                {!isCollapsed && (
                  <span className="font-bold text-sm">
                    {isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            {!isCollapsed ? (
              <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                    <Icon
                      icon="solar:user-bold"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      أحمد محمد
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      admin@example.com
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/logout"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white dark:bg-zinc-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 text-sm font-bold shadow-sm border border-gray-100 dark:border-zinc-600"
                >
                  <Icon icon="solar:logout-2-bold" className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/admin/logout"
                className="flex items-center justify-center p-3.5 bg-gray-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-2xl transition-all duration-200"
                title="تسجيل الخروج"
              >
                <Icon icon="solar:logout-2-bold" className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer for content */}
      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-28" : "w-80"
        }`}
      />
    </>
  );
};

export default AdminSidebar;
