"use client";

import {
  getContent,
  getCourseById,
  getCourseLectures,
  getQuizAttempts,
} from "@/services/Courses";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
const CustomAudioPlayer = ({ audioUrl, title }) => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration)
      ) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", handleEnded);

    if (audio.readyState >= 1) {
      updateDuration();
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSkip = (seconds) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime += seconds;
    }
  };

  const handleSeek = (e) => {
    if (!duration) return;
    const percentage = Number(e.target.value);
    const seekTime = (percentage / 100) * duration;
    if (isFinite(seekTime)) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleProgressHover = (e) => {
    if (!progressBarRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const time = (percentage / 100) * duration;

    setHoverTime(time);
    setHoverPosition(percentage);
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const time = (percentage / 100) * duration;

    if (isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleProgressLeave = () => {
    setHoverTime(null);
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time) || !isFinite(time)) return "0:00";

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300">
        {/* Title & Time Display */}
        <div className="flex justify-between items-start mb-4">
          <h3
            className="text-base font-bold text-slate-800 dark:text-slate-100 truncate flex-1 mr-3"
            title={title}
          >
            {title || "Audio Track"}
          </h3>
          <div className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40 px-3 py-1.5 rounded-full whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Progress Bar with Hover Tooltip */}
        <div
          ref={progressBarRef}
          className="relative h-8 w-full mb-6 cursor-pointer"
          onMouseMove={handleProgressHover}
          onMouseLeave={handleProgressLeave}
          onClick={handleProgressClick}
        >
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-10 bg-slate-800 dark:bg-slate-700 text-white text-xs font-mono px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none z-30 whitespace-nowrap transform -translate-x-1/2"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800 dark:border-t-slate-700"></div>
              </div>
            </div>
          )}

          {/* Track Background */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-2 w-full bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden shadow-inner">
            {/* Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-75 ease-linear shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white border-3 border-sky-500 rounded-full shadow-lg pointer-events-none transition-all duration-75 ease-linear"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Restart */}
          <button
            onClick={handleRestart}
            className="p-2.5 rounded-full text-slate-500 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
            title="Restart"
          >
            <Icon icon="solar:restart-bold" className="w-5 h-5" />
          </button>

          {/* Transport Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSkip(-10)}
              className="p-2.5 rounded-full text-slate-600 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
              title="Rewind 10s"
            >
              <Icon
                icon="solar:rewind-10-seconds-back-bold"
                className="w-7 h-7"
              />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 hover:from-sky-500 hover:via-sky-600 hover:to-sky-700 text-white shadow-xl shadow-sky-300/50 dark:shadow-sky-900/30 transition-all duration-200 active:scale-95"
              title={isPlaying ? "Pause" : "Play"}
            >
              <Icon
                icon={isPlaying ? "solar:pause-bold" : "solar:play-bold"}
                className={`w-7 h-7 ${!isPlaying ? "ml-1" : ""}`}
              />
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-2.5 rounded-full text-slate-600 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
              title="Forward 10s"
            >
              <Icon
                icon="solar:rewind-10-seconds-forward-bold"
                className="w-7 h-7"
              />
            </button>
          </div>

          {/* Volume Control */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            {showVolume && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-600 z-30">
                <div className="h-28 w-8 flex items-center justify-center relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    orient="vertical"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider-vertical"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-1.5 h-full bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  </div>
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-t from-sky-400 to-sky-600 rounded-full pointer-events-none transition-all duration-75"
                    style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-full transition-all duration-200 active:scale-95 ${
                isMuted || volume === 0
                  ? "text-red-500 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50"
                  : "text-slate-500 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              <Icon
                icon={
                  isMuted || volume === 0
                    ? "solar:volume-cross-bold"
                    : volume < 0.5
                    ? "solar:volume-small-bold"
                    : "solar:volume-loud-bold"
                }
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-track {
          background: transparent;
          height: 6px;
          border-radius: 9999px;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: white;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          border: 3px solid #0ea5e9;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 6px;
          border-radius: 9999px;
        }

        input[type="range"]::-moz-range-thumb {
          background: white;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          border: 3px solid #0ea5e9;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        .volume-slider-vertical {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 100%;
          background: transparent;
          cursor: pointer;
          z-index: 10;
          position: relative;
        }

        .volume-slider-vertical::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: white;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          border: 3px solid #0ea5e9;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }

        .volume-slider-vertical::-moz-range-thumb {
          background: white;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          border: 3px solid #0ea5e9;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }

        .volume-slider-vertical::-webkit-slider-runnable-track {
          background: transparent;
          height: 100%;
        }

        .volume-slider-vertical::-moz-range-track {
          background: transparent;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

const ContentPage = () => {
  const { id: courseId, lectureId, contentId } = useParams();
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [incompleteAttempt, setIncompleteAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [attemptsPerPage] = useState(10);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentData, courseData, lecturesData] = await Promise.all([
          getContent(courseId, lectureId, contentId),
          getCourseById(courseId),
          getCourseLectures(courseId),
        ]);

        setContent(contentData);
        setCourse(courseData);
        setLectures(lecturesData);
        setActiveLecture(parseInt(lectureId));

        // Fetch quiz attempts if content is a quiz
        if (contentData.content_type === "quiz") {
          const attemptsData = await getQuizAttempts(
            courseId,
            lectureId,
            contentId,
            currentPage,
            attemptsPerPage
          );
          setQuizAttempts(attemptsData.completed_attempts || []);
          setIncompleteAttempt(attemptsData.incomplete_attempt || null);
          setTotalPages(attemptsData.total_pages || 1);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ أثناء تحميل المحتوى",
          confirmButtonText: "حسناً",
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lectureId && contentId) {
      fetchData();
    }
  }, [courseId, lectureId, contentId, currentPage, attemptsPerPage]);

  const handleStartQuiz = async () => {
    try {
      const result = await Swal.fire({
        title: "بدء اختبار جديد",
        text: "هل أنت متأكد من رغبتك في بدء محاولة جديدة؟",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "نعم، ابدأ",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#0ea5e9",
      });

      if (result.isConfirmed) {
        router.push(
          `/courses/${courseId}/lecture/${lectureId}/content/${contentId}/quiz/attempt`
        );
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء بدء الاختبار",
        confirmButtonText: "حسناً",
      });
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    try {
      // Extract video ID from various YouTube URL formats
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return null;
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return null;
    }
  };

  const renderContentViewer = () => {
    if (!content) return null;

    switch (content.content_type) {
      case "video":
        // Check if it's a YouTube video
        if (content.video_platform === "youtube") {
          const embedUrl = getYouTubeEmbedUrl(content.source);

          if (embedUrl) {
            return (
              <div className="flex justify-center">
                <div className="bg-black rounded-xl overflow-hidden w-full max-w-4xl">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      src={embedUrl}
                      title={content.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                </div>
              </div>
            );
          }
        }

        // Default video player for uploaded files
        return (
          <div className="flex justify-center">
            <div className="bg-black rounded-xl overflow-hidden w-full max-w-4xl">
              <video
                controls
                className="w-full h-auto"
                src={`${apiUrl}/storage/${content.source}`}
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
          </div>
        );

      case "photo":
        return (
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center w-full max-w-4xl">
              <Image
                src={`${apiUrl}/storage/${content.source}`}
                alt={content.title}
                width={1200}
                height={800}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        );

      case "audio":
        // Check if it's an Adilo audio link
        if (content.source && content.source.includes("adilo.bigcommand.com")) {
          return (
            <div className="flex justify-center">
              <div className="bg-black rounded-xl overflow-hidden w-full max-w-4xl">
                <div
                  style={{
                    maxWidth: "100%",
                    width: "auto",
                    height: "null",
                    position: "relative",
                    paddingTop: "95px",
                  }}
                >
                  <iframe
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                    allowTransparency="true"
                    src={`${content.source}?minified=true`}
                    frameBorder="0"
                    allowFullScreen
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                    oallowfullscreen="true"
                    msallowfullscreen="true"
                    scrolling="no"
                    title={content.title}
                  />
                </div>
              </div>
            </div>
          );
        }

        // Check if it's a direct audio link (foldr.space or other direct URLs)
        if (
          content.source &&
          (content.source.startsWith("http://") ||
            content.source.startsWith("https://"))
        ) {
          return (
            <CustomAudioPlayer
              audioUrl={content.source}
              title={content.title}
            />
          );
        }

        // Default audio player for uploaded files
        return (
          <CustomAudioPlayer
            audioUrl={`${apiUrl}/storage/${content.source}`}
            title={content.title}
          />
        );

      case "file":
        return (
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-12 w-full max-w-3xl">
              <div className="flex flex-col items-center space-y-6">
                <Icon
                  icon="solar:file-text-bold-duotone"
                  className="w-32 h-32 text-blue-500"
                />
                <h3
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  dir="rtl"
                >
                  {content.title}
                </h3>
                <p
                  className="text-gray-600 dark:text-gray-400 text-center max-w-md"
                  dir="rtl"
                >
                  {content.description}
                </p>
                <div className="flex gap-4 flex-wrap justify-center">
                  <a
                    href={`${apiUrl}/storage/${content.source}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Icon icon="solar:eye-bold" className="w-5 h-5" />
                    <span>عرض الملف</span>
                  </a>
                  <a
                    href={`${apiUrl}/storage/${content.source}`}
                    download
                    className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Icon icon="solar:download-bold" className="w-5 h-5" />
                    <span>تحميل الملف</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );

      case "link":
        return (
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-12 w-full max-w-3xl">
              <div className="flex flex-col items-center space-y-6">
                <Icon
                  icon="solar:link-circle-bold-duotone"
                  className="w-32 h-32 text-purple-500"
                />
                <h3
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  dir="rtl"
                >
                  {content.title}
                </h3>
                <p
                  className="text-gray-600 dark:text-gray-400 text-center max-w-md"
                  dir="rtl"
                >
                  {content.description}
                </p>
                <a
                  href={content.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Icon icon="solar:link-bold" className="w-5 h-5" />
                  <span>فتح الرابط</span>
                </a>
              </div>
            </div>
          </div>
        );

      case "quiz":
        return (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-center">
                <Icon
                  icon="solar:clipboard-list-bold-duotone"
                  className="w-24 h-24 text-indigo-500"
                />
              </div>

              <h3
                className="text-3xl font-bold text-gray-900 dark:text-white text-center"
                dir="rtl"
              >
                {content.title}
              </h3>

              {content.description && (
                <p
                  className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto"
                  dir="rtl"
                >
                  {content.description}
                </p>
              )}

              {/* Quiz Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                  <Icon
                    icon="solar:clock-circle-bold"
                    className="w-8 h-8 text-indigo-500 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    المدة
                  </p>
                  {content.content_type === "quiz" && content.quiz_duration && (
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {content.quiz_duration} دقيقة
                    </p>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                  <Icon
                    icon="solar:refresh-circle-bold"
                    className="w-8 h-8 text-indigo-500 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    عدد المحاولات
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {content.max_attempts}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                  <Icon
                    icon="solar:star-bold"
                    className="w-8 h-8 text-indigo-500 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    درجة النجاح
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {content.passing_score}%
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                  <Icon
                    icon="solar:question-circle-bold"
                    className="w-8 h-8 text-indigo-500 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    الأسئلة
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {content.randomize_questions ? "عشوائية" : "مرتبة"}
                  </p>
                </div>
              </div>

              {/* Quiz Attempts */}
              {(quizAttempts.length > 0 || incompleteAttempt) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-6xl mx-auto w-full">
                  <h4
                    className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4"
                    dir="rtl"
                  >
                    المحاولات السابقة
                  </h4>

                  {/* Mobile View - Cards */}
                  <div className="block lg:hidden space-y-4">
                    {/* Incomplete Attempt Card */}
                    {incompleteAttempt && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded">
                            قيد التنفيذ ⏳
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            جاري التنفيذ
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              الإجابات الصحيحة:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              - / {incompleteAttempt.total_questions}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              تاريخ البدء:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {new Date(
                                incompleteAttempt.started_at
                              ).toLocaleDateString("ar-EG")}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            router.push(
                              `/courses/${courseId}/lecture/${lectureId}/content/${contentId}/quiz/attempt`
                            )
                          }
                          className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 px-4 rounded transition-all"
                        >
                          متابعة الاختبار
                        </button>
                      </div>
                    )}

                    {/* Completed Attempts Cards */}
                    {quizAttempts.map((attempt, index) => (
                      <div
                        key={attempt.id}
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span
                            className={`text-xl font-bold ${
                              attempt.score >= content.passing_score
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {attempt.score}%
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            المحاولة #{quizAttempts.length - index}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              الإجابات الصحيحة:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {attempt.correct_answers} /{" "}
                              {attempt.total_questions}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              الوقت المستغرق:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {attempt.time_taken} دقيقة
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              تاريخ البدء:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {new Date(attempt.started_at).toLocaleDateString(
                                "ar-EG"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              تاريخ الانتهاء:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {attempt.completed_at
                                ? new Date(
                                    attempt.completed_at
                                  ).toLocaleDateString("ar-EG")
                                : "-"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          {attempt.is_completed &&
                          attempt.show_correct_answers ? (
                            <button
                              onClick={() =>
                                router.push(
                                  `/profile/quiz-result/${attempt.id}`
                                )
                              }
                              className="w-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold py-2 px-4 rounded transition-all"
                            >
                              عرض النتائج
                            </button>
                          ) : (
                            <span className="block text-center text-gray-400 dark:text-gray-600 text-xs">
                              النتائج غير متاحة
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View - Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            #
                          </th>
                          <th scope="col" className="px-6 py-3">
                            النتيجة
                          </th>
                          <th scope="col" className="px-6 py-3">
                            الإجابات الصحيحة
                          </th>
                          <th scope="col" className="px-6 py-3">
                            الوقت المستغرق
                          </th>
                          <th scope="col" className="px-6 py-3">
                            تاريخ البدء
                          </th>
                          <th scope="col" className="px-6 py-3">
                            تاريخ الانتهاء
                          </th>
                          <th scope="col" className="px-6 py-3">
                            الحالة
                          </th>
                          <th scope="col" className="px-6 py-3">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Incomplete Attempt (show first) */}
                        {incompleteAttempt && (
                          <tr
                            key={`incomplete-${incompleteAttempt.id}`}
                            className="bg-amber-50 dark:bg-amber-900/20 border-b dark:border-gray-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              جاري التنفيذ
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-400 dark:text-gray-500">
                                -
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900 dark:text-white">
                              - / {incompleteAttempt.total_questions}
                            </td>
                            <td className="px-6 py-4 text-gray-400 dark:text-gray-500">
                              -
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                              {new Date(
                                incompleteAttempt.started_at
                              ).toLocaleString("ar-EG")}
                            </td>
                            <td className="px-6 py-4 text-gray-400 dark:text-gray-500">
                              -
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded">
                                قيد التنفيذ ⏳
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/courses/${courseId}/lecture/${lectureId}/content/${contentId}/quiz/attempt`
                                  )
                                }
                                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-all"
                              >
                                متابعة الاختبار
                              </button>
                            </td>
                          </tr>
                        )}

                        {/* Completed Attempts */}
                        {quizAttempts.map((attempt, index) => (
                          <tr
                            key={attempt.id}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {quizAttempts.length - index}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-lg font-bold ${
                                  attempt.score >= content.passing_score
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {attempt.score}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900 dark:text-white">
                              {attempt.correct_answers} /{" "}
                              {attempt.total_questions}
                            </td>
                            <td className="px-6 py-4 text-gray-900 dark:text-white">
                              {attempt.time_taken} دقيقة
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                              {new Date(attempt.started_at).toLocaleString(
                                "ar-EG"
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                              {attempt.completed_at
                                ? new Date(attempt.completed_at).toLocaleString(
                                    "ar-EG"
                                  )
                                : "-"}
                            </td>
                            <td className="px-6 py-4">
                              {attempt.is_completed ? (
                                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded">
                                  مكتمل ✓
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-semibold px-2.5 py-0.5 rounded">
                                  قيد التنفيذ
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {attempt.is_completed ? (
                                attempt.show_correct_answers ? (
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/profile/quiz-result/${attempt.id}`
                                      )
                                    }
                                    className="text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
                                  >
                                    عرض النتائج
                                  </button>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-600 text-xs">
                                    النتائج غير متاحة
                                  </span>
                                )
                              ) : (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/courses/${courseId}/lecture/${lectureId}/content/${contentId}/quiz/attempt`
                                    )
                                  }
                                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-all"
                                >
                                  متابعة الاختبار
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div
                      className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                      dir="rtl"
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        صفحة {currentPage} من {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentPage === 1
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              : "bg-sky-500 hover:bg-sky-600 text-white"
                          }`}
                        >
                          <Icon
                            icon="solar:alt-arrow-right-linear"
                            className="w-5 h-5"
                          />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            // Show first, last, current, and adjacent pages
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 &&
                                pageNum <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                                    currentPage === pageNum
                                      ? "bg-sky-500 text-white"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === currentPage - 2 ||
                              pageNum === currentPage + 2
                            ) {
                              return (
                                <span
                                  key={pageNum}
                                  className="text-gray-400 dark:text-gray-600 px-2"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentPage === totalPages
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              : "bg-sky-500 hover:bg-sky-600 text-white"
                          }`}
                        >
                          <Icon
                            icon="solar:alt-arrow-left-linear"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Start Quiz Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleStartQuiz}
                  disabled={
                    incompleteAttempt ||
                    (content.max_attempts &&
                      quizAttempts.length >= content.max_attempts)
                  }
                  className={`font-semibold py-4 px-12 rounded-lg transition-all duration-200 flex items-center gap-3 text-lg ${
                    incompleteAttempt ||
                    (content.max_attempts &&
                      quizAttempts.length >= content.max_attempts)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  <Icon icon="solar:play-circle-bold" className="w-6 h-6" />
                  <span>
                    {incompleteAttempt
                      ? "لديك محاولة قيد التنفيذ"
                      : content.max_attempts &&
                        quizAttempts.length >= content.max_attempts
                      ? "لقد استنفذت جميع المحاولات"
                      : "بدء محاولة جديدة"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
            <Icon
              icon="mdi:file-question"
              className="w-24 h-24 text-gray-400 mx-auto mb-4"
            />
            <p className="text-gray-500 dark:text-gray-400">
              نوع محتوى غير مدعوم
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="w-12 h-12 text-sky-500 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل المحتوى...
          </p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">المحتوى غير موجود</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          dir="rtl"
        >
          <Link
            href="/courses"
            className="hover:text-sky-500 transition-colors"
          >
            الكورسات
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <Link
            href={`/courses/${courseId}`}
            className="hover:text-sky-500 transition-colors"
          >
            {course?.name}
          </Link>
          <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-semibold">
            {content.title}
          </span>
        </div>

        {/* Content Viewer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 p-6">
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center"
            dir="rtl"
          >
            {content.title}
          </h1>
          {renderContentViewer()}
        </div>

        {/* Course Lectures Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <Icon
                icon="solar:notebook-bold-duotone"
                className="w-20 h-20 text-sky-500"
              />
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3"
              dir="rtl"
            >
              محتوى الكورس
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400" dir="rtl">
              استكشف جميع المحاضرات والدروس المتاحة في هذا الكورس
            </p>
            {lectures.length > 0 && (
              <div className="mt-4 inline-flex items-center space-x-2 space-x-reverse bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-full">
                <Icon icon="mdi:folder-multiple" className="w-5 h-5" />
                <span className="font-semibold">{lectures.length} محاضرة</span>
              </div>
            )}
          </div>

          {lectures.length > 0 ? (
            <div className="space-y-6">
              {lectures.map((lecture, lectureIndex) => (
                <div
                  key={lecture.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${
                      lectureIndex * 0.1
                    }s both`,
                  }}
                >
                  <button
                    onClick={() =>
                      setActiveLecture(
                        activeLecture === lecture.id ? null : lecture.id
                      )
                    }
                    className="w-full p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-sky-50 hover:to-transparent dark:hover:from-sky-900/20 dark:hover:to-transparent transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="bg-sky-100 dark:bg-sky-900/30 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <Icon
                          icon="solar:folder-with-files-bold-duotone"
                          className="w-8 h-8 text-sky-500"
                        />
                      </div>
                      <div className="text-right">
                        <span
                          className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white block"
                          dir="rtl"
                        >
                          {lecture.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
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
                          className="w-7 h-7 text-sky-500"
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
                      <div className="p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50">
                        {lecture.contents.map(
                          (lectureContent, contentIndex) => {
                            const getContentIcon = () => {
                              switch (lectureContent.content_type) {
                                case "video":
                                  return {
                                    icon: "solar:play-circle-bold-duotone",
                                    color: "text-sky-500",
                                    bg: "bg-sky-100 dark:bg-sky-900/30",
                                  };
                                case "photo":
                                  return {
                                    icon: "solar:gallery-bold-duotone",
                                    color: "text-pink-500",
                                    bg: "bg-pink-100 dark:bg-pink-900/30",
                                  };
                                case "file":
                                  return {
                                    icon: "solar:file-text-bold-duotone",
                                    color: "text-blue-500",
                                    bg: "bg-blue-100 dark:bg-blue-900/30",
                                  };
                                case "audio":
                                  return {
                                    icon: "solar:music-library-bold-duotone",
                                    color: "text-purple-500",
                                    bg: "bg-purple-100 dark:bg-purple-900/30",
                                  };
                                case "quiz":
                                  return {
                                    icon: "solar:clipboard-list-bold-duotone",
                                    color: "text-indigo-500",
                                    bg: "bg-indigo-100 dark:bg-indigo-900/30",
                                  };
                                case "link":
                                  return {
                                    icon: "solar:link-bold-duotone",
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

                            const contentStyle = getContentIcon();
                            const isCurrentContent =
                              lectureContent.id === parseInt(contentId);

                            return (
                              <Link
                                key={lectureContent.id}
                                href={`/courses/${courseId}/lecture/${lecture.id}/content/${lectureContent.id}`}
                                className={`block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 ${
                                  isCurrentContent ? "ring-2 ring-sky-500" : ""
                                }`}
                              >
                                <div className="p-3 flex items-center justify-between">
                                  <div className="flex items-center space-x-3 space-x-reverse flex-1">
                                    <div
                                      className={`${contentStyle.bg} p-2 rounded-lg`}
                                    >
                                      <Icon
                                        icon={contentStyle.icon}
                                        className={`w-5 h-5 ${contentStyle.color}`}
                                      />
                                    </div>
                                    <div className="flex-1 text-right">
                                      <span
                                        className="text-sm md:text-base font-semibold text-gray-900 dark:text-white block"
                                        dir="rtl"
                                      >
                                        {lectureContent.title}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {lectureContent.content_type === "video"
                                          ? "فيديو"
                                          : lectureContent.content_type ===
                                            "photo"
                                          ? "صورة"
                                          : lectureContent.content_type ===
                                            "file"
                                          ? "ملف"
                                          : lectureContent.content_type ===
                                            "audio"
                                          ? "صوت"
                                          : lectureContent.content_type ===
                                            "quiz"
                                          ? "اختبار"
                                          : lectureContent.content_type ===
                                            "link"
                                          ? "رابط"
                                          : lectureContent.content_type}
                                      </span>
                                    </div>
                                  </div>
                                  {isCurrentContent && (
                                    <div className="bg-sky-500 text-white text-xs font-bold py-1 px-3 rounded-full">
                                      جاري العرض
                                    </div>
                                  )}
                                </div>
                              </Link>
                            );
                          }
                        )}
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
                className="w-24 h-24 mx-auto mb-6 text-gray-400"
              />
              <p className="text-xl font-semibold" dir="rtl">
                لا يوجد محتوى متاح لهذا الكورس حالياً
              </p>
            </div>
          )}
        </div>

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ContentPage;
