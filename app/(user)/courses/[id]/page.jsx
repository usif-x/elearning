"use client";

import { useParams } from "next/navigation";

const CourseData = () => {
  const { id } = useParams();

  return (
    <div className="flex items-center justify-center h-screen text-2xl font-bold min-h-screen text-gray-900 dark:text-white smooth">
      Course ID: {id}
    </div>
  );
};

export default CourseData;
