import { getData } from "@/libs/axios-server";

export const getFeaturedCourses = async () => {
  try {
    const response = await getData("courses/", true);
    return response.courses || [];
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    return [];
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await getData(`courses/${id}`, true);
    return response;
  } catch (error) {
    console.error("Error fetching course details:", error);
    return null;
  }
};

export const getCourseLectures = async (courseId) => {
  try {
    const response = await getData(`courses/${courseId}/lectures/`, true);
    return response.lectures || [];
  } catch (error) {
    console.error("Error fetching course lectures:", error);
    return [];
  }
};

export const getContent = async (courseId, lectureId, contentId) => {
  try {
    const response = await getData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error fetching content:", error);
    return null;
  }
};
