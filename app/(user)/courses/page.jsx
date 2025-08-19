"use client";
import Link from "next/link";

const Courses = () => {
  return (
    <>
      <div className="flex items-center flex-col justify-center h-screen text-2xl font-bold min-h-screen text-gray-900 dark:text-white smooth">
        <div>Courses</div>

        <Link href="courses/1">Course 1 click here</Link>
      </div>
    </>
  );
};

export default Courses;
