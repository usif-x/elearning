"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const socialLinks = [
    {
      name: "تويتر",
      href: "#",
      icon: "solar:hashtag-bold",
      color: "hover:text-blue-400",
    },
    {
      name: "لينكد إن",
      href: "#",
      icon: "solar:linkedin-bold",
      color: "hover:text-blue-600",
    },
    {
      name: "يوتيوب",
      href: "#",
      icon: "solar:video-library-bold",
      color: "hover:text-red-500",
    },
    {
      name: "إنستغرام",
      href: "#",
      icon: "solar:camera-bold",
      color: "hover:text-pink-500",
    },
    {
      name: "تيليجرام",
      href: "#",
      icon: "solar:chat-round-bold",
      color: "hover:text-sky-500",
    },
  ];

  return (
    <footer
      className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 smooth"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="text-center">
          {/* Brand and Description */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center">
                <Image
                  src="/images/logo-bg.png"
                  alt="Logo"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  أكاديمية التعلم
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  منصة تعليمية متطورة
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              منصة تعليمية متطورة تقدم أفضل الدورات التدريبية والبرامج التعليمية
              من خلال نخبة من المدربين المتخصصين لمساعدتك في تطوير مهاراتك
              وتحقيق أهدافك المهنية والشخصية.
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
                © {new Date().getFullYear()} أكاديمية التعلم. جميع الحقوق
                محفوظة.
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
                  يوسف محمد
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
