import { getData, postData } from "@/libs/axios";

/**
 * Generate a new practice quiz from user's incorrect/unanswered questions or specific lectures/quizzes
 * @param {Object} data - Quiz generation parameters
 * @param {number} [data.course_id] - Course ID to generate quiz from (optional)
 * @param {Array<number>} [data.lecture_ids] - Array of lecture IDs to include (optional)
 * @param {Array<number>} [data.quiz_ids] - Array of quiz content IDs to include (optional)
 * @param {number} data.question_count - Number of questions (default: 10)
 * @param {boolean} data.include_unanswered - Include unanswered questions
 * @returns {Promise<Object>} Practice quiz data with practice_quiz_id
 */
export const generatePracticeQuiz = async (data) => {
  return await postData("/users/me/practice-quiz/generate", data, true);
};

/**
 * Submit a practice quiz with answers
 * @param {number} practiceQuizId - Practice quiz ID
 * @param {Object} data - Submission data
 * @param {Array} data.answers - Array of answers
 * @param {number} data.time_taken - Time taken in seconds
 * @returns {Promise<Object>} Quiz results with correct answers and explanations
 */
export const submitPracticeQuiz = async (practiceQuizId, data) => {
  return await postData(
    `/users/me/practice-quiz/${practiceQuizId}/submit`,
    data,
    true
  );
};

/**
 * Get all practice quiz results for the current user
 * @param {Object} params - Query parameters
 * @param {number} params.course_id - Filter by course ID (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.size - Page size (default: 20, max: 100)
 * @returns {Promise<Object>} Paginated practice quiz results
 */
export const getPracticeQuizResults = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();
  const endpoint = `/users/me/practice-quiz/result${
    queryString ? `?${queryString}` : ""
  }`;
  return await getData(endpoint, true);
};

/**
 * Get detailed results for a specific practice quiz
 * @param {number} practiceQuizId - Practice quiz ID
 * @returns {Promise<Object>} Detailed quiz results with questions and explanations
 */
export const getPracticeQuizDetailedResult = async (practiceQuizId) => {
  return await getData(
    `/users/me/practice-quiz/result/${practiceQuizId}`,
    true
  );
};

/**
 * Get questions for a practice quiz attempt
 * @param {number} practiceQuizId - Practice quiz ID
 * @returns {Promise<Object>} Practice quiz questions
 */
export const getPracticeQuizQuestions = async (practiceQuizId) => {
  return await getData(
    `/users/me/practice-quiz/${practiceQuizId}/questions`,
    true
  );
};
