import { getCourseById, getCourseLectures } from "@/services/CoursesServer";
import LectureDetailClient from "./LectureDetailClient";

export async function generateMetadata({ params }) {
  const { id, lectureId } = await params;
  const [course, lectures] = await Promise.all([
    getCourseById(id),
    getCourseLectures(id),
  ]);

  const lecture = lectures.find((l) => l.id === parseInt(lectureId));

  if (!course || !lecture) {
    return {
      title: "Lecture Not Found",
    };
  }

  return {
    title: `${lecture.name} - ${course.name}`,
    description:
      lecture.description || `Lecture ${lecture.name} of course ${course.name}`,
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
    <LectureDetailClient
      initialCourse={course}
      initialLectures={lectures}
      initialCurrentLecture={lecture}
    />
  );
}
