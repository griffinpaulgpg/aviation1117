"use client";

import { useEffect, useState } from "react";

import { CourseCard } from "@/components/course-card";
import type { PublicCourse } from "@/lib/public-content-data";
import { loadClientCourses } from "@/src/lib/firebase-client-loaders";

export function CourseGridClient({ initialCourses }: { initialCourses: PublicCourse[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [databaseWarning, setDatabaseWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFirebaseCourses() {
      try {
        const { courses: firebaseCourses, warning } = await loadClientCourses();

        if (!cancelled) {
          setCourses(firebaseCourses);
          setDatabaseWarning(warning);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase courses unavailable; using fallback courses.", error);
        }

        if (!cancelled) {
          setDatabaseWarning("Live data is temporarily unavailable. Showing saved website content.");
        }
      }
    }

    void loadFirebaseCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-6">
      {databaseWarning ? (
        <p className="rounded-2xl border border-sky-100 bg-white/75 px-5 py-4 text-sm font-semibold text-muted">
          {databaseWarning}
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id ?? course.title} course={course} />
        ))}
      </div>
    </div>
  );
}
