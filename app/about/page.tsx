import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Arunand's Aviation Academy, an AASSC affiliated aviation training academy in Bangalore led by experienced airline professionals.",
  openGraph: {
    title: "About Arunand's Aviation Academy",
    description:
      "A Bangalore aviation academy focused on professional training, grooming, communication, and aviation career readiness.",
    url: "/about",
  },
};

const aboutParagraphs = [
  "We would like to take this opportunity to introduce Arunand's Aviation Academy. We are situated in the Silicon Valley of India, Bangalore. Arunand's Aviation Academy offers Aviation and Air Cargo Certificate courses.",
  "We are former airline employees with 15+ years of extensive experience in airline, cargo, catering, safety and security, intelligence vigilance, and airport operations.",
  "With our extensive knowledge of airline and airport operations, we have successfully placed our students to succeed in the aviation industry.",
  "Arunand's Aviation Academy is an experienced, ambitious, and rapidly expanding aviation training academy focused on delivering the best aviation courses to trainees.",
  "After successfully completing training, Arunand's Aviation Academy also specializes in providing 100% job support with a variety of career opportunities.",
  "We mold candidates through professional training that develops their skills, capabilities, communication, grooming, personality development, mock interviews, determination, teamwork, reliability, and politeness.",
];

const chooseItems = [
  {
    title: "Our Vision",
    description:
      "To provide the best skills to young hearts from our training programs where we can see them standing as leaders in and around the world. Our mission is also to send our talented trainees/students across the world to work with top leading Airlines, Airports, and Ground Handling.",
  },
  {
    title: "Training",
    description:
      "We provide our students with flight experience, airline and airport internships, and airport visits.",
  },
  {
    title: "Our Mission",
    description:
      "Our mission is to provide 100% placement to our candidates in the aviation industry with high exposure and professional qualities in the aviation industry. Also we are proud that our biggest achievement is that we have placed all our students into the best in the Airline industry.",
  },
  {
    title: "Placements",
    description:
      "Our biggest achievement is that we have placed all our students into the best in the Airline industry.",
  },
];

const leaders = [
  {
    image: "/nandakumar-v.webp",
    name: "Nandakumar V",
    role: "Founder & Aviation Industry Expert",
    paragraphs: [
      "Nandakumar V is a dynamic young professor and aviation industry expert with over 14 years of experience in the aviation sector. He began his career as a trainee customer security executive and advanced to assistant manager in airport operations and customer service.",
      "He possesses extensive expertise in safety and security, flight operations, audits, documentation coordination with HR, aviation briefings, surveillance, vigilance, crisis management, crew handling, passenger profiling, foreign pilot documentation, visa processing, and coordination with aviation authorities.",
    ],
  },
  {
    image: "/aruna.webp",
    name: "Aruna",
    role: "Managing Director Academic",
    paragraphs: [
      "Ms. Aruna is a seasoned aviation professional with over 8 years of expertise in customer service and VIP passenger handling at Chennai and Bangalore international airports.",
      "She serves as grooming incharge and is a certified makeup artist who trains students in professional appearance and communication.",
      "As Managing Director Academic, she has over 5 years of teaching experience in aviation core subjects, soft skills, customer service, and VIP passenger handling.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <main className="site-sky">
        <section className="observe-section page-hero py-20 text-center text-white">
          <div className="hero-orbit md:block" aria-hidden="true" />
          <div className="hero-cloud hero-cloud-one lg:block" aria-hidden="true" />
          <Container>
            <div className="page-hero-panel mx-auto max-w-3xl rounded-[2rem] border border-white/16 bg-white/10 p-6 shadow-[0_24px_60px_rgba(11,19,32,0.18)] backdrop-blur-xl sm:p-8 lg:p-10">
              <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">About Us</h1>
            </div>
          </Container>
        </section>

        <section className="observe-section aviation-section bg-white/50 py-20">
          <Container>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                About Academy
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                Arunand&apos;s Aviation Academy
              </h2>
            </div>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="premium-card p-6 sm:p-8">
                <div className="mt-6 space-y-4 text-base leading-7 text-muted">
                  {aboutParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="premium-card p-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-background">
                  <Image
                    src="/aassc-affiliation.webp"
                    alt="Arunand's Aviation Academy AASSC affiliation certificate"
                    fill
                    loading="lazy"
                    quality={72}
                    className="object-contain"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="observe-section aviation-section border-t border-white/70 bg-white/70 py-20">
          <Container>
            <h2 className="text-center text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Why Choose Us
            </h2>
            <div className="mt-12 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
                {chooseItems.map((item) => (
                  <article key={item.title}>
                    <h3 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                      {item.title}
                    </h3>
                    <p className="mt-6 text-base leading-7 text-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
              <div className="premium-card p-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-white">
                  <Image
                    src="/aassc-certificate.webp"
                    alt="AASSC affiliation certificate"
                    fill
                    loading="lazy"
                    quality={72}
                    className="object-contain"
                    sizes="(min-width: 1024px) 52vw, 100vw"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="observe-section aviation-section py-20">
          <Container>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Our Leadership
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
                Guided by experienced aviation professionals.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {leaders.map((leader) => (
                <article key={leader.name} className="premium-card p-6 sm:p-8">
                  <div className="grid gap-6 sm:grid-cols-[10rem_1fr] sm:items-start">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-background">
                      <Image
                        src={leader.image}
                        alt={`${leader.name} owner photo`}
                        fill
                        loading="lazy"
                        quality={72}
                        className="object-cover"
                        sizes="10rem"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">{leader.name}</h3>
                      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                        {leader.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
                    {leader.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
