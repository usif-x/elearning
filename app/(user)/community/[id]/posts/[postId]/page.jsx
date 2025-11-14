"use client";

import { useAuthStore } from "@/hooks/useAuth";
import {
  addReaction,
  createComment,
  getComments,
  getCommunityById,
  getPostById,
  removeReaction,
  reportPost,
} from "@/services/Community";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const PostDetailPage = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000";
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const communityId = params.id;
  const postId = params.postId;

  const [post, setPost] = useState(null);
  const [community, setCommunity] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState({
    progress: 0,
    currentTime: "0:00",
    duration: "0:00",
  });
  const [audioHover, setAudioHover] = useState({
    visible: false,
    time: "0:00",
    left: "0%",
  });
  const [expandedImage, setExpandedImage] = useState(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    if (communityId && postId) {
      fetchPost();
      fetchCommunity();
      fetchComments();
    }
  }, [communityId, postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await getPostById(communityId, postId);

      // Transform post data
      let type = "text";
      let images = [];
      let audioDuration = null;
      let audioUrl = null;

      if (data.media && data.media.length > 0) {
        const hasImage = data.media.some((m) => m.media_type === "image");
        const hasAudio = data.media.some((m) => m.media_type === "audio");

        if (hasImage) {
          type = "image";
          images = data.media
            .filter((m) => m.media_type === "image")
            .map((m) => `${API_URL}/storage/${m.media_url}`);
        } else if (hasAudio) {
          type = "audio";
          const audioMedia = data.media.find((m) => m.media_type === "audio");
          if (audioMedia) {
            audioDuration = formatTime(audioMedia.duration || 0);
            audioUrl = `${API_URL}/storage/${audioMedia.media_url}`;
          }
        }
      }

      setPost({
        id: data.id,
        communityId: data.community_id,
        author: {
          name:
            data.author?.id === user?.id
              ? "أنت"
              : data.author?.full_name ||
                data.author?.telegram_username ||
                "مستخدم",
          avatar: data.author?.profile_picture,
          role: data.author?.user_type === "teacher" ? "معلم" : "طالب",
        },
        content: data.content,
        timestamp: formatTimestamp(data.created_at),
        likes: data.reactions_count || 0,
        comments: data.comments_count || 0,
        isLiked: data.user_reaction === "like",
        type,
        images,
        audioDuration,
        audioUrl,
        isPinned: data.is_pinned,
        isEdited: data.is_edited,
      });
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("فشل في تحميل المنشور");
      router.push("/community");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunity = async () => {
    try {
      const data = await getCommunityById(communityId);
      setCommunity(data);
    } catch (error) {
      console.error("Error fetching community:", error);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const data = await getComments(postId, 1, 100);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("فشل في تحميل التعليقات");
    } finally {
      setLoadingComments(false);
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

  const handleLike = async () => {
    if (!post) return;

    try {
      if (post.isLiked) {
        await removeReaction(post.id);
      } else {
        await addReaction(post.id, "like");
      }

      setPost({
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("فشل في تحديث الإعجاب");
    }
  };

  const handleCreateComment = async () => {
    const content = newComment.trim();
    if (!content) return;

    try {
      const data = await createComment(postId, { content });
      setComments([data, ...comments]);
      setPost({ ...post, comments: post.comments + 1 });
      setNewComment("");
      toast.success("تم إضافة التعليق بنجاح");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("فشل في إضافة التعليق");
    }
  };

  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      toast.error("يرجى إدخال سبب البلاغ");
      return;
    }

    try {
      console.log("Reporting post:", postId, "Reason:", reportReason);
      await reportPost(postId, reportReason);
      toast.success("تم إرسال البلاغ بنجاح");
      setShowReportModal(false);
      setReportReason("");
    } catch (error) {
      console.error("Error reporting post:", error);
      console.error("Error response:", error?.response?.data);
      // Don't show duplicate error toast as axios already shows one
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community/${communityId}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ رابط المنشور");
  };

  const handlePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingAudio) {
      audio.pause();
      setPlayingAudio(false);
    } else {
      audio.play();
      setPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const progress = (audio.currentTime / audio.duration) * 100;
    const currentTime = formatTime(audio.currentTime);
    const duration = formatTime(audio.duration);

    setAudioProgress({ progress, currentTime, duration });
  };

  const handleAudioEnded = () => {
    setPlayingAudio(false);
    setAudioProgress({
      progress: 0,
      currentTime: "0:00",
      duration: audioProgress.duration,
    });
  };

  const handleSeekAudio = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    const dir = getComputedStyle(e.currentTarget).direction;
    if (dir === "rtl") {
      percent = 1 - percent;
    }
    percent = Math.max(0, Math.min(1, percent));
    audio.currentTime = percent * (audio.duration || 0);
  };

  const handleHoverMove = (e) => {
    const audio = audioRef.current;
    const container = e.currentTarget.getBoundingClientRect();
    if (!audio || !container) return;

    let percentPos = (e.clientX - container.left) / container.width;
    percentPos = Math.max(0, Math.min(1, percentPos));

    // Check RTL direction for time calculation
    const dir = getComputedStyle(e.currentTarget).direction;
    let timePercent = percentPos;
    if (dir === "rtl") {
      timePercent = 1 - percentPos;
    }

    const duration = audio.duration || 0;
    const hoveredSec = timePercent * duration;
    setAudioHover({
      visible: true,
      time: formatTime(hoveredSec),
      left: `${percentPos * 100}%`,
    });
  };

  const handleHoverLeave = () => {
    setAudioHover({ ...(audioHover || {}), visible: false });
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
            جاري تحميل المنشور...
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Icon
              icon="solar:chat-line-bold-duotone"
              className="w-24 h-24 mx-auto mb-4 text-gray-400"
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              المنشور غير موجود
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              لم نتمكن من العثور على هذا المنشور
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
        >
          <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
          <span>رجوع</span>
        </button>

        {/* Community Info */}
        {community && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  className="w-8 h-8 text-sky-500"
                />
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    {community.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {community.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/community/${communityId}`)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg flex-shrink-0"
              >
                <Icon icon="solar:login-3-bold" className="w-5 h-5" />
                <span>فتح المجموعة</span>
              </button>
            </div>
          </div>
        )}

        {/* Post Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
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
            className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-lg"
            dir="rtl"
          >
            {post.content}
          </p>

          {/* Audio Player */}
          {post.type === "audio" && post.audioUrl && (
            <div className="mb-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-4 rounded-xl border-2 border-sky-200 dark:border-sky-800">
              <audio
                ref={audioRef}
                src={post.audioUrl}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={handleAudioEnded}
                onLoadedMetadata={handleAudioTimeUpdate}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayAudio}
                  className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-colors shadow-lg"
                >
                  <Icon
                    icon={playingAudio ? "solar:pause-bold" : "solar:play-bold"}
                    className="w-6 h-6"
                  />
                </button>
                <div className="flex-1">
                  <div className="relative">
                    <div
                      className="h-2 bg-sky-200 dark:bg-sky-800 rounded-full overflow-hidden cursor-pointer"
                      onClick={handleSeekAudio}
                      onPointerMove={handleHoverMove}
                      onPointerLeave={handleHoverLeave}
                    >
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-150"
                        style={{ width: `${audioProgress.progress}%` }}
                      ></div>
                    </div>

                    {audioHover.visible && (
                      <div
                        className="absolute -top-7 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md pointer-events-none"
                        style={{ left: audioHover.left }}
                      >
                        {audioHover.time}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {audioProgress.currentTime}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {audioProgress.duration || post.audioDuration}
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
                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
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
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                post.isLiked
                  ? "text-red-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-500"
              }`}
            >
              <Icon
                icon={post.isLiked ? "solar:heart-bold" : "solar:heart-linear"}
                className="w-6 h-6"
              />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Icon icon="solar:chat-round-line-bold" className="w-6 h-6" />
              <span className="text-sm font-medium">{post.comments}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors"
            >
              <Icon icon="solar:share-bold" className="w-6 h-6" />
              <span className="text-sm font-medium">مشاركة</span>
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
            >
              <Icon icon="solar:danger-circle-bold" className="w-6 h-6" />
              <span className="text-sm font-medium">بلاغ</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon icon="solar:chat-round-line-bold" className="w-6 h-6" />
            التعليقات ({post.comments})
          </h3>

          {/* Add Comment */}
          <div className="flex items-start gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              <Icon icon="solar:user-bold" className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateComment();
                    }
                  }}
                  placeholder="اكتب تعليقاً..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
                  dir="rtl"
                />
                <button
                  onClick={handleCreateComment}
                  disabled={!newComment.trim()}
                  className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                    newComment.trim()
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
          {loadingComments ? (
            <div className="text-center py-8">
              <Icon
                icon="svg-spinners:180-ring-with-bg"
                className="w-12 h-12 text-sky-500 mx-auto mb-4"
              />
              <p className="text-gray-600 dark:text-gray-400">
                جاري تحميل التعليقات...
              </p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  {comment.author?.profile_picture ? (
                    <img
                      src={comment.author.profile_picture}
                      alt={comment.author.full_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      <Icon icon="solar:user-bold" className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
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
                    <p className="text-gray-700 dark:text-gray-300" dir="rtl">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Icon
                icon="solar:chat-line-bold-duotone"
                className="w-16 h-16 mx-auto mb-3 opacity-50"
              />
              <p>لا توجد تعليقات بعد</p>
              <p className="text-sm mt-1">كن أول من يعلق على هذا المنشور!</p>
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                الإبلاغ عن المنشور
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                سبب البلاغ
              </label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="يرجى ذكر سبب الإبلاغ..."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
                rows="4"
                dir="rtl"
                autoFocus
                minLength={10}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReportPost}
                disabled={!reportReason.trim()}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  reportReason.trim()
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                إرسال البلاغ
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;
