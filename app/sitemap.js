import {
  getCourseLectures,
  getFeaturedCourses,
} from "@/services/CoursesServer";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guest-questions-forum`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/teaching-session`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ai-explain`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/pdf-question-file`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/practice-quiz`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/questions-forum`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Dynamic course routes
  let dynamicRoutes = [];
  try {
    const courses = await getFeaturedCourses();

    for (const course of courses) {
      // Course page
      dynamicRoutes.push({
        url: `${baseUrl}/courses/${course.id}`,
        lastModified: new Date(course.updated_at || course.created_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // Lecture list page
      dynamicRoutes.push({
        url: `${baseUrl}/courses/${course.id}/lecture`,
        lastModified: new Date(course.updated_at || course.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });

      // Fetch lectures
      const lectures = await getCourseLectures(course.id);

      for (const lecture of lectures) {
        // Lecture detail page
        dynamicRoutes.push({
          url: `${baseUrl}/courses/${course.id}/lecture/${lecture.id}`,
          lastModified: new Date(course.updated_at || course.created_at),
          changeFrequency: "weekly",
          priority: 0.7,
        });

        // Content list page
        dynamicRoutes.push({
          url: `${baseUrl}/courses/${course.id}/lecture/${lecture.id}/content`,
          lastModified: new Date(course.updated_at || course.created_at),
          changeFrequency: "weekly",
          priority: 0.6,
        });

        // Contents
        if (lecture.contents) {
          for (const content of lecture.contents) {
            dynamicRoutes.push({
              url: `${baseUrl}/courses/${course.id}/lecture/${lecture.id}/content/${content.id}`,
              lastModified: new Date(course.updated_at || course.created_at),
              changeFrequency: "weekly",
              priority: 0.6,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching courses for sitemap:", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
