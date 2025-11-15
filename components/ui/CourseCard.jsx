"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";
import { Lemonada } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
const lemonada = Lemonada({
  subsets: ["arabic", "latin"], // 👈 مهم تضيف "arabic"
  weight: ["300", "400", "500", "600", "700"], // 👈 من غير backticks
});

// Mock utility functions since their implementation is not provided.
// You should replace these with your actual utility functions.
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

  // Handle empty or undefined courses array
  if (!courses || courses.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">لا توجد كورسات متاحة حالياً</p>
          <p className="text-sm">No courses available at the moment</p>
        </div>
      </div>
    );
  }

  const CreatedAndUpadtedAtComponent = ({ created_at, id, className = "" }) => {
    return (
      <div
        className={`flex flex-col md:items-end items-start space-y-1 text-gray-500 dark:text-gray-400 transition-all duration-300   text-xs ${className}`}
      >
        <div className="flex md:space-x-1 md:space-x-reverse md:flex-row space-x-1 flex-row-reverse items-center">
          <span className="flex items-center justify-center">
            {new Date() < new Date("2025-08-10") && id > 3
              ? printFullDate("2025-08-09")
              : printFullDate(created_at)}
          </span>
          <span className="text-sm flex items-center justify-center transform -translate-y-0.5">
            <Icon icon="ic:twotone-create-new-folder" />
          </span>
        </div>
        <div className="flex md:space-x-1 md:space-x-reverse md:flex-row space-x-1 flex-row-reverse items-center">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
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
          onSubscribeClick = () => {},
        }) => (
          <div key={id} className="group relative   h-full">
            <div
              className={`bg-white dark:bg-gray-800 text-sky-500 border-2 ${
                is_subscribed
                  ? "border-sky-500"
                  : "border-gray-200 dark:border-gray-700"
              } transition-all duration-300 rounded-xl p-4 flex flex-col space-y-4 h-full`}
            >
              <div className="rounded-xl relative overflow-hidden">
                <Image
                  src={
                    image ? `${apiUrl}/storage/${image}` : "/placeholder.jpg"
                  }
                  alt={name}
                  width={400}
                  height={300}
                  loading="lazy"
                  className="w-full h-full max-h-[300px] object-cover"
                />
              </div>
              <div className="flex flex-col space-y-3 leading-0">
                {/* Course Name - Centered */}
                <div className="text-center">
                  <h3
                    className="text-xl font-bold text-gray-900 dark:text-white"
                    dir="rtl"
                  >
                    {name}
                  </h3>
                </div>

                {/* Horizontal Line */}
                <div className="h-1 m-2 w-full rounded-full bg-sky-700 " />

                {/* Course Description - Centered */}
                <div className="text-center">
                  <p
                    className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-300"
                    dir="rtl"
                  >
                    {formatDescription(description, true, "", 80)}
                  </p>
                </div>

                {/* Horizontal Line */}
                <div className="h-1 m-2 w-full rounded-full bg-sky-700 " />

                <div className="flex md:flex-row md:justify-between flex-col md:items-center w-full">
                  <div className="md:space-y-1 flex md:flex-col flex-row-reverse justify-between">
                    {!is_subscribed && (
                      <>
                        <div
                          className={`text-center md:text-right -mt-6 md:mt-0 ${lemonada.className}`}
                        >
                          <div className="text-sky-500">
                            {price != 0 ? (
                              printUnit(price, "جنيه")
                            ) : (
                              <div className="border-sky-500 w-fit dark:text-sky-200 transition-all duration-300 bg-sky-100 dark:bg-sky-900 border rounded-md py-1 px-3">
                                كورس مجاني
                              </div>
                            )}
                          </div>
                          {price_before_discount &&
                          price_before_discount != 0 &&
                          price_before_discount > price ? (
                            <div className="flex flex-col md:flex-row gap-1">
                              <span className="text-gray-600 dark:text-gray-200 transition-all duration-300 opacity-75 ">
                                بدلاً من
                              </span>
                              <span className="line-through text-sky-600 text-sm font-semibold">
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
                  <CreatedAndUpadtedAtComponent
                    created_at={created_at}
                    id={id}
                    className="md:flex hidden"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center w-full !mt-auto pt-4">
                <CreatedAndUpadtedAtComponent
                  created_at={created_at}
                  id={id}
                  className="flex md:hidden w-1/2"
                />
                <div className="md:w-full w-1/2 flex flex-col space-y-1">
                  <Link
                    href={isAuthenticated ? `/courses/${id}` : `/courses/${id}`}
                    className="w-full"
                  >
                    <button
                      className={`border-2 transition-all duration-300 w-full rounded-xl px-4 py-2 ${
                        is_subscribed
                          ? "bg-sky-500 border-sky-500 dark:bg-sky-500 dark:border-sky-500 text-white hover:bg-sky-600"
                          : "bg-transparent border-sky-500 dark:border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
                      }`}
                    >
                      الدخول للكورس
                    </button>
                  </Link>
                  {!is_subscribed && price != 0 && (
                    <button
                      className="border-2 transition-all duration-300 w-full rounded-xl bg-sky-500 border-sky-500 dark:bg-sky-600 dark:border-sky-600 hover:bg-opacity-90 text-white px-4 py-2"
                      onClick={onSubscribeClick}
                    >
                      الإشتراك في الكورس !
                    </button>
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
