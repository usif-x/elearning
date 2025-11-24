import {
  deleteData,
  getData,
  patchData,
  postData,
  putData,
} from "@/libs/axios";

// ============================================
// LECTURE MANAGEMENT APIs
// ============================================

/**
 * Create a new lecture in a course
 * @param {number} courseId - Course ID
 * @param {object} payload - Lecture data
 * @param {string} payload.name - Lecture name
 * @param {string} payload.description - Lecture description
 * @param {number} payload.position - Lecture position
 */
export const createLecture = async (courseId, payload) => {
  try {
    const response = await postData(
      `courses/${courseId}/lectures/`,
      payload,
      true
    );
    return response;
  } catch (error) {
    console.error("Error creating lecture:", error);
    throw error;
  }
};

/**
 * Get all lectures for a course
 * @param {number} courseId - Course ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 50, max: 100)
 */
export const listLectures = async (courseId, page = 1, size = 50) => {
  try {
    const url = `courses/${courseId}/lectures/?page=${page}&size=${size}`;
    const response = await getData(url, true);
    return response;
  } catch (error) {
    console.error("Error listing lectures:", error);
    throw error;
  }
};

/**
 * Get a specific lecture by ID
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 */
export const getLecture = async (courseId, lectureId) => {
  try {
    const response = await getData(
      `courses/${courseId}/lectures/${lectureId}`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error fetching lecture:", error);
    throw error;
  }
};

/**
 * Update a lecture
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {object} payload - Updated lecture data
 */
export const updateLecture = async (courseId, lectureId, payload) => {
  try {
    const response = await patchData(
      `courses/${courseId}/lectures/${lectureId}`,
      payload,
      true
    );
    return response;
  } catch (error) {
    console.error("Error updating lecture:", error);
    throw error;
  }
};

/**
 * Delete a lecture
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 */
export const deleteLecture = async (courseId, lectureId) => {
  try {
    const response = await deleteData(
      `courses/${courseId}/lectures/${lectureId}`,
      {},
      true
    );
    return response;
  } catch (error) {
    console.error("Error deleting lecture:", error);
    throw error;
  }
};

// ============================================
// CONTENT MANAGEMENT APIs
// ============================================

/**
 * Create content for a lecture
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {object} payload - Content data
 * @param {string} payload.content_type - Content type: video, photo, file, audio, link, quiz
 * @param {string} payload.source - Content source (not required for quiz)
 * @param {string} payload.video_platform - Video platform (for video type)
 * @param {array} payload.questions - Quiz questions (for quiz type)
 * @param {number} payload.quiz_duration - Quiz duration in minutes
 * @param {number} payload.max_attempts - Maximum attempts
 * @param {number} payload.passing_score - Passing score (0-100)
 * @param {number} payload.show_correct_answers - Show correct answers (0 or 1)
 * @param {number} payload.randomize_questions - Randomize questions (0 or 1)
 * @param {number} payload.randomize_options - Randomize options (0 or 1)
 * @param {string} payload.title - Content title
 * @param {string} payload.description - Content description
 * @param {number} payload.position - Content position
 */
export const createContent = async (courseId, lectureId, payload) => {
  try {
    const response = await postData(
      `courses/${courseId}/lectures/${lectureId}/contents`,
      payload,
      true
    );
    return response;
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};

/**
 * Get all contents for a lecture
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 50, max: 100)
 * @param {string} contentType - Filter by content type (optional)
 */
export const listContents = async (
  courseId,
  lectureId,
  page = 1,
  size = 50,
  contentType = null
) => {
  try {
    let url = `courses/${courseId}/lectures/${lectureId}/contents?page=${page}&size=${size}`;
    if (contentType) {
      url += `&content_type=${contentType}`;
    }
    const response = await getData(url, true);
    return response;
  } catch (error) {
    console.error("Error listing contents:", error);
    throw error;
  }
};

/**
 * Get a specific content item by ID
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {number} contentId - Content ID
 */
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

/**
 * Update a content item
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {number} contentId - Content ID
 * @param {object} payload - Updated content data
 */
export const updateContent = async (
  courseId,
  lectureId,
  contentId,
  payload
) => {
  try {
    const response = await patchData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}`,
      payload,
      true
    );
    return response;
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};

/**
 * Delete a content item
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {number} contentId - Content ID
 */
export const deleteContent = async (courseId, lectureId, contentId) => {
  try {
    const response = await deleteData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}`,
      {},
      true
    );
    return response;
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
};

// ============================================
// AI QUIZ GENERATION APIs
// ============================================

/**
 * Generate quiz questions using AI based on a topic
 * @param {number} courseId - Course ID
 * @param {object} payload - Generation parameters
 * @param {number} payload.lecture_id - Lecture ID
 * @param {string} payload.topic - Topic for quiz generation
 * @param {string} payload.difficulty - Difficulty level: easy, medium, hard (default: medium)
 * @param {number} payload.count - Number of questions (1-20, default: 5)
 * @param {string} payload.notes - Custom instructions (optional)
 * @param {array} payload.previous_questions - Previously generated questions to avoid (optional)
 */
export const generateQuizFromTopic = async (courseId, payload) => {
  try {
    // Payload must include lecture_id inside the body as per Swagger
    const response = await postData(
      `/courses/${courseId}/lectures/ai/generate-quiz`,
      payload,
      true
    );
    return response;
  } catch (error) {
    console.error("Error generating quiz from topic:", error);
    throw error;
  }
};

// 2. Fixed PDF Generation (Moves params to URL Query)
export const generateQuizFromPDF = async (courseId, file, params) => {
  try {
    // Construct Query Parameters string
    const queryParams = new URLSearchParams();
    queryParams.append("lecture_id", params.lecture_id);
    if (params.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params.count) queryParams.append("count", params.count);
    if (params.notes) queryParams.append("notes", params.notes);
    if (params.previous_questions) {
      // Only append if it exists, API might expect comma separated or repeated keys depending on framework
      // Usually JSON stringified in query is rare, but if Swagger says (query) for array, it usually means &previous_questions=A&previous_questions=B
      // If your backend expects simple string:
      queryParams.append(
        "previous_questions",
        JSON.stringify(params.previous_questions)
      );
    }

    const endpoint = `/courses/${courseId}/lectures/ai/generate-quiz-from-pdf?${queryParams.toString()}`;

    // FormData only contains the file
    const formData = new FormData();
    formData.append("file", file);

    const response = await postData(endpoint, formData, true);
    return response;
  } catch (error) {
    console.error("Error generating quiz from PDF:", error);
    throw error;
  }
};

/**
 * Create quiz content with AI generation from topic
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {object} payload - Content and generation parameters
 * @param {string} payload.title - Content title
 * @param {string} payload.description - Content description
 * @param {string} payload.topic - Topic for quiz generation
 * @param {string} payload.difficulty - Difficulty level: easy, medium, hard
 * @param {number} payload.count - Number of questions
 * @param {string} payload.notes - Custom instructions (optional)
 * @param {number} payload.quiz_duration - Quiz duration in minutes
 * @param {number} payload.max_attempts - Maximum attempts
 * @param {number} payload.passing_score - Passing score (0-100)
 * @param {number} payload.show_correct_answers - Show correct answers (0 or 1)
 * @param {number} payload.randomize_questions - Randomize questions (0 or 1)
 * @param {number} payload.randomize_options - Randomize options (0 or 1)
 * @param {number} payload.position - Content position
 */
export const createQuizContentFromTopic = async (
  courseId,
  lectureId,
  payload
) => {
  try {
    const response = await postData(
      `courses/${courseId}/lectures/${lectureId}/contents/create-with-ai`,
      payload,
      true
    );
    return response;
  } catch (error) {
    console.error("Error creating quiz content from topic:", error);
    throw error;
  }
};

/**
 * Create quiz content with AI generation from PDF
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {File} file - PDF file
 * @param {object} params - Content and generation parameters
 * @param {string} params.title - Content title
 * @param {string} params.description - Content description
 * @param {string} params.difficulty - Difficulty level: easy, medium, hard
 * @param {number} params.count - Number of questions
 * @param {string} params.notes - Custom instructions (optional)
 * @param {number} params.quiz_duration - Quiz duration in minutes
 * @param {number} params.max_attempts - Maximum attempts
 * @param {number} params.passing_score - Passing score (0-100)
 * @param {number} params.show_correct_answers - Show correct answers (0 or 1)
 * @param {number} params.randomize_questions - Randomize questions (0 or 1)
 * @param {number} params.randomize_options - Randomize options (0 or 1)
 * @param {number} params.position - Content position
 */
export const createQuizContentFromPDF = async (
  courseId,
  lectureId,
  file,
  params
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add all parameters to formData
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        formData.append(key, params[key]);
      }
    });

    const response = await postData(
      `courses/${courseId}/lectures/${lectureId}/contents/create-with-ai-pdf`,
      formData,
      true
    );
    return response;
  } catch (error) {
    console.error("Error creating quiz content from PDF:", error);
    throw error;
  }
};

