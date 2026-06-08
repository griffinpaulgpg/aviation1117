import type { Metadata } from "next";

import { Container } from "@/components/container";
import { CourseGridClient } from "@/components/course-grid-client";
import { PageHero } from "@/components/page-hero";
import { ThreeDFlow } from "@/components/three-d-flow";
import { siteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore aviation courses at Arunand's Aviation Academy, including cabin crew, ground handling, airport operations, airline operations, hospitality, and logistics.",
  openGraph: {
    title: "Aviation Courses",
    description:
      "Career-focused aviation training programs for students preparing for airport and airline roles.",
    url: "/courses",
  },
};

export default function CoursesPage() {
  const courses = siteContent.courses.map((course, index) => ({
    id: `fallback-course-${index}`,
    title: course.title,
    description: course.description,
    duration: course.duration,
    image: course.image,
    reachUsLink: `/enquiry?course=${encodeURIComponent(course.title)}`,
    status: "active" as const,
    order: index,
  }));

  return (
    <>
      <main className="site-sky">
        <PageHero
          eyebrow="Courses"
          title="Career-focused aviation courses."
          description="Explore training programs for cabin crew, ground handling, hospitality, airline operations, airport operations, and logistics management."
        />
        <section className="motion-section observe-section aviation-section py-20">
          <Container>
            <CourseGridClient initialCourses={courses} />
          </Container>
        </section>
        <section className="motion-section observe-section aviation-section bg-white/62 border-t border-white/70 py-20">
          <Container>
            <ThreeDFlow
              items={[
                "Shortlist a course based on your target role.",
                "Complete classroom, grooming, and practical exposure modules.",
                "Prepare for interviews with placement-focused training.",
              ]}
            />
          </Container>
        </section>
      </main>
    </>
  );
}
