import { getCourseById, getCourseLectures } from "@/services/CoursesServer";
import ContentClient from "./ContentClient";

export async function generateMetadata({ params }) {
  const { id, lectureId } = await params;
  const [course, lectures] = await Promise.all([
    getCourseById(id),
    getCourseLectures(id),
  ]);

  const lecture = lectures.find((l) => l.id === parseInt(lectureId));

  if (!course || !lecture) {
    return {
      title: "Content Not Found",
    };
  }

  return {
    title: `Content - ${lecture.name} - ${course.name}`,
    description: `Content for lecture ${lecture.name} of course ${course.name}`,
  };
}

export default async function Page({ params }) {
  const { id, lectureId } = await params;
  const [course, lectures] = await Promise.all([
    getCourseById(id),
    getCourseLectures(id),
  ]);

  const lecture = lectures.find((l) => l.id === parseInt(lectureId));

  return (
    <ContentClient
      initialCourse={course}
      initialLectures={lectures}
      initialCurrentLecture={lecture}
    />
  );
}
