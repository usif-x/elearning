"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";
import { Lemonada } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const lemonada = Lemonada({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const printFullDate = (date) => new Date(date).toLocaleDateString("ar-EG");
const printUnit = (price, currency) => `${price} ${currency}`;
const formatDescription = (desc, _, __, maxLength) => {
  if (desc.length > maxLength) {
    return desc.substring(0, maxLength) + "...";
  }
  return desc;
};

const CourseCard = ({ courses = [] }) => {
  const { isAuthenticated } = useAuthStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  if (!courses || courses.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-base sm:text-lg mb-2">
            لا توجد كورسات متاحة حالياً
          </p>
          <p className="text-xs sm:text-sm">
            No courses available at the moment
          </p>
        </div>
      </div>
    );
  }

  const CreatedAndUpadtedAtComponent = ({ created_at, id, className = "" }) => {
    return (
      <div
        className={`flex flex-col items-start sm:items-end space-y-1 text-gray-500 dark:text-gray-400 transition-all duration-300 text-xs ${className}`}
      >
        <div className="flex flex-row-reverse sm:flex-row sm:space-x-reverse space-x-1 sm:space-x-1 items-center">
          <span className="flex items-center justify-center">
            {new Date() < new Date("2025-08-10") && id > 3
              ? printFullDate("2025-08-09")
              : printFullDate(created_at)}
          </span>
          <span className="text-sm flex items-center justify-center transform -translate-y-0.5">
            <Icon icon="ic:twotone-create-new-folder" />
          </span>
        </div>
        <div className="flex flex-row-reverse sm:flex-row sm:space-x-reverse space-x-1 sm:space-x-1 items-center">
          <span className="flex items-center justify-center">
            {new Date() < new Date("2025-08-10") && id > 3
              ? printFullDate("2025-08-09")
              : printFullDate(created_at)}
          </span>
          <span className="text-sm flex items-center justify-center transform -translate-y-0.5">
            <Icon icon="icon-park-twotone:update-rotation" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-4 md:p-6">
      {courses.map(
        ({
          id = 0,
          name = "",
          description = "",
          price = 0,
          price_before_discount = 0,
          image = "",
          created_at = "",
          is_subscribed = false,
          is_free = false,
          is_pinned = false,
          sellable = true,
          onSubscribeClick = () => {},
        }) => (
          <div key={id} className="group relative h-full">
            <div
              className={`bg-white dark:bg-gray-800 text-sky-500 border-2 ${
                is_subscribed
                  ? "border-sky-500"
                  : "border-gray-200 dark:border-gray-700"
              } transition-all duration-300 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col space-y-3 sm:space-y-4 h-full`}
            >
              {/* Image Container */}
              <div className="rounded-lg sm:rounded-xl relative overflow-hidden">
                <Image
                  src={
                    image ? `${apiUrl}/storage/${image}` : "/placeholder.jpg"
                  }
                  alt={name}
                  width={400}
                  height={300}
                  loading="lazy"
                  className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
                />
                {/* Pinned Badge */}
                {is_pinned && (
                  <div className="absolute top-2 right-2 bg-amber-500 dark:bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse">
                    <Icon icon="mdi:pin" className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-bold">مثبت</span>
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div className="flex flex-col space-y-2 sm:space-y-3 leading-0">
                {/* Course Name */}
                <div className="text-center px-2">
                  <h3
                    className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white line-clamp-2"
                    dir="rtl"
                  >
                    {name}
                  </h3>
                </div>

                {/* Divider */}
                <div className="h-0.5 sm:h-1 mx-2 w-auto rounded-full bg-sky-700" />

                {/* Course Description */}
                <div className="text-center px-2">
                  <p
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 line-clamp-3"
                    dir="rtl"
                  >
                    {formatDescription(description, true, "", 100)}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-0.5 sm:h-1 mx-2 w-auto rounded-full bg-sky-700" />

                {/* Price and Date Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2">
                  {/* Price Section */}
                  <div className="flex flex-row-reverse sm:flex-col justify-between sm:justify-start items-center sm:items-start">
                    {!is_subscribed && (
                      <>
                        <div
                          className={`text-center sm:text-right ${lemonada.className}`}
                        >
                          <div className="text-sky-500 text-base sm:text-lg md:text-xl font-semibold">
                            {price != 0 ? (
                              printUnit(price, "جنيه")
                            ) : (
                              <div className="border-sky-500 w-fit dark:text-sky-200 transition-all duration-300 bg-sky-100 dark:bg-sky-900 border rounded-md py-1 px-2 sm:px-3 text-xs sm:text-sm">
                                كورس مجاني
                              </div>
                            )}
                          </div>
                          {price_before_discount &&
                          price_before_discount != 0 &&
                          price_before_discount > price ? (
                            <div className="flex flex-col sm:flex-row gap-1 text-xs sm:text-sm">
                              <span className="text-gray-600 dark:text-gray-200 transition-all duration-300 opacity-75">
                                بدلاً من
                              </span>
                              <span className="line-through text-sky-600 font-semibold">
                                {price_before_discount} جنيهاً
                              </span>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Date Section - Hidden on mobile */}
                  <CreatedAndUpadtedAtComponent
                    created_at={created_at}
                    id={id}
                    className="hidden sm:flex"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center w-full gap-2 !mt-auto pt-3 sm:pt-4">
                {/* Date Section - Visible on mobile */}
                <CreatedAndUpadtedAtComponent
                  created_at={created_at}
                  id={id}
                  className="flex sm:hidden"
                />

                {/* Buttons Container */}
                <div className="w-full sm:w-auto flex-1 flex flex-col space-y-2">
                  {!sellable ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-center">
                      <p
                        className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400"
                        dir="rtl"
                      >
                        الكورس غير متاح للبيع حالياً
                      </p>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={
                          isAuthenticated ? `/courses/${id}` : `/courses/${id}`
                        }
                        className="w-full"
                      >
                        <button
                          className={`border-2 transition-all duration-300 w-full rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium ${
                            is_subscribed
                              ? "bg-sky-500 border-sky-500 dark:bg-sky-500 dark:border-sky-500 text-white hover:bg-sky-600 active:bg-sky-700"
                              : "bg-transparent border-sky-500 dark:border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white active:bg-sky-600"
                          }`}
                        >
                          الدخول للكورس
                        </button>
                      </Link>
                      {!is_subscribed && price != 0 && (
                        <button
                          className="border-2 transition-all duration-300 w-full rounded-lg sm:rounded-xl bg-sky-500 border-sky-500 dark:bg-sky-600 dark:border-sky-600 hover:bg-sky-600 active:bg-sky-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium"
                          onClick={onSubscribeClick}
                        >
                          الإشتراك في الكورس !
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default CourseCard;
