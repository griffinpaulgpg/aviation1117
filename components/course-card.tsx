/* eslint-disable @next/next/no-html-link-for-pages */

import Image from "next/image";

import type { PublicCourse } from "@/lib/content-data";
import { shouldBypassImageOptimizer } from "@/lib/media";

export function CourseCard({ course }: { course: PublicCourse }) {
  const enquiryHref = course.reachUsLink || `/enquiry?course=${encodeURIComponent(course.title)}`;

  return (
    <article className="premium-card flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={course.image}
          alt={`${course.title} course training`}
          fill
          loading="lazy"
          quality={72}
          unoptimized={shouldBypassImageOptimizer(course.image)}
          className="object-cover"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="from-brand-dark/28 absolute inset-0 bg-gradient-to-t via-transparent to-white/10" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
          {course.duration ? (
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-brand-dark">
              {course.duration}
            </span>
          ) : null}
        </div>
        <p className="mt-4 flex-1 text-sm leading-7 text-muted">{course.description}</p>
        <a
          href={enquiryHref}
          className="premium-button mt-6 rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Reach Us Now
        </a>
      </div>
    </article>
  );
}
