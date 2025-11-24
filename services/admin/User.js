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