// ============================================
// QUIZ QUESTIONS MANAGEMENT APIs
// ============================================

/**
 * Get all quiz questions for a content (Admin only - includes correct answers)
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {number} contentId - Content ID
 */
export const getQuizQuestions = async (courseId, lectureId, contentId) => {
  try {
    const response = await getData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}/questions`,
      true
    );
    return response;
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    throw error;
  }
};

/**
 * Edit a single quiz question
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {number} contentId - Content ID
 * @param {number} questionIndex - Question index (0-based)
 * @param {object} payload - Updated question data
 * @param {string} payload.question - Question text
 * @param {array} payload.options - Answer options
 * @param {number} payload.correct_answer - Index of correct answer
 * @param {string} payload.explanation_en - English explanation
 * @param {string} payload.explanation_ar - Arabic explanation
 */
export const updateQuizQuestion = async (
  courseId,
  lectureId,
  contentId,
  questionIndex,
  payload
) => {
  try {
    const response = await putData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}/questions/${questionIndex}`,
      payload,
      true
    );
    return response;
  } catch (error) {
    console.error("Error updating quiz question:", error);
    throw error;
  }
};

/**
 * Delete a single quiz question
 * @param {number} courseId - Course ID
 * @param {number} lectureId - Lecture ID
 * @param {number} contentId - Content ID
 * @param {number} questionIndex - Question index (0-based)
 */
