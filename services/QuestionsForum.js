import {
  deleteData,
  getData,
  patchData,
  postData,
  putData,
} from "@/libs/axios";

/**
 * Generate questions from a topic using AI
 * @param {Object} data - Generation parameters
 * @param {string} data.topic - Topic to generate questions from
 * @param {string} data.title - Title for the question set
 * @param {string} [data.description] - Description (optional)
 * @param {string} [data.difficulty] - Difficulty level: easy, medium, hard (default: medium)
 * @param {string} [data.question_type] - Type: multiple_choice, true_false, short_answer (default: multiple_choice)
 * @param {number} [data.count] - Number of questions (default: 5)
 * @param {boolean} [data.is_public] - Whether to make it public (default: false)
 * @param {string} [data.notes] - Additional notes (optional)
 * @returns {Promise<Object>} Generated question set with questions
 */
export const generateQuestionsFromTopic = async (data) => {
  return await postData("/user-questions/generate", data, true);
};

/**
 * Generate questions from a PDF file
 * @param {FormData} formData - Form data with file and parameters
 * @param {File} formData.file - PDF file
 * @param {string} formData.title - Title for the question set
 * @param {string} [formData.description] - Description (optional)
 * @param {string} [formData.difficulty] - Difficulty level
 * @param {string} [formData.question_type] - Question type
 * @param {number} [formData.count] - Number of questions
 * @param {boolean} [formData.is_public] - Public visibility
 * @param {string} [formData.notes] - Additional notes
 * @returns {Promise<Object>} Generated question set with questions
 */
export const generateQuestionsFromPdf = async (formData) => {
  return await postData("/user-questions/generate-from-pdf", formData, true);
};

/**
 * Add more questions to an existing question set
 * @param {number} questionSetId - Question set ID
 * @param {Object} data - Additional questions parameters
 * @param {number} data.count - Number of additional questions
 * @param {string} [data.notes] - Notes for the new questions
 * @returns {Promise<Object>} Updated question set
 */
export const addQuestionsToSet = async (questionSetId, data) => {
  return await postData(
    `/user-questions/${questionSetId}/add-questions`,
    data,
    true
  );
};

/**
 * Get all question sets created by current user
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number (default: 1)
 * @param {number} [params.size] - Page size (default: 20, max: 100)
 * @returns {Promise<Object>} Paginated question sets
 */
export const getMyQuestionSets = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();
  const endpoint = `/user-questions/my${queryString ? `?${queryString}` : ""}`;
  return await getData(endpoint, true);
};

/**
 * Get detailed view of a specific question set
 * @param {number} questionSetId - Question set ID
 * @returns {Promise<Object>} Question set with all questions and answers
 */
export const getMyQuestionSetDetail = async (questionSetId) => {
  return await getData(`/user-questions/my/${questionSetId}`, true);
};

/**
 * Update question set metadata
 * @param {number} questionSetId - Question set ID
 * @param {Object} data - Update parameters
 * @param {string} [data.title] - New title
 * @param {string} [data.description] - New description
 * @param {boolean} [data.is_public] - New visibility setting
 * @returns {Promise<Object>} Updated question set
 */
export const updateMyQuestionSet = async (questionSetId, data) => {
  const queryString = new URLSearchParams(
    Object.entries(data).filter(([_, v]) => v != null)
  ).toString();
  return await patchData(
    `/user-questions/my/${questionSetId}?${queryString}`,
    {},
    true
  );
};

/**
 * Delete a question set
 * @param {number} questionSetId - Question set ID
 * @returns {Promise<void>}
 */
export const deleteMyQuestionSet = async (questionSetId) => {
  return await deleteData(`/user-questions/my/${questionSetId}`);
};

/**
 * Get all public question sets
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number (default: 1)
 * @param {number} [params.size] - Page size (default: 20, max: 100)
 * @param {string} [params.difficulty] - Filter by difficulty
 * @param {string} [params.search] - Search term
 * @returns {Promise<Object>} Paginated public question sets
 */
export const getPublicQuestionSets = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();
  const endpoint = `/user-questions/public${
    queryString ? `?${queryString}` : ""
  }`;
  return await getData(endpoint, true);
};

export const getPublicQuestionSetDetail = async (questionSetId) => {
  return await getData(`/user-questions/public/${questionSetId}`, true);
};

/**
 * Get participants/leaderboard for a question set
 * @param {number} questionSetId - Question set ID
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number (default: 1)
 * @param {number} [params.size] - Page size (default: 20, max: 100)
 * @returns {Promise<Object>} Participants with scores and rankings
 */
export const getQuestionSetParticipants = async (
  questionSetId,
  params = {}
) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();
  const endpoint = `/user-questions/${questionSetId}/participants${
    queryString ? `?${queryString}` : ""
  }`;
  return await getData(endpoint, true);
};

/**
 * Get pending (incomplete) attempts for current user
 * @returns {Promise<Object>} Pending attempts
 */
export const getPendingAttempts = async () => {
  return await getData("/user-questions/attempts/pending", true);
};

/**
 * Start or resume an attempt on a question set
 * @param {number} questionSetId - Question set ID
 * @returns {Promise<Object>} Attempt data with questions
 */
export const startQuestionAttempt = async (questionSetId) => {
  return await postData(`/user-questions/${questionSetId}/attempt`, {}, true);
};

/**
 * Submit answers for an attempt
 * @param {number} attemptId - Attempt ID
 * @param {Object} data - Submission data
 * @param {Array} data.answers - Array of answers
 * @param {number} data.time_taken - Time taken in seconds
 * @returns {Promise<Object>} Attempt results with correct answers
 */
export const submitQuestionAttempt = async (attemptId, data) => {
  return await postData(
    `/user-questions/attempts/${attemptId}/submit`,
    data,
    true
  );
};

/**
 * Get all attempts made by current user
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number (default: 1)
 * @param {number} [params.size] - Page size (default: 20, max: 100)
 * @returns {Promise<Object>} Paginated attempts
 */
export const getMyAttempts = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();
  const endpoint = `/user-questions/attempts/my${
    queryString ? `?${queryString}` : ""
  }`;
  return await getData(endpoint, true);
};

/**
 * Get detailed result of a specific attempt
 * @param {number} attemptId - Attempt ID
 * @returns {Promise<Object>} Attempt details with questions and results
 */
export const getAttemptDetail = async (attemptId) => {
  return await getData(`/user-questions/attempts/${attemptId}`, true);
};

/**
 * Edit a specific question in a question set
 * @param {number} questionSetId - Question set ID
 * @param {Object} data - Edit data
 * @param {number} data.question_index - Index of the question to edit
 * @param {Object} data.question_data - New question data
 * @returns {Promise<Object>} Updated question set
 */
export const editQuestionInSet = async (questionSetId, data) => {
  return await putData(
    `/user-questions/${questionSetId}/edit-question`,
    data,
    true
  );
};

/**
 * Delete a specific question from a question set
 * @param {number} questionSetId - Question set ID
 * @param {Object} data - Delete data
 * @param {number} data.question_index - Index of the question to delete
 * @returns {Promise<Object>} Updated question set
 */
export const deleteQuestionFromSet = async (questionSetId, data) => {
  return await deleteData(
    `/user-questions/${questionSetId}/delete-question`,
    data
  );
};
