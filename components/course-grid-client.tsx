"use client";

import { useEffect, useState } from "react";

import { CourseCard } from "@/components/course-card";
import type { PublicCourse } from "@/lib/public-content-data";

function withTimeout<T>(promise: Promise<T>, timeoutMs = 4500) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Firebase course request timed out.")), timeoutMs);
    }),
  ]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

export function CourseGridClient({ initialCourses }: { initialCourses: PublicCourse[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [databaseWarning, setDatabaseWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFirebaseCourses() {
      try {
        const { getPublicFirebaseCoursesRest } = await import("@/lib/firebase-rest-public");
        const firebaseCourses = await withTimeout(getPublicFirebaseCoursesRest());

        if (!cancelled && firebaseCourses.length > 0) {
          setCourses(firebaseCourses);
          setDatabaseWarning(null);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase courses unavailable; using fallback courses.", error);
        }

        if (!cancelled) {
          setDatabaseWarning("Database connection unavailable. Showing default courses.");
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
