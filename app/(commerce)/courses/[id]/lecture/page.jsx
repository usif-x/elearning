import { getCourseById, getCourseLectures } from "@/services/CoursesServer";
import LecturesClient from "./LecturesClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: `Lectures - ${course.name}`,
    description: `Lectures for ${course.name}. ${course.description}`,
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const [course, lectures] = await Promise.all([
    getCourseById(id),
    getCourseLectures(id),
  ]);

  return <LecturesClient initialCourse={course} initialLectures={lectures} />;
}
