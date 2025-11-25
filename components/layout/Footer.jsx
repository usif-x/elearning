"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

const Footer = ({ isSidebarCollapsed }) => {
  const { isAuthenticated } = useAuthStore();
  const getContentMarginClass = () => {
    if (!isAuthenticated) {
      return "";
    }
    if (isSidebarCollapsed) {
      return "lg:mr-20";
    }
    return "lg:mr-80";
  };

  const socialLinks = [
    {
      name: "تيليجرام",
      href: "https://t.me/DahhehetMedical",
      icon: "line-md:telegram",
      color: "hover:text-sky-500",
    },
  ];

  return (
    // The footer element itself is full-width to ensure the background color and border span the entire page.
    <footer
      className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all smooth shadow-xl"
      dir="rtl"
    >
      {/* The inner div handles the max-width and dynamic margin based on the sidebar's state. */}
      <div
        className={`max-w-[1440px] mx-auto px-4 lg:px-6 py-8 transition-all duration-300 ease-in-out ${getContentMarginClass()}`}
      >
        <div className="text-center">
          {/* Brand and Description */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-full" // Added for consistency with Navbar logo
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  دحيحة ميديكال
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400"></p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              منصه هدفها مساعدة الطلاب المحتاسين و الي مش فاهمين حاجه 🫠
            </p>
          </div>

          {/* Social Links */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">تابعنا على</p>
            <div className="flex justify-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 ${social.color} hover:bg-gray-100 dark:hover:bg-gray-700 smooth`}
                  title={social.name}
                >
                  <Icon icon={social.icon} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
              <p>
                © {new Date().getFullYear()} دحيحة ميديكال. جميع الحقوق محفوظة.
              </p>
              <div className="flex items-center gap-2">
                <span>تطوير</span>
                <Icon
                  icon="solar:code-bold"
                  className="w-4 h-4 text-blue-500"
                />
                <Link
                  href={"https://yousseif.xyz"}
                  className="text-gray-700 dark:text-gray-300 font-medium bg-gray-200 smooth dark:bg-gray-800 p-2 px-4 rounded-md hover:bg-opacity-60"
                >
                  يوسف
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
