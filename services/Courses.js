import axios from "@/libs/axios";

export const getFeaturedCourses = async () => {
  try {
    const response = await axios.get("courses");
    return response.data.courses || [];
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await axios.get(`courses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw error;
  }
};
