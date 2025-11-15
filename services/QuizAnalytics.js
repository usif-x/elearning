import { getData } from "@/libs/axios";

export const getUserQuizAnalytics = async (page = 1, size = 20) => {
  try {
    const response = await getData(
      `users/me/quiz-analytics?page=${page}&size=${size}`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error fetching quiz analytics:", error);
    throw error;
  }
};

export const getQuizAttemptDetails = async (attemptId) => {
  try {
    const response = await getData(
      `users/me/quiz-analytics/${attemptId}`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error fetching quiz attempt details:", error);
    throw error;
  }
};
