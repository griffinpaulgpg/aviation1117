import Image from "next/image";

import { Container } from "@/components/container";
import { SiteFrame } from "@/components/site-frame";

const aboutParagraphs = [
  "We would like to take this opportunity to introduce Arunand's Aviation Academy. We are situated in the Silicon Valley of India, Bangalore. Arunand's Aviation Academy offers Aviation and Air Cargo Certificate courses.",
  "We are former airline employees with 15+ years of extensive experience in airline, cargo, catering, safety and security, intelligence vigilance, and airport operations.",
  "With our extensive knowledge of airline and airport operations, we have successfully placed our students to succeed in the aviation industry.",
  "Arunand's Aviation Academy is an experienced, ambitious, and rapidly expanding aviation training academy focused on delivering the best aviation courses to trainees.",
  "After successfully completing training, Arunand's Aviation Academy also specializes in providing 100% job support with a variety of career opportunities.",
  "We mold candidates through professional training that develops their skills, capabilities, communication, grooming, personality development, mock interviews, determination, teamwork, reliability, and politeness.",
];

const reasons = [
  {
    title: "Industry Experience",
    description: "Led by aviation professionals with 15+ years of airline and airport expertise.",
  },
  {
    title: "100% Placement Support",
    description: "We help students build careers in aviation through placement assistance.",
  },
  {
    title: "Professional Grooming",
    description: "Communication skills, personality development, and interview preparation.",
  },
  {
    title: "Practical Exposure",
    description: "Airport visits, internships, aviation briefings, and real-world learning.",
  },
];

const leaders = [
  {
    image: "/nandakumar-v.png",
    name: "Nandakumar V",
    role: "Founder & Aviation Industry Expert",
    paragraphs: [
      "Nandakumar V is a dynamic young professor and aviation industry expert with over 14 years of experience in the aviation sector. He began his career as a trainee customer security executive and advanced to assistant manager in airport operations and customer service.",
      "He possesses extensive expertise in safety and security, flight operations, audits, documentation coordination with HR, aviation briefings, surveillance, vigilance, crisis management, crew handling, passenger profiling, foreign pilot documentation, visa processing, and coordination with aviation authorities.",
    ],
  },
  {
    image: "/aruna.png",
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
    <SiteFrame>
      <main>
        <section className="bg-brand-dark py-20 text-center text-white">
          <Container>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">About Us</h1>
          </Container>
        </section>

        <section className="bg-[#f0f2f4]/80 py-20">
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
              <div className="rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
                <div className="mt-6 space-y-4 text-base leading-7 text-muted">
                  {aboutParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-background">
                  <Image
                    src="/aassc-affiliation.png"
                    alt="Arunand's Aviation Academy AASSC affiliation certificate"
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-border bg-white py-20">
          <Container>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Why Choose Us
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
                Training built around aviation careers.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map((reason) => (
                <article
                  key={reason.title}
                  className="rounded-lg border border-border bg-background p-6 shadow-sm"
                >
                  <h3 className="text-xl font-semibold text-foreground">{reason.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{reason.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 rounded-lg border border-border bg-background p-4 shadow-sm">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-white">
                <Image
                  src="/aassc-certificate.png"
                  alt="AASSC affiliation certificate"
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </div>
          </Container>
        </section>

        <section className="py-20">
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
                <article
                  key={leader.name}
                  className="rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="grid gap-6 sm:grid-cols-[10rem_1fr] sm:items-start">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-background">
                      <Image
                        src={leader.image}
                        alt={`${leader.name} owner photo`}
                        fill
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
    </SiteFrame>
  );
}
