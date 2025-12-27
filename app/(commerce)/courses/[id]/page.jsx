import { getCourseById, getCourseLectures } from "@/services/CoursesServer";
import CourseClient from "./CourseClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: course.name,
    description: course.description,
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const [course, lectures] = await Promise.all([
    getCourseById(id),
    getCourseLectures(id),
  ]);

  return <CourseClient initialCourse={course} initialLectures={lectures} />;
}
