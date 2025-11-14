"use client";

import { useAuthStore } from "@/hooks/useAuth";
import {
  addPostMedia,
  addReaction,
  createComment,
  createPost,
  deletePost,
  getComments,
  getCommunities,
  getPosts,
  joinCommunity,
  leaveCommunity,
  removeReaction,
} from "@/services/Community";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

// Icon mapping for communities
const communityIcons = [
  { icon: "solar:atom-bold-duotone", color: "sky" },
  { icon: "solar:lightbulb-bolt-bold-duotone", color: "purple" },
  { icon: "solar:calculator-bold-duotone", color: "blue" },
  { icon: "solar:code-bold-duotone", color: "green" },
  { icon: "solar:book-bold-duotone", color: "red" },
  { icon: "solar:cup-star-bold-duotone", color: "orange" },
];

const Community = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000";
  const { user } = useAuthStore();
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);
  const audioRefs = useRef({});
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Fetch communities on mount
  useEffect(() => {
    fetchCommunities();
  }, []);

  // Fetch posts when community changes
  useEffect(() => {
    if (selectedCommunity) {
      setCurrentPage(1);
      setPosts([]);
      setHasMorePosts(true);
      fetchPosts(selectedCommunity.id, 1);
    }
  }, [selectedCommunity]);

  const fetchCommunities = async (search = "") => {
    try {
      setLoading(true);
      const data = await getCommunities(1, 50, null, search || null);
      console.log("Communities data:", data);
      if (data && Array.isArray(data) && data.length > 0) {
        // Add icon and color to communities
        const communitiesWithIcons = data.map((community, index) => ({
          ...community,
          icon: communityIcons[index % communityIcons.length].icon,
          color: communityIcons[index % communityIcons.length].color,
        }));
        setCommunities(communitiesWithIcons);
        if (!selectedCommunity || search) {
          setSelectedCommunity(communitiesWithIcons[0]);
        }
      } else {
        setCommunities([]);
        if (!search) {
          setSelectedCommunity(null);
        }
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("فشل في تحميل المجموعات");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (communityId, page = 1) => {
    try {
      if (page === 1) {
        setPostsLoading(true);
      } else {
        setLoadingMorePosts(true);
      }

      const data = await getPosts(communityId, page, 5);

      // Transform backend data to frontend format
      const transformedPosts = data.map((post) => {
        // Determine post type based on media
        let type = "text";
        let images = [];
        let audioDuration = null;

        if (post.media && post.media.length > 0) {
          const hasImage = post.media.some((m) => m.media_type === "image");
          const hasAudio = post.media.some((m) => m.media_type === "audio");

          if (hasImage) {
            type = "image";
            images = post.media
              .filter((m) => m.media_type === "image")
              .map((m) => `${API_URL}/storage/${m.media_url}`);
          } else if (hasAudio) {
            type = "audio";
            const audioMedia = post.media.find((m) => m.media_type === "audio");
            if (audioMedia && audioMedia.duration) {
              audioDuration = formatTime(audioMedia.duration);
            }
          }
        }

        return {
          id: post.id,
          communityId: post.community_id,
          author: {
            name:
              post.author?.id === user?.id
                ? "أنت"
                : post.author?.full_name ||
                  post.author?.telegram_username ||
                  "مستخدم",
            avatar: post.author?.profile_picture,
            role: post.author?.user_type === "teacher" ? "معلم" : "طالب",
          },
          content: post.content,
          timestamp: formatTimestamp(post.created_at),
          likes: post.reactions_count || 0,
          comments: post.comments_count || 0,
          isLiked: post.user_reaction === "like",
          type,
          images,
          audioDuration,
          audioUrl: post.media?.find((m) => m.media_type === "audio")?.media_url
            ? `${API_URL}/storage/${
                post.media.find((m) => m.media_type === "audio").media_url
              }`
            : null,
          isPinned: post.is_pinned,
          isEdited: post.is_edited,
        };
      });

      if (page === 1) {
        setPosts(transformedPosts);
      } else {
        setPosts((prev) => [...prev, ...transformedPosts]);
      }

      // Check if there are more posts
      setHasMorePosts(transformedPosts.length === 5);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("فشل في تحميل المنشورات");
    } finally {
      setPostsLoading(false);
      setLoadingMorePosts(false);
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString("ar-EG");
  };

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

  const handleLike = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        await removeReaction(postId);
      } else {
        await addReaction(postId, "like");
      }

      // Update local state
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("فشل في تحديث الإعجاب");
    }
  };

  const handleCreatePost = async () => {
    if (
      (!newPost.trim() && selectedImages.length === 0 && !selectedAudio) ||
      !selectedCommunity
    )
      return;

    try {
      // Create the post first
      const data = await createPost(selectedCommunity.id, {
        content: newPost.trim() || "شارك محتوى جديد",
        is_pinned: false,
      });

      // Upload images if any
      if (selectedImages.length > 0) {
        setUploadingMedia(true);
        for (const image of selectedImages) {
          await addPostMedia(data.id, image, "image");
        }
      }

      // Upload audio if any
      if (selectedAudio) {
        setUploadingMedia(true);
        await addPostMedia(data.id, selectedAudio, "audio");
      }

      // Clear form
      setNewPost("");
      setSelectedImages([]);
      setSelectedAudio(null);
      setUploadingMedia(false);

      toast.success("تم نشر المنشور بنجاح");

      // Refresh posts from the beginning
      setCurrentPage(1);
      setPosts([]);
      setHasMorePosts(true);
      await fetchPosts(selectedCommunity.id, 1);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("فشل في نشر المنشور");
      setUploadingMedia(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 4) {
      toast.error("يمكنك رفع حتى 4 صور فقط");
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
    setSelectedAudio(null); // Clear audio if images selected
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAudio(file);
      setSelectedImages([]); // Clear images if audio selected
    }
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const removeSelectedAudio = () => {
    setSelectedAudio(null);
  };

  const handleJoinCommunity = async (communityId, communityIsPublic = true) => {
    // Check if community is private
    if (!communityIsPublic) {
      // Show invite code modal for private communities
      setJoiningCommunityId(communityId);
      setShowInviteCodeModal(true);
      return;
    }

    // For public communities, join directly
    try {
      await joinCommunity(communityId, null);
      toast.success("تم الانضمام إلى المجموعة بنجاح");
      await fetchCommunities();
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error("فشل في الانضمام إلى المجموعة");
    }
  };

  const handleJoinWithInviteCode = async () => {
    if (!inviteCode.trim()) {
      toast.error("الرجاء إدخال رمز الدعوة");
      return;
    }

    try {
      await joinCommunity(joiningCommunityId, inviteCode.trim());
      toast.success("تم الانضمام إلى المجموعة بنجاح");
      setShowInviteCodeModal(false);
      setInviteCode("");
      setJoiningCommunityId(null);
      await fetchCommunities();
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error(
        error.response?.data?.detail || "فشل في الانضمام إلى المجموعة"
      );
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    if (!confirm("هل أنت متأكد من الخروج من هذه المجموعة؟")) return;

    try {
      await leaveCommunity(communityId);
      toast.success("تم الخروج من المجموعة بنجاح");
      await fetchCommunities();
    } catch (error) {
      console.error("Error leaving community:", error);
      toast.error("فشل في الخروج من المجموعة");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;

    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("تم حذف المنشور بنجاح");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("فشل في حذف المنشور");
    }
  };

  const handleSearch = () => {
    fetchCommunities(searchQuery);
  };

  const handleLoadMorePosts = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosts(selectedCommunity.id, nextPage);
  };

  const toggleComments = async (postId) => {
    if (showCommentsFor === postId) {
      setShowCommentsFor(null);
    } else {
      setShowCommentsFor(postId);
      if (!comments[postId]) {
        await fetchComments(postId);
      }
    }
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      const data = await getComments(postId, 1, 50);
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("فشل في تحميل التعليقات");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCreateComment = async (postId) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      const data = await createComment(postId, { content });

      // Add comment to local state
      setComments((prev) => ({
        ...prev,
        [postId]: [data, ...(prev[postId] || [])],
      }));

      // Update comment count in posts
      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, comments: p.comments + 1 } : p
        )
      );

      // Clear input
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      toast.success("تم إضافة التعليق بنجاح");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("فشل في إضافة التعليق");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="svg-spinners:180-ring-with-bg"
            className="w-16 h-16 text-sky-500 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل المجموعات...
          </p>
        </div>
      </div>
    );
  }

  if (!selectedCommunity || communities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Icon
              icon="solar:users-group-rounded-bold-duotone"
              className="w-24 h-24 mx-auto mb-4 text-gray-400"
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              لا توجد مجموعات متاحة
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              لم يتم العثور على أي مجموعات في الوقت الحالي
            </p>
          </div>
        </div>
      </div>
    );
  }

  const colorClasses = getColorClasses(selectedCommunity.color);

  // Display logic
  const displayedGroups = showAllGroups ? communities : communities.slice(0, 3);

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
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            انضم إلى المجموعات وشارك أفكارك وخبراتك مع زملائك
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="ابحث عن مجموعة..."
                className="w-full px-6 py-4 pr-14 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
                dir="rtl"
              />
              <button
                onClick={handleSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-sky-500 hover:bg-sky-600 rounded-xl flex items-center justify-center transition-colors"
              >
                <Icon
                  icon="solar:magnifer-bold"
                  className="w-5 h-5 text-white"
                />
              </button>
            </div>
          </div>
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
                {displayedGroups.map((community) => {
                  return (
                    <button
                      key={community.id}
                      onClick={() => setSelectedCommunity(community)}
                      className={`w-full p-4 rounded-xl transition-all duration-300 text-right ${
                        selectedCommunity.id === community.id
                          ? "bg-sky-500 text-white shadow-lg"
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedCommunity.id === community.id
                              ? "bg-white/20"
                              : "bg-gray-200 dark:bg-gray-600"
                          }`}
                        >
                          <Icon
                            icon="solar:users-group-rounded-bold-duotone"
                            className={`w-6 h-6 ${
                              selectedCommunity.id === community.id
                                ? "text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-bold text-sm ${
                              selectedCommunity.id === community.id
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {community.name}
                          </h3>
                          <div
                            className={`flex items-center gap-3 text-xs mt-1 ${
                              selectedCommunity.id === community.id
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <Icon
                                icon="solar:user-bold"
                                className="w-3 h-3"
                              />
                              {community.members_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon
                                icon="solar:chat-line-bold"
                                className="w-3 h-3"
                              />
                              {community.posts_count || 0}
                            </span>
                            {community.is_member && (
                              <span className="flex items-center gap-1">
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="w-3 h-3"
                                />
                                عضو
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Show More Button for Groups */}
              {communities.length > 3 && (
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
            {/* Community Header */}
            <div
              className={`${colorClasses.bg} text-white rounded-2xl shadow-lg overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Icon icon={selectedCommunity.icon} className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedCommunity.name}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      {selectedCommunity.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      className="w-5 h-5"
                    />
                    <span>{selectedCommunity.members_count || 0} عضو</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:chat-round-line-bold"
                      className="w-5 h-5"
                    />
                    <span>{selectedCommunity.posts_count || 0} منشور</span>
                  </div>
                  {!selectedCommunity.is_public && (
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="solar:lock-password-bold"
                        className="w-5 h-5"
                      />
                      <span>خاصة</span>
                    </div>
                  )}
                </div>

                {/* Join/Leave Button */}
                <div className="mt-4 flex items-center gap-3">
                  {selectedCommunity.is_member ? (
                    <button
                      onClick={() => handleLeaveCommunity(selectedCommunity.id)}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                    >
                      <Icon icon="solar:logout-2-bold" className="w-5 h-5" />
                      <span>مغادرة المجموعة</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleJoinCommunity(
                          selectedCommunity.id,
                          selectedCommunity.is_public
                        )
                      }
                      className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                    >
                      <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                      <span>انضم الآن</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      router.push(`/community/${selectedCommunity.id}`)
                    }
                    className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                  >
                    <Icon icon="solar:folder-open-bold" className="w-5 h-5" />
                    <span>فتح المجموعة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Create Post */}
            {selectedCommunity.is_member && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold flex-shrink-0">
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

                    {/* Media Preview */}
                    {selectedImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {selectedImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <button
                              onClick={() => removeSelectedImage(index)}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Icon
                                icon="solar:close-circle-bold"
                                className="w-5 h-5 text-white"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedAudio && (
                      <div className="mt-3 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border-2 border-sky-200 dark:border-sky-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon
                            icon="solar:microphone-bold-duotone"
                            className="w-6 h-6 text-sky-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedAudio.name}
                          </span>
                        </div>
                        <button
                          onClick={removeSelectedAudio}
                          className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-lg transition-colors"
                        >
                          <Icon
                            icon="solar:trash-bin-2-bold"
                            className="w-5 h-5 text-red-500"
                          />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          disabled={selectedAudio !== null}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon
                            icon="solar:gallery-bold"
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                          />
                        </button>

                        <input
                          ref={audioInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioSelect}
                          className="hidden"
                        />
                        <button
                          onClick={() => audioInputRef.current?.click()}
                          disabled={selectedImages.length > 0}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon
                            icon="solar:microphone-bold"
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                          />
                        </button>
                      </div>
                      <button
                        onClick={handleCreatePost}
                        disabled={
                          (!newPost.trim() &&
                            selectedImages.length === 0 &&
                            !selectedAudio) ||
                          uploadingMedia
                        }
                        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                          (newPost.trim() ||
                            selectedImages.length > 0 ||
                            selectedAudio) &&
                          !uploadingMedia
                            ? `${colorClasses.bg} text-white hover:opacity-80`
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {uploadingMedia ? (
                          <>
                            <Icon
                              icon="svg-spinners:180-ring"
                              className="w-5 h-5"
                            />
                            <span>جاري الرفع...</span>
                          </>
                        ) : (
                          <span>نشر</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts */}
            <div className="space-y-4">
              {!selectedCommunity.is_public && !selectedCommunity.is_member ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <Icon
                    icon="solar:lock-password-bold-duotone"
                    className="w-24 h-24 mx-auto mb-4 text-gray-400"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    مجموعة خاصة
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    لا يمكن عرض المنشورات حتى تنضم إلى المجموعة
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    تحتاج إلى رمز دعوة للانضمام إلى هذه المجموعة
                  </p>
                </div>
              ) : postsLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <Icon
                    icon="svg-spinners:180-ring-with-bg"
                    className="w-12 h-12 text-sky-500 mx-auto mb-4"
                  />
                  <p className="text-gray-600 dark:text-gray-400">
                    جاري تحميل المنشورات...
                  </p>
                </div>
              ) : posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Post Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold">
                            <Icon icon="solar:user-bold" className="w-6 h-6" />
                          </div>
                        )}
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
                            <div className="flex items-center gap-2">
                              {post.isPinned && (
                                <div className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                  <Icon
                                    icon="solar:pin-bold"
                                    className="w-4 h-4 text-sky-500"
                                  />
                                </div>
                              )}
                              {post.isEdited && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  معدل
                                </span>
                              )}
                            </div>
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
                      {post.type === "audio" && post.audioUrl && (
                        <div className="mb-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-4 rounded-xl border-2 border-sky-200 dark:border-sky-800">
                          <audio
                            ref={(el) => (audioRefs.current[post.id] = el)}
                            src={post.audioUrl}
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
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors"
                        >
                          <Icon
                            icon="solar:chat-round-line-bold"
                            className="w-5 h-5"
                          />
                          <span className="text-sm font-medium">
                            {post.comments}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/community/${post.communityId}/posts/${post.id}`;
                            navigator.clipboard.writeText(url);
                            toast.success("تم نسخ رابط المنشور");
                          }}
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors"
                        >
                          <Icon icon="solar:share-bold" className="w-5 h-5" />
                          <span className="text-sm font-medium">مشاركة</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showCommentsFor === post.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {/* Add Comment */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                              <Icon
                                icon="solar:user-bold"
                                className="w-5 h-5"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newComment[post.id] || ""}
                                  onChange={(e) =>
                                    setNewComment((prev) => ({
                                      ...prev,
                                      [post.id]: e.target.value,
                                    }))
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleCreateComment(post.id);
                                    }
                                  }}
                                  placeholder="اكتب تعليقاً..."
                                  className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
                                  dir="rtl"
                                />
                                <button
                                  onClick={() => handleCreateComment(post.id)}
                                  disabled={!newComment[post.id]?.trim()}
                                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                                    newComment[post.id]?.trim()
                                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  <Icon
                                    icon="streamline:send-email-solid"
                                    className="w-5 h-5"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Comments List */}
                          {loadingComments[post.id] ? (
                            <div className="text-center py-4">
                              <Icon
                                icon="svg-spinners:180-ring-with-bg"
                                className="w-8 h-8 text-sky-500 mx-auto"
                              />
                            </div>
                          ) : comments[post.id] &&
                            comments[post.id].length > 0 ? (
                            <div className="space-y-3">
                              {comments[post.id].map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                                >
                                  {comment.author?.profile_picture ? (
                                    <img
                                      src={comment.author.profile_picture}
                                      alt={comment.author.full_name}
                                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                      <Icon
                                        icon="solar:user-bold"
                                        className="w-4 h-4"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {comment.author?.id === user?.id
                                          ? "أنت"
                                          : comment.author?.full_name ||
                                            comment.author?.telegram_username ||
                                            "مستخدم"}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTimestamp(comment.created_at)}
                                      </span>
                                    </div>
                                    <p
                                      className="text-sm text-gray-700 dark:text-gray-300"
                                      dir="rtl"
                                    >
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <Icon
                                icon="solar:chat-line-bold-duotone"
                                className="w-12 h-12 mx-auto mb-2 opacity-50"
                              />
                              <p className="text-sm">لا توجد تعليقات بعد</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Load More Button for Posts */}
                  {hasMorePosts && (
                    <button
                      onClick={handleLoadMorePosts}
                      disabled={loadingMorePosts}
                      className={`w-full py-4 px-6 ${colorClasses.bg} hover:opacity-90 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loadingMorePosts ? (
                        <>
                          <Icon
                            icon="svg-spinners:180-ring"
                            className="w-5 h-5"
                          />
                          <span>جاري التحميل...</span>
                        </>
                      ) : (
                        <>
                          <Icon
                            icon="solar:alt-arrow-down-bold"
                            className="w-5 h-5"
                          />
                          <span>تحميل المزيد من المنشورات</span>
                        </>
                      )}
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

      {/* Invite Code Modal */}
      {showInviteCodeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setShowInviteCodeModal(false);
            setInviteCode("");
            setJoiningCommunityId(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                رمز الدعوة مطلوب
              </h3>
              <button
                onClick={() => {
                  setShowInviteCodeModal(false);
                  setInviteCode("");
                  setJoiningCommunityId(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4" dir="rtl">
              هذه المجموعة خاصة. الرجاء إدخال رمز الدعوة للانضمام.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  dir="rtl"
                >
                  رمز الدعوة
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleJoinWithInviteCode();
                    }
                  }}
                  placeholder="أدخل رمز الدعوة"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
                  dir="rtl"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleJoinWithInviteCode}
                  disabled={!inviteCode.trim()}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                    inviteCode.trim()
                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  انضم الآن
                </button>
                <button
                  onClick={() => {
                    setShowInviteCodeModal(false);
                    setInviteCode("");
                    setJoiningCommunityId(null);
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
