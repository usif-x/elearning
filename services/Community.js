import { deleteData, getData, patchData, postData } from "@/libs/axios";

// Communities
export const getCommunities = async (
  page = 1,
  size = 20,
  isPublic = null,
  search = null
) => {
  let url = `/communities?page=${page}&size=${size}`;
  if (isPublic !== null) url += `&is_public=${isPublic}`;
  if (search) url += `&search=${search}`;

  const response = await getData(url, true);
  return response.communities || [];
};

export const getCommunityById = async (id) => {
  return await getData(`/communities/${id}`, true);
};

export const createCommunity = async (data) => {
  return await postData("/communities", data, true);
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
