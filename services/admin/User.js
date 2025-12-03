import { deleteData, getData, putData } from "@/libs/axios";

// Get all users with pagination and search
export const getUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.per_page) queryParams.append("per_page", params.per_page);
  if (params.search) queryParams.append("search", params.search);

  const endpoint = `/admin/users${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return getData(endpoint, true);
};

// Get user by ID
export const getUserById = async (userId) => {
  return getData(`/admin/users/${userId}`, true);
};

// Update user information
export const updateUser = async (userId, userData) => {
  return putData(`/admin/users/${userId}`, userData, true);
};

// Delete user (requires super admin)
export const deleteUser = async (userId) => {
  return deleteData(`/admin/users/${userId}`, {}, true);
};

// Update user status
export const updateUserStatus = async (userId, status) => {
  return putData(`/admin/users/${userId}/status`, { status }, true);
};

// Activate/Deactivate user
export const updateUserActivation = async (userId, isActive) => {
  return putData(
    `/admin/users/${userId}/activation`,
    { is_active: isActive },
    true
  );
};

// Get user full details with all statistics
export const getUserDetails = async (userId) => {
  return getData(`/admin/users/${userId}/details`, true);
};

// Get user quiz attempts with pagination
export const getUserQuizAttempts = async (userId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.size) queryParams.append("size", params.size);
  if (params.course_id) queryParams.append("course_id", params.course_id);

  const endpoint = `/admin/users/${userId}/quiz-attempts${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return getData(endpoint, true);
};

// Get user generated questions with pagination
export const getUserGeneratedQuestions = async (userId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.size) queryParams.append("size", params.size);

  const endpoint = `/admin/users/${userId}/generated-questions${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return getData(endpoint, true);
};

// Get user usage statistics with pagination
export const getUserUsage = async (userId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.size) queryParams.append("size", params.size);

  const endpoint = `/admin/users/${userId}/usage${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return getData(endpoint, true);
};

// Get user practice quizzes with pagination
export const getUserPracticeQuizzes = async (userId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.size) queryParams.append("size", params.size);

  const endpoint = `/admin/users/${userId}/practice-quizzes${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return getData(endpoint, true);
};
