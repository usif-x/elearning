import { Icon } from "@iconify/react";
import Link from "next/link";

const CourseContentSection = ({
  lectures,
  activeLecture,
  setActiveLecture,
  courseId,
  lectureId,
  contentId,
}) => {
  const getContentIcon = (contentType) => {
    switch (contentType) {
      case "video":
        return {
          icon: "solar:videocamera-record-bold-duotone",
          color: "text-red-500",
          bg: "bg-red-100 dark:bg-red-900/30",
        };
      case "audio":
        return {
          icon: "solar:soundwave-bold-duotone",
          color: "text-purple-500",
          bg: "bg-purple-100 dark:bg-purple-900/30",
        };
      case "photo":
        return {
          icon: "solar:gallery-bold-duotone",
          color: "text-pink-500",
          bg: "bg-pink-100 dark:bg-pink-900/30",
        };
      case "file":
        return {
          icon: "solar:document-text-bold-duotone",
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "link":
        return {
          icon: "solar:link-bold-duotone",
          color: "text-cyan-500",
          bg: "bg-cyan-100 dark:bg-cyan-900/30",
        };
      case "quiz":
        return {
          icon: "solar:clipboard-list-bold-duotone",
          color: "text-amber-500",
          bg: "bg-amber-100 dark:bg-amber-900/30",
        };
      default:
        return {
          icon: "solar:document-bold-duotone",
          color: "text-gray-500",
          bg: "bg-gray-100 dark:bg-gray-900/30",
        };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
      <div className="text-center mb-6 sm:mb-10">
        <div className="flex items-center justify-center mb-4">
          <Icon
            icon="solar:notebook-bold-duotone"
            className="w-16 h-16 sm:w-20 sm:h-20 text-sky-500"
          />
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3"
          dir="rtl"
        >
          محتوى الكورس
        </h2>
        <p
          className="text-base sm:text-lg text-gray-600 dark:text-gray-400"
          dir="rtl"
        >
          استكشف جميع المحاضرات والدروس المتاحة في هذا الكورس
        </p>
        {lectures.length > 0 && (
          <div className="mt-4 inline-flex items-center space-x-2 space-x-reverse bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base">
            <Icon
              icon="mdi:folder-multiple"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="font-semibold">{lectures.length} محاضرة</span>
          </div>
        )}
      </div>

      {lectures.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setActiveLecture(
                    activeLecture === lecture.id ? null : lecture.id
                  )
                }
                className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-sky-50 hover:to-transparent dark:hover:from-sky-900/20 dark:hover:to-transparent transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
                  <div className="bg-sky-100 dark:bg-sky-900/30 p-2.5 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Icon
                      icon="solar:folder-with-files-bold-duotone"
                      className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500"
                    />
                  </div>
                  <div className="text-right">
                    <span
                      className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white block"
                      dir="rtl"
                    >
                      {lecture.name}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {lecture.contents?.length || 0} عنصر
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div
                    className={`transform transition-transform duration-200 ${
                      activeLecture === lecture.id ? "rotate-180" : ""
                    }`}
                  >
                    <Icon
                      icon="solar:alt-arrow-down-bold"
                      className="w-6 h-6 sm:w-7 sm:h-7 text-sky-500"
                    />
                  </div>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeLecture === lecture.id
                    ? "max-h-[2000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {lecture.contents && (
                  <div className="p-3 sm:p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50">
                    {lecture.contents.map((lectureContent) => {
                      const contentStyle = getContentIcon(
                        lectureContent.content_type
                      );
                      const isCurrentContent =
                        lectureContent.id === parseInt(contentId) &&
                        lecture.id === parseInt(lectureId);

                      return (
                        <Link
                          key={lectureContent.id}
                          href={`/courses/${courseId}/lecture/${lecture.id}/content/${lectureContent.id}`}
                          className={`block p-3 sm:p-4 rounded-lg transition-all duration-200 border-2 ${
                            isCurrentContent
                              ? "bg-sky-100 dark:bg-sky-900/30 border-sky-500 shadow-md"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center justify-between space-x-3 space-x-reverse">
                            <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
                              <div
                                className={`${contentStyle.bg} p-2 sm:p-2.5 rounded-lg flex-shrink-0`}
                              >
                                <Icon
                                  icon={contentStyle.icon}
                                  className={`w-5 h-5 sm:w-6 sm:h-6 ${contentStyle.color}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`font-semibold text-sm sm:text-base truncate ${
                                    isCurrentContent
                                      ? "text-sky-900 dark:text-sky-100"
                                      : "text-gray-900 dark:text-white"
                                  }`}
                                  dir="rtl"
                                >
                                  {lectureContent.title}
                                </h4>
                                <span
                                  className={`text-xs ${
                                    isCurrentContent
                                      ? "text-sky-600 dark:text-sky-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {lectureContent.content_type === "video"
                                    ? "فيديو"
                                    : lectureContent.content_type === "audio"
                                    ? "صوت"
                                    : lectureContent.content_type === "photo"
                                    ? "صورة"
                                    : lectureContent.content_type === "file"
                                    ? "ملف"
                                    : lectureContent.content_type === "link"
                                    ? "رابط"
                                    : lectureContent.content_type === "quiz"
                                    ? "اختبار"
                                    : "محتوى"}
                                </span>
                              </div>
                            </div>
                            {isCurrentContent && (
                              <div className="bg-sky-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                                الحالي
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <Icon
            icon="solar:file-corrupted-bold-duotone"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 text-gray-400"
          />
          <p className="text-lg sm:text-xl font-semibold" dir="rtl">
            لا يوجد محتوى متاح لهذا الكورس حالياً
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseContentSection;
