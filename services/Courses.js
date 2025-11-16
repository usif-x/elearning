import { getData, postData } from "@/libs/axios";

export const getFeaturedCourses = async () => {
  try {
    const response = await getData("courses", true);
    return response.courses || [];
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    throw error;
  }
};

export const getUserCourses = async (page = 1, size = 20) => {
  try {
    const response = await getData(
      `users/me/courses?page=${page}&size=${size}`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error fetching user courses:", error);
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await getData(`courses/${id}`, true);
    return response;
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw error;
  }
};

export const getCourseLectures = async (courseId) => {
  try {
    const response = await getData(`courses/${courseId}/lectures/`, true);
    return response.lectures || [];
  } catch (error) {
    console.error("Error fetching course lectures:", error);
    throw error;
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
    throw error;
  }
};

export const getQuizAttempts = async (courseId, lectureId, contentId) => {
  try {
    const response = await getData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}/attempts`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    throw error;
  }
};

export const startQuiz = async (courseId, lectureId, contentId) => {
  try {
    const response = await postData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}/start-quiz`,
      {},
      true
    );
    return response;
  } catch (error) {
    console.error("Error starting quiz:", error);
    throw error;
  }
};

export const resumeQuiz = async (courseId, lectureId, contentId) => {
  try {
    const response = await getData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}/resume-quiz`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error resuming quiz:", error);
    throw error;
  }
};

export const submitQuizAttempt = async (
  courseId,
  lectureId,
  contentId,
  payload
) => {
  try {
    const response = await postData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}/attempts`,
      payload,
      true
    );
    return response;
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    throw error;
  }
};