export const deleteQuizQuestion = async (
  courseId,
  lectureId,
  contentId,
  questionIndex
) => {
  try {
    const response = await deleteData(
      `courses/${courseId}/lectures/${lectureId}/contents/${contentId}/questions/${questionIndex}`,
      {},
      true
    );
    return response;
  } catch (error) {
    console.error("Error deleting quiz question:", error);
    throw error;
  }
};

/**
 * Generate more quiz questions from a previously saved PDF source
 * @param {number} courseId - Course ID
 * @param {number} sourceId - Source ID (previously uploaded PDF)
 * @param {object} params - Generation parameters
 * @param {number} params.lecture_id - Lecture ID
 * @param {string} params.difficulty - Difficulty level: easy, medium, hard (default: medium)
 * @param {number} params.count - Number of questions (1-20, default: 5)
 * @param {string} params.notes - Custom instructions (optional)
 * @param {array} params.previous_questions - Previously generated questions to avoid (optional)
 */
export const generateMoreQuestionsFromSource = async (
  courseId,
  sourceId,
  params
) => {
  try {
    // Build query string
    let url = `courses/${courseId}/lectures/ai/generate-more-from-source/${sourceId}?lecture_id=${params.lecture_id}`;

    if (params.difficulty) {
      url += `&difficulty=${params.difficulty}`;
    }
    if (params.count) {
      url += `&count=${params.count}`;
    }
    if (params.notes) {
      url += `&notes=${encodeURIComponent(params.notes)}`;
    }
    if (params.previous_questions && params.previous_questions.length > 0) {
      params.previous_questions.forEach((q) => {
        url += `&previous_questions=${encodeURIComponent(q)}`;
      });
    }

    const response = await postData(url, {}, true);
    return response;
  } catch (error) {
    console.error("Error generating more questions from source:", error);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Lectures
  createLecture,
  listLectures,
  getLecture,
  updateLecture,
  deleteLecture,

  // Contents
  createContent,
  listContents,
  getContent,
  updateContent,
  deleteContent,

  // AI Quiz Generation
  generateQuizFromTopic,
  generateQuizFromPDF,
  createQuizContentFromTopic,
  createQuizContentFromPDF,
  generateMoreQuestionsFromSource,

  // Quiz Questions Management
  getQuizQuestions,
  updateQuizQuestion,
  deleteQuizQuestion,
};
