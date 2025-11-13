"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: "solar:widget-bold-duotone",
      href: "/admin/dashboard",
    },
    {
      title: "الطلاب",
      icon: "solar:users-group-rounded-bold-duotone",
      href: "/admin/students",
    },
    {
      title: "الكورسات",
      icon: "solar:book-bold-duotone",
      href: "/admin/courses",
    },
    {
      title: "الامتحانات",
      icon: "solar:clipboard-list-bold-duotone",
      href: "/admin/exams",
    },
    {
      title: "التقارير",
      icon: "solar:chart-bold-duotone",
      href: "/admin/reports",
    },
    {
      title: "الإعدادات",
      icon: "solar:settings-bold-duotone",
      href: "/admin/settings",
    },
  ];

  const isActive = (href) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden bg-red-600 text-white p-3 rounded-xl shadow-lg"
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        } ${
          isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <Icon
                      icon="solar:shield-user-bold"
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      لوحة الإدارة
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      مدير النظام
                    </p>
                  </div>
                </div>
              )}
              {isCollapsed && (
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mx-auto">
                  <Icon
                    icon="solar:shield-user-bold"
                    className="w-6 h-6 text-white"
                  />
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon
                  icon={
                    isCollapsed
                      ? "solar:alt-arrow-left-bold"
                      : "solar:alt-arrow-right-bold"
                  }
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.title : ""}
                >
                  <Icon icon={item.icon} className="w-6 h-6 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                  {!isCollapsed && active && (
                    <div className="mr-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!isCollapsed ? (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Icon
                      icon="solar:user-bold"
                      className="w-5 h-5 text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      أحمد محمد
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      admin@example.com
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/logout"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Icon icon="solar:logout-2-bold" className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/admin/logout"
                className="flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
        className={`hidden lg:block transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      />
    </>
  );
};

export default AdminSidebar;
