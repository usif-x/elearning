import {
  getContent,
  getCourseById,
  getCourseLectures,
} from "@/services/CoursesServer";
import ContentDetailClient from "./ContentDetailClient";

export async function generateMetadata({ params }) {
  const { id, lectureId, contentId } = await params;
  const [course, content] = await Promise.all([
    getCourseById(id),
    getContent(id, lectureId, contentId),
  ]);

  if (!course || !content) {
    return {
      title: "Content Not Found",
    };
  }

  return {
    title: `${content.title} - ${course.name}`,
    description:
      content.description ||
      `Content ${content.title} of course ${course.name}`,
  };
}

export default async function Page({ params }) {
  const { id, lectureId, contentId } = await params;
  const [course, lectures, content] = await Promise.all([
    getCourseById(id),
    getCourseLectures(id),
    getContent(id, lectureId, contentId),
  ]);

  return (
    <ContentDetailClient
      initialCourse={course}
      initialLectures={lectures}
      initialContent={content}
    />
  );
}
