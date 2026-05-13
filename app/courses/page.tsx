import { Container } from "@/components/container";
import { CourseCard } from "@/components/course-card";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";
import { ThreeDFlow } from "@/components/three-d-flow";
import { getPublicCourses } from "@/lib/content-data";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getPublicCourses();

  return (
    <SiteFrame>
      <main className="site-sky">
        <PageHero
          eyebrow="Courses"
          title="Career-focused aviation courses."
          description="Explore training programs for cabin crew, ground handling, hospitality, airline operations, airport operations, and logistics management."
        />
        <section className="aviation-section py-20">
          <Container>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.title} course={course} />
              ))}
            </div>
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
    </SiteFrame>
  );
}
