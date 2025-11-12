"use client";

import { Icon } from "@iconify/react";
import { useRef, useState } from "react";

// Fake data for groups
const fakeGroups = [
  {
    id: 1,
    name: "مجموعة الكيمياء العامة",
    description: "مجموعة لمناقشة مواضيع الكيمياء العامة والتفاعلات الكيميائية",
    members: 245,
    posts: 89,
    cover: "/images/hero.svg",
    icon: "solar:atom-bold-duotone",
    color: "sky",
  },
  {
    id: 2,
    name: "مجموعة الفيزياء",
    description: "نقاش حول القوانين الفيزيائية والتجارب العملية",
    members: 189,
    posts: 56,
    cover: "/images/hero.svg",
    icon: "solar:lightbulb-bolt-bold-duotone",
    color: "purple",
  },
  {
    id: 3,
    name: "مجموعة الرياضيات",
    description: "حل المسائل الرياضية ومشاركة الأفكار",
    members: 312,
    posts: 124,
    cover: "/images/hero.svg",
    icon: "solar:calculator-bold-duotone",
    color: "blue",
  },
  {
    id: 4,
    name: "مجموعة البرمجة",
    description: "تعلم البرمجة ومشاركة المشاريع والخبرات",
    members: 428,
    posts: 201,
    cover: "/images/hero.svg",
    icon: "solar:code-bold-duotone",
    color: "green",
  },
];

// Fake data for posts
const fakePosts = [
  {
    id: 1,
    groupId: 1,
    author: {
      name: "أحمد محمد",
      avatar: null,
      role: "طالب",
    },
    content:
      "هل يمكن لأحد أن يشرح لي الفرق بين التفاعلات الطاردة والماصة للحرارة؟",
    timestamp: "منذ ساعتين",
    likes: 12,
    comments: 8,
    isLiked: false,
    type: "text", // text, audio, image
  },
  {
    id: 2,
    groupId: 1,
    author: {
      name: "فاطمة علي",
      avatar: null,
      role: "طالبة",
    },
    content: "شكراً للأستاذ على الشرح الرائع في محاضرة اليوم! استفدت كثيراً 🙏",
    timestamp: "منذ 3 ساعات",
    likes: 24,
    comments: 5,
    isLiked: true,
    type: "text",
  },
  {
    id: 3,
    groupId: 1,
    author: {
      name: "محمود حسن",
      avatar: null,
      role: "طالب",
    },
    content:
      "هل يوجد ملخص لدرس التفاعلات الكيميائية؟ أحتاجه للمراجعة قبل الامتحان",
    timestamp: "منذ 5 ساعات",
    likes: 18,
    comments: 12,
    isLiked: false,
    type: "text",
  },
  {
    id: 4,
    groupId: 1,
    author: {
      name: "سارة إبراهيم",
      avatar: null,
      role: "طالبة",
    },
    content:
      "قمت بتجربة التفاعل في المعمل اليوم وكانت النتائج رائعة! سأشارك الفيديو قريباً 🔬",
    timestamp: "منذ يوم",
    likes: 35,
    comments: 15,
    isLiked: true,
    type: "image",
    images: ["/images/hero.svg", "/images/hero.svg"],
  },
  {
    id: 5,
    groupId: 1,
    author: {
      name: "خالد أحمد",
      avatar: null,
      role: "طالب",
    },
    content: "سجلت شرح صوتي لموضوع التفاعلات الكيميائية، أتمنى أن يفيدكم!",
    timestamp: "منذ 3 ساعات",
    likes: 28,
    comments: 9,
    isLiked: false,
    type: "audio",
    audioDuration: "2:45",
  },
  {
    id: 6,
    groupId: 1,
    author: {
      name: "نور محمود",
      avatar: null,
      role: "طالبة",
    },
    content: "هذه صورة من الكتاب توضح الجدول الدوري بشكل مفصل للمراجعة",
    timestamp: "منذ 6 ساعات",
    likes: 42,
    comments: 18,
    isLiked: true,
    type: "image",
    images: ["/images/hero.svg"],
  },
];

