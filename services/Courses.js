import axios from "@/libs/axios";

export const getFeaturedCourses = async () => {
  try {
    const response = await axios.get("/api/courses/featured_courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await axios.get(`/api/sellables/${id}?with_content=1`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw error;
  }
};
