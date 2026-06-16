"use client";

import { useEffect, useState } from "react";

import { CourseCard } from "@/components/course-card";
import type { PublicCourse } from "@/lib/public-content-data";
import { scheduleBrowserIdleTask } from "@/src/lib/browser-idle";

export function CourseGridClient({ initialCourses }: { initialCourses: PublicCourse[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [databaseWarning, setDatabaseWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFirebaseCourses() {
      try {
        const { loadClientCourses } = await import("@/src/lib/firebase-client-loaders");
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

    const cancelIdleTask = scheduleBrowserIdleTask(() => {
      void loadFirebaseCourses();
    }, 1800, 5000);

    return () => {
      cancelled = true;
      cancelIdleTask();
    };
  }, []);

  return (
    <div className="grid gap-6">
      {databaseWarning ? (
        <p className="rounded-2xl border border-sky-100 bg-white/75 px-5 py-4 text-sm font-semibold text-muted">
          {databaseWarning}
        </p>
      ) : null}
      <div className="public-course-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id ?? course.title} course={course} />
        ))}
      </div>
    </div>
  );
}
