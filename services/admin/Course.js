import { deleteData, getData, patchData, postData } from "@/libs/axios";

// Admin course management APIs
export const createCourse = async (payload) => {
  try {
    const response = await postData(`courses/`, payload, true);
    return response;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

export const listCourses = async (
  page = 1,
  size = 20,
  { category_id = null, search = null, is_pinned = null, sellable = null } = {}
) => {
  try {
    let url = `courses/?page=${page}&size=${size}`;
    if (category_id !== null && category_id !== undefined)
      url += `&category_id=${category_id}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (is_pinned !== null && is_pinned !== undefined)
      url += `&is_pinned=${is_pinned}`;
    if (sellable !== null && sellable !== undefined)
      url += `&sellable=${sellable}`;

    const response = await getData(url, true);
    return response;
  } catch (error) {
    console.error("Error listing courses:", error);
    throw error;
  }
};

export const getCourse = async (courseId) => {
  try {
    const response = await getData(`courses/${courseId}`, false);
    return response;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const updateCourse = async (courseId, payload) => {
  try {
    const response = await patchData(`courses/${courseId}`, payload, true);
    return response;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await deleteData(`courses/${courseId}`, {}, true);
    return response;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

export const uploadCourseImage = async (courseId, file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    // postData will attach auth headers when auth=true; axios will set multipart headers automatically
    const response = await postData(
      `courses/${courseId}/upload-image`,
      formData,
      true
    );
    return response;
  } catch (error) {
    console.error("Error uploading course image:", error);
    throw error;
  }
};

export default {
  createCourse,
  listCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  uploadCourseImage,
};
