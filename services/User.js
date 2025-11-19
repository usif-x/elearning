import { getData, postData, putData } from "@/libs/axios";

/**
 * Get current user profile information
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUserProfile = async () => {
  return await getData("/auth/me", true);
};

/**
 * Update user password
 * @param {Object} data - Password update data
 * @param {string} data.current_password - Current password
 * @param {string} data.new_password - New password
 * @param {string} data.confirm_password - Password confirmation
 * @returns {Promise<Object>} Update result
 */
export const updateUserPassword = async (data) => {
  return await putData("/users/me/password", data, true);
};

/**
 * Initiate password reset by sending verification code to Telegram
 * @param {Object} data - Reset initiation data
 * @param {string} data.phone_number - Phone number for password reset
 * @returns {Promise<Object>} Reset initiation result
 */
export const forgotPassword = async (data) => {
  return await postData("/users/forgot-password", data);
};

/**
 * Verify the password reset code sent to Telegram
 * @param {Object} data - Verification data
 * @param {string} data.phone_number - Phone number
 * @param {string} data.code - Verification code
 * @returns {Promise<Object>} Verification result
 */
export const verifyResetCode = async (data) => {
  return await postData("/users/verify-reset-code", data);
};

/**
 * Reset password using verification code
 * @param {Object} data - Password reset data
 * @param {string} data.phone_number - Phone number
 * @param {string} data.code - Verification code
 * @param {string} data.new_password - New password
 * @param {string} data.confirm_password - Password confirmation
 * @returns {Promise<Object>} Password reset result
 */
export const resetPassword = async (data) => {
  return await postData("/users/reset-password", data);
};
