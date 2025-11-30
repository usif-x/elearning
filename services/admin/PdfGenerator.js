import api from "@/libs/axios";
import Cookies from "js-cookie";

const getAuthHeaders = () => {
  const token = Cookies.get("auth-storage")
    ? JSON.parse(Cookies.get("auth-storage")).state?.token
    : null;

  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const generateExam = async (formData) => {
  const headers = getAuthHeaders();
  // Ensure multipart/form-data is set if not automatically handled
  headers["Content-Type"] = "multipart/form-data";

  const response = await api.post("/pdf-question/generate-exam/", formData, {
    headers,
    responseType: "blob", // Important for PDF download
  });
  return response;
};

export const generateExamFromText = async (data) => {
  const headers = getAuthHeaders();
  headers["Content-Type"] = "application/x-www-form-urlencoded";

  const response = await api.post("/pdf-question/generate-from-text/", data, {
    headers,
    responseType: "blob",
  });
  return response;
};

export const generateExamFromPdf = async (formData) => {
  const headers = getAuthHeaders();
  headers["Content-Type"] = "multipart/form-data";

  const response = await api.post("/pdf-question/generate-from-pdf/", formData, {
    headers,
    responseType: "blob",
  });
  return response;
};

export const checkHealth = async () => {
  const response = await api.get("/pdf-question/health");
  return response.data;
};
