import type { Metadata } from "next";

import { Container } from "@/components/container";
import { CourseGridClient } from "@/components/course-grid-client";
import { PageHero } from "@/components/page-hero";
import { ThreeDFlow } from "@/components/three-d-flow";
import { getPublicCourses } from "@/lib/public-content-data";

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

export default async function CoursesPage() {
  const courses = await getPublicCourses();

  return (
    <>
      <main className="site-sky">
        <PageHero
          eyebrow="Courses"
          title="Career-focused aviation courses."
          description="Explore training programs for cabin crew, ground handling, hospitality, airline operations, airport operations, and logistics management."
        />
        <section className="aviation-section py-20">
          <Container>
            <CourseGridClient initialCourses={courses} />
          </Container>
        </section>
        <section className="aviation-section bg-white/62 border-t border-white/70 py-20">
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
