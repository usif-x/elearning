import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  headers: {},
});

// ✅ Helper لإضافة التوكن
const getAuthHeaders = () => {
  const token = Cookies.get("auth-storage")
    ? JSON.parse(Cookies.get("auth-storage")).state?.token
    : null;

  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ✅ GET
export const getData = async (endpoint, auth = false) => {
  try {
    const headers = auth ? getAuthHeaders() : {};
    const res = await api.get(endpoint, { headers });
    return res.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || error.message || "Something went wrong"
    );
    throw error;
  }
};

// ✅ POST
export const postData = async (endpoint, data, auth = false) => {
  try {
    const headers = auth ? getAuthHeaders() : {};
    const res = await api.post(endpoint, data, { headers });
    return res.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || error.message || "Something went wrong"
    );

    throw error;
  }
};

// ✅ PUT
export const putData = async (endpoint, data, auth = false) => {
  try {
    const headers = auth ? getAuthHeaders() : {};
    const res = await api.put(endpoint, data, { headers });
    return res.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || error.message || "Something went wrong"
    );

    throw error;
  }
};

// ✅ DELETE
export const deleteData = async (endpoint, data = {}, auth = true) => {
  try {
    const headers = auth ? getAuthHeaders() : {};

    const res = await api.delete(endpoint, {
      headers,
      data, // 💥 أهم سطر — يرسل الـ body في DELETE
    });

    return res.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || error.message || "Something went wrong"
    );
    throw error;
  }
};

export const patchData = async (endpoint, data, auth = false) => {
  try {
    const headers = auth ? getAuthHeaders() : {};
    const res = await api.patch(endpoint, data, { headers });
    return res.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || error.message || "Something went wrong"
    );

    throw error;
  }
};
export default api;
