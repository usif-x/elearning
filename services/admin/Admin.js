import { deleteData, getData, patchData, postData } from "@/libs/axios";

// Admin management APIs
export const createAdmin = async (payload) => {
  try {
    const response = await postData(`admin/create`, payload, true);
    return response;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await getData(`admin/me`, true);
    return response;
  } catch (error) {
    console.error("Error fetching current admin:", error);
    throw error;
  }
};

export const listAdmins = async (page = 1, limit = 10) => {
  try {
    const response = await getData(
      `admin/list?page=${page}&limit=${limit}`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error listing admins:", error);
    throw error;
  }
};

export const getAdmin = async (adminId) => {
  try {
    const response = await getData(`admin/${adminId}`, true);
    return response;
  } catch (error) {
    console.error("Error fetching admin:", error);
    throw error;
  }
};

export const updateAdmin = async (adminId, payload) => {
  try {
    // Use patch for partial updates
    const response = await patchData(`admin/${adminId}`, payload, true);
    return response;
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const response = await deleteData(`admin/${adminId}`, {}, true);
    return response;
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};

export const resetAdminPassword = async (adminId, newPassword) => {
  try {
    // Endpoint expects new_password as query param
    const response = await postData(
      `admin/${adminId}/reset-password?new_password=${encodeURIComponent(
        newPassword
      )}`,
      {},
      true
    );
    return response;
  } catch (error) {
    console.error("Error resetting admin password:", error);
    throw error;
  }
};

export default {
  createAdmin,
  getMe,
  listAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
};