const Community = () => {
  const [selectedGroup, setSelectedGroup] = useState(fakeGroups[0]);
  const [posts, setPosts] = useState(fakePosts);
  const [newPost, setNewPost] = useState("");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);
  const [imageRotation, setImageRotation] = useState(0);
  const audioRefs = useRef({});

  const getColorClasses = (color) => {
    const colors = {
      sky: {
        bg: "bg-sky-500",
        lightBg: "bg-sky-100 dark:bg-sky-900/30",
        text: "text-sky-500",
        border: "border-sky-500",
      },
      purple: {
        bg: "bg-purple-500",
        lightBg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-500",
        border: "border-purple-500",
      },
      blue: {
        bg: "bg-blue-500",
        lightBg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-500",
        border: "border-blue-500",
      },
      green: {
        bg: "bg-green-500",
        lightBg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-500",
        border: "border-green-500",
      },
    };
    return colors[color] || colors.sky;
  };

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        groupId: selectedGroup.id,
        author: {
          name: "أنت",
          avatar: null,
          role: "طالب",
        },
        content: newPost,
        timestamp: "الآن",
        likes: 0,
        comments: 0,
        isLiked: false,
        type: "text",
      };
      setPosts([post, ...posts]);
      setNewPost("");
    }
  };

  const handlePlayAudio = (postId) => {
    const audio = audioRefs.current[postId];
    if (!audio) return;

    if (playingAudio === postId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Pause all other audios
      Object.keys(audioRefs.current).forEach((key) => {
        if (audioRefs.current[key] && key !== String(postId)) {
          audioRefs.current[key].pause();
        }
      });
      audio.play();
      setPlayingAudio(postId);
    }
  };

  const handleAudioTimeUpdate = (postId) => {
    const audio = audioRefs.current[postId];
    if (!audio) return;

    const progress = (audio.currentTime / audio.duration) * 100;
    const currentTime = formatTime(audio.currentTime);
    const duration = formatTime(audio.duration);

    setAudioProgress((prev) => ({
      ...prev,
      [postId]: { progress, currentTime, duration },
    }));
  };

  const handleAudioEnded = (postId) => {
    setPlayingAudio(null);
    setAudioProgress((prev) => ({
      ...prev,
      [postId]: {
        progress: 0,
        currentTime: "0:00",
        duration: prev[postId]?.duration || "0:00",
      },
    }));
  };

  const handleSeekAudio = (postId, e) => {
    const audio = audioRefs.current[postId];
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleImageClick = (image) => {
    setExpandedImage(image);
    setImageRotation(0);
  };

  const handleRotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleCloseModal = () => {
    setExpandedImage(null);
    setImageRotation(0);
  };

  const groupPosts = posts.filter((post) => post.groupId === selectedGroup.id);
  const colorClasses = getColorClasses(selectedGroup.color);

  // Display logic
  const displayedGroups = showAllGroups ? fakeGroups : fakeGroups.slice(0, 3);
  const displayedPosts = showAllPosts ? groupPosts : groupPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Icon
              icon="solar:users-group-rounded-bold-duotone"
              className="w-16 h-16 text-sky-500"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            منتدى الطلاب
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            انضم إلى المجموعات وشارك أفكارك وخبراتك مع زملائك
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Groups Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Icon icon="solar:folder-with-files-bold" className="w-6 h-6" />
                المجموعات المتاحة
              </h2>
              <div className="space-y-3">
                {displayedGroups.map((group) => {
                  const groupColors = getColorClasses(group.color);
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full p-4 rounded-xl transition-all duration-300 text-right ${
                        selectedGroup.id === group.id
                          ? `${groupColors.bg} text-white shadow-lg`
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedGroup.id === group.id
                              ? "bg-white/20"
                              : groupColors.lightBg
                          }`}
                        >
                          <Icon
                            icon={group.icon}
                            className={`w-6 h-6 ${
                              selectedGroup.id === group.id
                                ? "text-white"
                                : groupColors.text
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-bold text-sm ${
                              selectedGroup.id === group.id
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {group.name}
                          </h3>
                          <div
                            className={`flex items-center gap-3 text-xs mt-1 ${
                              selectedGroup.id === group.id
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <Icon
                                icon="solar:user-bold"
                                className="w-3 h-3"
                              />
                              {group.members}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon
                                icon="solar:chat-line-bold"
                                className="w-3 h-3"
                              />
                              {group.posts}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Show More Button for Groups */}
              {fakeGroups.length > 3 && (
                <button
                  onClick={() => setShowAllGroups(!showAllGroups)}
                  className="w-full mt-4 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Icon
                    icon={
                      showAllGroups
                        ? "solar:alt-arrow-up-bold"
                        : "solar:alt-arrow-down-bold"
                    }
                    className="w-5 h-5"
                  />
                  <span>{showAllGroups ? "عرض أقل" : "عرض المزيد"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Group Header */}
            <div
              className={`${colorClasses.bg} text-white rounded-2xl shadow-lg overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Icon icon={selectedGroup.icon} className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
                    <p className="text-white/80 text-sm mt-1">
                      {selectedGroup.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      className="w-5 h-5"
                    />
                    <span>{selectedGroup.members} عضو</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:chat-round-line-bold"
                      className="w-5 h-5"
                    />
                    <span>{selectedGroup.posts} منشور</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Post */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
                  <Icon icon="solar:user-bold" className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="شارك أفكارك مع المجموعة..."
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:border-sky-500 transition-colors"
                    rows="3"
                    dir="rtl"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Icon
                          icon="solar:gallery-bold"
                          className="w-5 h-5 text-gray-600 dark:text-gray-400"
                        />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Icon
                          icon="solar:video-library-bold"
                          className="w-5 h-5 text-gray-600 dark:text-gray-400"
                        />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Icon
                          icon="solar:link-bold"
                          className="w-5 h-5 text-gray-600 dark:text-gray-400"
                        />
                      </button>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim()}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        newPost.trim()
                          ? `${colorClasses.bg} text-white hover:opacity-80`
                          : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      نشر
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {groupPosts.length > 0 ? (
                <>
                  {displayedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Post Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          <Icon icon="solar:user-bold" className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {post.author.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {post.author.role} • {post.timestamp}
                              </p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <Icon
                                icon="solar:menu-dots-bold"
                                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p
                        className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
                        dir="rtl"
                      >
                        {post.content}
                      </p>

                      {/* Audio Player */}
                      {post.type === "audio" && (
                        <div className="mb-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-4 rounded-xl border-2 border-sky-200 dark:border-sky-800">
                          <audio
                            ref={(el) => (audioRefs.current[post.id] = el)}
                            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                            onTimeUpdate={() => handleAudioTimeUpdate(post.id)}
                            onEnded={() => handleAudioEnded(post.id)}
                            onLoadedMetadata={() =>
                              handleAudioTimeUpdate(post.id)
                            }
                            className="hidden"
                          />
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handlePlayAudio(post.id)}
                              className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-colors shadow-lg"
                            >
                              <Icon
                                icon={
                                  playingAudio === post.id
                                    ? "solar:pause-bold"
                                    : "solar:play-bold"
                                }
                                className="w-6 h-6"
                              />
                            </button>
                            <div className="flex-1">
                              <div
                                className="h-2 bg-sky-200 dark:bg-sky-800 rounded-full overflow-hidden cursor-pointer"
                                onClick={(e) => handleSeekAudio(post.id, e)}
                              >
                                <div
                                  className="h-full bg-sky-500 rounded-full transition-all duration-150"
                                  style={{
                                    width: `${
                                      audioProgress[post.id]?.progress || 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {audioProgress[post.id]?.currentTime ||
                                    "0:00"}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {audioProgress[post.id]?.duration ||
                                    post.audioDuration}
                                </span>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-lg transition-colors">
                              <Icon
                                icon="solar:download-bold"
                                className="w-5 h-5 text-sky-600 dark:text-sky-400"
                              />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Images */}
                      {post.type === "image" && post.images && (
                        <div
                          className={`mb-4 grid gap-2 ${
                            post.images.length === 1
                              ? "grid-cols-1"
                              : "grid-cols-2"
                          }`}
                        >
                          {post.images.map((image, index) => (
                            <div
                              key={index}
                              onClick={() => handleImageClick(image)}
                              className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-sky-500 dark:hover:border-sky-500 transition-colors cursor-pointer group"
                            >
                              <img
                                src={image}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <Icon
                                  icon="solar:eye-bold"
                                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 transition-colors ${
                            post.isLiked
                              ? "text-red-500"
                              : "text-gray-600 dark:text-gray-400 hover:text-red-500"
                          }`}
                        >
                          <Icon
                            icon={
                              post.isLiked
                                ? "solar:heart-bold"
                                : "solar:heart-linear"
                            }
                            className="w-5 h-5"
                          />
                          <span className="text-sm font-medium">
                            {post.likes}
                          </span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors">
                          <Icon
                            icon="solar:chat-round-line-bold"
                            className="w-5 h-5"
                          />
                          <span className="text-sm font-medium">
                            {post.comments}
                          </span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors">
                          <Icon icon="solar:share-bold" className="w-5 h-5" />
                          <span className="text-sm font-medium">مشاركة</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Show More Button for Posts */}
                  {groupPosts.length > 3 && (
                    <button
                      onClick={() => setShowAllPosts(!showAllPosts)}
                      className={`w-full py-4 px-6 ${colorClasses.bg} hover:opacity-90 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg`}
                    >
                      <Icon
                        icon={
                          showAllPosts
                            ? "solar:alt-arrow-up-bold"
                            : "solar:alt-arrow-down-bold"
                        }
                        className="w-5 h-5"
                      />
                      <span>
                        {showAllPosts ? "عرض أقل" : "عرض المزيد من المنشورات"}
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <Icon
                    icon="solar:chat-line-bold-duotone"
                    className="w-24 h-24 mx-auto mb-4 text-gray-400"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    لا توجد منشورات بعد
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    كن أول من ينشر في هذه المجموعة!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Expand Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              <Icon
                icon="solar:close-circle-bold"
                className="w-8 h-8 text-white"
              />
            </button>

            {/* Rotate Button */}
            <button
              onClick={handleRotateImage}
              className="absolute top-4 left-4 z-10 w-12 h-12 bg-sky-500 hover:bg-sky-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <Icon icon="solar:restart-bold" className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ transform: `rotate(${imageRotation}deg)` }}
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
              <p className="text-white text-sm flex items-center gap-2">
                <Icon icon="solar:gallery-bold-duotone" className="w-5 h-5" />
                <span>اضغط على الصورة للتكبير • استخدم زر الدوران للتدوير</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
