import { deleteData, getData, patchData, postData } from "@/libs/axios";

// Communities
export const getCommunities = async (
  page = 1,
  size = 20,
  isPublic = null,
  search = null
) => {
  let url = `/communities/?page=${page}&size=${size}`;
  if (isPublic !== null) url += `&is_public=${isPublic}`;
  if (search) url += `&search=${search}`;

  const response = await getData(url, true);
  return response.communities || [];
};

export const getCommunityById = async (id) => {
  return await getData(`/communities/${id}`, true);
};

export const createCommunity = async (data) => {
  return await postData("/communities/", data, true);
};

export const updateCommunity = async (id, data) => {
  return await patchData(`/communities/${id}`, data, true);
};

export const joinCommunity = async (id, inviteCode = null) => {
  const url = inviteCode
    ? `/communities/${id}/join?invite_code=${inviteCode}`
    : `/communities/${id}/join`;
  return await postData(url, {}, true);
};

export const leaveCommunity = async (id) => {
  return await postData(`/communities/${id}/leave`, {}, true);
};

export const uploadCommunityImage = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await postData(`/communities/${id}/upload-image`, formData, true);
};

// Posts
export const getPosts = async (communityId, page = 1, size = 20) => {
  const response = await getData(
    `/communities/${communityId}/posts?page=${page}&size=${size}`,
    true
  );
  return response.posts || [];
};

export const getMyPosts = async (page = 1, size = 20) => {
  const response = await getData(
    `/communities/posts/me?page=${page}&size=${size}`,
    true
  );
  return response.posts || [];
};

export const getPostById = async (communityId, postId) => {
  return await getData(`/communities/${communityId}/posts/${postId}`, true);
};

export const createPost = async (communityId, data) => {
  return await postData(`/communities/${communityId}/posts`, data, true);
};

export const updatePost = async (postId, data) => {
  return await patchData(`/communities/posts/${postId}`, data, true);
};

export const deletePost = async (postId) => {
  return await deleteData(`/communities/posts/${postId}`, true);
};

export const addPostMedia = async (postId, file, mediaType) => {
  const formData = new FormData();
  formData.append("media_file", file);
  return await postData(
    `/communities/posts/${postId}/media?media_type=${mediaType}`,
    formData,
    true
  );
};

// Reactions
export const addReaction = async (postId, reactionType) => {
  return await postData(
    `/communities/posts/${postId}/reactions`,
    {
      reaction_type: reactionType,
    },
    true
  );
};

export const removeReaction = async (postId) => {
  return await deleteData(`/communities/posts/${postId}/reactions`, true);
};

// Comments
export const getComments = async (postId, page = 1, size = 20) => {
  const response = await getData(
    `/communities/posts/${postId}/comments?page=${page}&size=${size}`,
    true
  );
  return response.comments || response || [];
};

export const createComment = async (postId, data) => {
  return await postData(`/communities/posts/${postId}/comments`, data, true);
};

export const updateComment = async (commentId, data) => {
  return await patchData(`/communities/comments/${commentId}`, data, true);
};

export const deleteComment = async (commentId) => {
  return await deleteData(`/communities/comments/${commentId}`, true);
};

// Reports
export const reportPost = async (postId, reason) => {
  return await postData(
    `/communities/posts/${postId}/report`,
    { reason },
    true
  );
};

// Admin / Community management helpers
export const deleteCommunity = async (id) => {
  return await deleteData(`/communities/${id}`, true);
};

export const regenerateInvite = async (id) => {
  return await postData(`/communities/${id}/regenerate-invite`, {}, true);
};

export const getCommunityMembers = async (id, page = 1, size = 100) => {
  const response = await getData(
    `/communities/${id}/members?page=${page}&size=${size}`,
    true
  );
  return response;
};

export const addCommunityMember = async (id, userId) => {
  return await postData(
    `/communities/${id}/members`,
    { user_id: userId },
    true
  );
};

export const removeCommunityMember = async (id, userId) => {
  return await deleteData(`/communities/${id}/members/${userId}`, true);
};

// Admin - Pending Posts Management
export const getPendingPosts = async (
  page = 1,
  size = 20,
  communityId = null
) => {
  let url = `/communities/admin/posts/pending?page=${page}&size=${size}`;
  if (communityId) url += `&community_id=${communityId}`;
  const response = await getData(url, true);
  return response.posts || [];
};

export const acceptPost = async (postId) => {
  return await postData(`/communities/admin/posts/${postId}/accept`, {}, true);
};

export const rejectPost = async (postId) => {
  return await postData(`/communities/admin/posts/${postId}/reject`, {}, true);
};

// Admin - Reported Posts Management
export const getReportedPosts = async (page = 1, size = 20) => {
  const response = await getData(
    `/communities/admin/reports?page=${page}&size=${size}`,
    true
  );
  return response;
};

export const deleteReportedPost = async (reportId) => {
  return await deleteData(
    `/communities/admin/reports/${reportId}/delete`,
    true
  );
};

export const passReport = async (reportId) => {
  return await postData(
    `/communities/admin/reports/${reportId}/pass`,
    {},
    true
  );
};

export const adminDeletePost = async (postId) => {
  return await deleteData(`/communities/admin/posts/${postId}`, true);
};
