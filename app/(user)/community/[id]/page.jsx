"use client";
import Switcher from "@/components/ui/Switcher";
import { useAuthStore } from "@/hooks/useAuth";
import {
  addPostMedia,
  addReaction,
  createComment,
  createPost,
  deletePost,
  getComments,
  getCommunityById,
  getMyPosts,
  getPosts,
  joinCommunity,
  leaveCommunity,
  removeReaction,
} from "@/services/Community";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const CommunityDetailPage = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000";
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const communityId = params.id;

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
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
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [showMyPosts, setShowMyPosts] = useState(false);
  const audioRefs = useRef({});
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchPosts(communityId, 1);
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId) {
      setCurrentPage(1);
      setPosts([]);
      setHasMorePosts(true);
      fetchPosts(communityId, 1);
    }
  }, [showMyPosts]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const data = await getCommunityById(communityId);
      setCommunity(data);
    } catch (error) {
      console.error("Error fetching community:", error);
      toast.error("فشل في تحميل المجموعة");
      router.push("/community");
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

      const data = showMyPosts
        ? await getMyPosts(page, 5)
        : await getPosts(communityId, page, 5);

      const transformedPosts = data.map((post) => {
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

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      !community
    )
      return;

    try {
      const data = await createPost(community.id, {
        content: newPost.trim() || "شارك محتوى جديد",
        is_pinned: false,
      });

      if (selectedImages.length > 0) {
        setUploadingMedia(true);
        for (const image of selectedImages) {
          await addPostMedia(data.id, image, "image");
        }
      }

      if (selectedAudio) {
        setUploadingMedia(true);
        await addPostMedia(data.id, selectedAudio, "audio");
      }

      setNewPost("");
      setSelectedImages([]);
      setSelectedAudio(null);
      setUploadingMedia(false);

      toast.success("تم نشر المنشور بنجاح");

      setCurrentPage(1);
      setPosts([]);
      setHasMorePosts(true);
      await fetchPosts(community.id, 1);
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
    setSelectedAudio(null);
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAudio(file);
      setSelectedImages([]);
    }
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const removeSelectedAudio = () => {
    setSelectedAudio(null);
  };

  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `نشط منذ ${diffYears} ${diffYears === 1 ? "سنة" : "سنوات"}`;
    } else if (diffMonths > 0) {
      return `نشط منذ ${diffMonths} ${diffMonths === 1 ? "شهر" : "أشهر"}`;
    } else if (diffDays > 0) {
      return `نشط منذ ${diffDays} ${diffDays === 1 ? "يوم" : "أيام"}`;
    } else {
      return "نشط اليوم";
    }
  };

  const handleJoinCommunity = async () => {
    // Check if community is private
    if (!community.is_public) {
      setShowInviteCodeModal(true);
      return;
    }

    // For public communities, join directly
    try {
      await joinCommunity(communityId, null);
      toast.success("تم الانضمام إلى المجموعة بنجاح");
      await fetchCommunity();
      setCurrentPage(1);
      setPosts([]);
      setHasMorePosts(true);
      await fetchPosts(communityId, 1);
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
      await joinCommunity(communityId, inviteCode.trim());
      toast.success("تم الانضمام إلى المجموعة بنجاح");
      setShowInviteCodeModal(false);
      setInviteCode("");
      await fetchCommunity();
      setCurrentPage(1);
      setPosts([]);
      setHasMorePosts(true);
      await fetchPosts(communityId, 1);
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error(
        error.response?.data?.detail || "فشل في الانضمام إلى المجموعة"
      );
    }
  };

  const handleLeaveCommunity = async () => {
    if (!confirm("هل أنت متأكد من الخروج من هذه المجموعة؟")) return;

    try {
      await leaveCommunity(communityId);
      toast.success("تم الخروج من المجموعة بنجاح");
      router.push("/community");
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

  const handleLoadMorePosts = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosts(communityId, nextPage);
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

      setComments((prev) => ({
        ...prev,
        [postId]: [data, ...(prev[postId] || [])],
      }));

      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, comments: p.comments + 1 } : p
        )
      );

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
            جاري تحميل المجموعة...
          </p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Icon
              icon="solar:users-group-rounded-bold-duotone"
              className="w-24 h-24 mx-auto mb-4 text-gray-400"
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              المجموعة غير موجودة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              لم نتمكن من العثور على هذه المجموعة
            </p>
            <button
              onClick={() => router.push("/community")}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors"
            >
              العودة إلى المجتمع
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/community")}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
        >
          <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
          <span>العودة إلى المجتمع</span>
        </button>

        {/* Community Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Icon
                    icon="solar:users-group-rounded-bold-duotone"
                    className="w-12 h-12"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
                  <p className="text-white/90 text-lg">
                    {community.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:users-group-rounded-bold"
                    className="w-6 h-6"
                  />
                  <span className="font-semibold">
                    {community.members_count || 0} عضو
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:chat-round-line-bold" className="w-6 h-6" />
                  <span className="font-semibold">
                    {community.posts_count || 0} منشور
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-bold" className="w-6 h-6" />
                  <span className="font-semibold">
                    {formatActivityDate(community.created_at)}
                  </span>
                </div>
                {!community.is_public && (
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:lock-password-bold" className="w-6 h-6" />
                    <span className="font-semibold">خاصة</span>
                  </div>
                )}
              </div>

              {community.is_member ? (
                <button
                  onClick={handleLeaveCommunity}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Icon icon="solar:logout-2-bold" className="w-5 h-5" />
                  <span>مغادرة المجموعة</span>
                </button>
              ) : (
                <button
                  onClick={handleJoinCommunity}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 backdrop-blur-sm shadow-lg"
                >
                  <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                  <span>انضم الآن</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Create Post */}
        {community.is_member && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
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
                        ? "bg-sky-500 text-white hover:opacity-80"
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

        {/* Posts Filter Switcher */}
        {community.is_member && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  الكل
                </span>
                <Switcher
                  checked={showMyPosts}
                  onChange={(checked) => setShowMyPosts(checked)}
                  size="sm"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  منشوراتي
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:posts-carousel-horizontal-bold-duotone"
                  className="w-5 h-5 text-sky-500"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  تصفية المنشورات
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {!community.is_public && !community.is_member ? (
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
              <p className="text-sm text-gray-500 dark:text-gray-500">
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
                        onLoadedMetadata={() => handleAudioTimeUpdate(post.id)}
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
                              {audioProgress[post.id]?.currentTime || "0:00"}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {audioProgress[post.id]?.duration ||
                                post.audioDuration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {post.type === "image" && post.images && (
                    <div
                      className={`mb-4 grid gap-2 ${
                        post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
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
                      <span className="text-sm font-medium">{post.likes}</span>
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
                    <button
                      onClick={() =>
                        router.push(
                          `/community/${post.communityId}/posts/${post.id}`
                        )
                      }
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors"
                    >
                      <Icon icon="solar:eye-bold" className="w-5 h-5" />
                      <span className="text-sm font-medium">عرض</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showCommentsFor === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Add Comment */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          <Icon icon="solar:user-bold" className="w-5 h-5" />
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
                      ) : comments[post.id] && comments[post.id].length > 0 ? (
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

              {/* Load More Button */}
              {hasMorePosts && (
                <button
                  onClick={handleLoadMorePosts}
                  disabled={loadingMorePosts}
                  className="w-full py-4 px-6 bg-sky-500 hover:opacity-90 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMorePosts ? (
                    <>
                      <Icon icon="svg-spinners:180-ring" className="w-5 h-5" />
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
                {community.is_member
                  ? "كن أول من ينشر في هذه المجموعة!"
                  : "انضم إلى المجموعة لمشاهدة المنشورات"}
              </p>
            </div>
          )}
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
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              <Icon
                icon="solar:close-circle-bold"
                className="w-8 h-8 text-white"
              />
            </button>

            <button
              onClick={handleRotateImage}
              className="absolute top-4 left-4 z-10 w-12 h-12 bg-sky-500 hover:bg-sky-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <Icon icon="solar:restart-bold" className="w-6 h-6 text-white" />
            </button>

            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ transform: `rotate(${imageRotation}deg)` }}
              />
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

export default CommunityDetailPage;
