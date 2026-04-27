import type { SiteContent } from "@/types/site-content";

type Course = SiteContent["courses"][number];

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
        {course.duration ? (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-brand-dark">
            {course.duration}
          </span>
        ) : null}
      </div>
      <p className="mt-4 flex-1 text-sm leading-7 text-muted">{course.description}</p>
    </article>
  );
}
