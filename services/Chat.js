import { deleteData, getData, postData, putData } from "@/libs/axios";

// ==================== Session Management ====================

/**
 * Create a new chat session from text content
 * @param {Object} data - Session data
 * @param {string} data.title - Session title
 * @param {string} data.content - Educational content
 * @param {string} data.language - Language ('en' or 'ar')
 * @param {string} data.session_type - Session type ('asking' or 'explaining')
 * @returns {Promise<Object>} Created session
 */
export const createChatSession = async (data) => {
  return await postData("/chat/sessions", data, true);
};

/**
 * Create a new chat session from PDF file
 * @param {FormData} formData - Contains title, language, session_type, and pdf_file
 * @returns {Promise<Object>} Created session
 */
export const createChatSessionFromPdf = async (formData) => {
  return await postData("/chat/sessions/from-pdf", formData, true);
};

/**
 * Get list of chat sessions
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 20)
 * @param {boolean} params.active_only - Show only active sessions
 * @returns {Promise<Object>} Sessions list with pagination
 */
export const getChatSessions = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.page_size) queryParams.append("page_size", params.page_size);
  if (params.active_only !== undefined)
    queryParams.append("active_only", params.active_only);

  const query = queryParams.toString();
  return await getData(`/chat/sessions${query ? `?${query}` : ""}`, true);
};

/**
 * Get chat session details with messages
 * @param {number} sessionId - Session ID
 * @returns {Promise<Object>} Session details with messages
 */
export const getChatSession = async (sessionId) => {
  return await getData(`/chat/sessions/${sessionId}`, true);
};

/**
 * Update chat session
 * @param {number} sessionId - Session ID
 * @param {Object} data - Update data (title, language, is_active)
 * @returns {Promise<Object>} Updated session
 */
export const updateChatSession = async (sessionId, data) => {
  return await putData(`/chat/sessions/${sessionId}`, data, true);
};

/**
 * Delete chat session
 * @param {number} sessionId - Session ID
 * @returns {Promise<void>}
 */
export const deleteChatSession = async (sessionId) => {
  return await deleteData(`/chat/sessions/${sessionId}`, true);
};

// ==================== Chat Messages ====================

/**
 * Send a message in a chat session
 * @param {number} sessionId - Session ID
 * @param {string} message - User message
 * @returns {Promise<Object>} User and assistant messages
 */
export const sendChatMessage = async (sessionId, message) => {
  return await postData(
    `/chat/sessions/${sessionId}/messages`,
    { message },
    true
  );
};

/**
 * Get chat messages for a session
 * @param {number} sessionId - Session ID
 * @param {number} limit - Optional limit on number of messages
 * @returns {Promise<Array>} List of messages
 */
export const getChatMessages = async (sessionId, limit = null) => {
  const query = limit ? `?limit=${limit}` : "";
  return await getData(`/chat/sessions/${sessionId}/messages${query}`, true);
};

/**
 * Send a message with streaming response (SSE)
 * @param {number} sessionId - Session ID
 * @param {string} message - User message
 * @param {Function} onContent - Callback for content chunks (chunk) => void
 * @param {Function} onUserMessage - Callback when user message is saved
 * @param {Function} onDone - Callback when streaming is complete (message) => void
 * @param {Function} onError - Callback for errors (error) => void
 * @returns {Promise<void>}
 */
export const sendChatMessageStream = async (
  sessionId,
  message,
  onContent,
  onUserMessage,
  onDone,
  onError
) => {
  // Get token from cookies (same way as axios helpers)
  const getToken = () => {
    if (typeof window === "undefined") return null;
    const authStorage = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-storage="));
    if (!authStorage) return null;
    try {
      const data = JSON.parse(decodeURIComponent(authStorage.split("=")[1]));
      return data?.state?.token || null;
    } catch {
      return null;
    }
  };

  const token = getToken();
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (!token) {
    onError?.("No authentication token found");
    return;
  }

  try {
    const response = await fetch(
      `${baseURL}/chat/sessions/${sessionId}/messages/stream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case "user_message":
                onUserMessage?.(data.message);
                break;
              case "content":
                onContent?.(data.content);
                break;
              case "done":
                onDone?.(data.message);
                return;
              case "error":
                onError?.(data.error);
                return;
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Streaming error:", error);
    onError?.(error.message);
  }
};
