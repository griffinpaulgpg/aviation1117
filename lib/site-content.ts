import type { SiteContent } from "@/types/site-content";

export const siteContent = {
  meta: {
    name: "Arunand's Aviation Academy",
    title: "Arunand's Aviation Academy | Aviation Training in Bangalore",
    description:
      "Aviation, cabin crew, ground handling, airport operations, airline operations, hospitality, and logistics training academy in Bangalore.",
  },
  contact: {
    email: "info@arunandsaviation.com",
    phone: "+91 9035043521",
    address:
      "Arunand's Aviation Institute Pvt Ltd, 3rd Floor, AMS Complex, No 182/183, Bagalur Main Rd, opposite to Indian Oil Petrol Bunk, above Clique Salon, Munneshwara Block, Dwarka Nagar, Kattigenahalli, Bengaluru, Karnataka 560064",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=Arunand%27s%20Aviation%20Institute%20Pvt%20Ltd%203rd%20Floor%20AMS%20Complex%20No%20182%20183%20Bagalur%20Main%20Rd%20Kattigenahalli%20Bengaluru%20560064",
    mapEmbedUrl:
      "https://www.google.com/maps?q=Arunand%27s%20Aviation%20Institute%20Pvt%20Ltd%203rd%20Floor%20AMS%20Complex%20No%20182%20183%20Bagalur%20Main%20Rd%20Kattigenahalli%20Bengaluru%20560064&z=17&output=embed",
    batchTimings: ["10:00 am to 01:00 pm", "03:00 pm to 06:00 pm"],
    socialLinks: [
      {
        label: "Instagram",
        href: "https://www.instagram.com/arunands_aviation?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      },
      {
        label: "YouTube",
        href: "https://youtube.com/@arunandsaviationacademy-vt8pp?si=Zv3GroY01l-MMRly",
      },
    ],
  },
  home: {
    headline: "Unlock your wings at a leading aviation academy in Bangalore.",
    intro:
      "Arunand's Aviation Academy trains students for cabin crew, ground handling, airport operations, airline operations, hospitality, air cargo, and logistics careers with practical guidance from former airline professionals.",
    primaryCta: "Submit Enquiry",
    secondaryCta: "Explore Courses",
  },
  stats: [
    { value: "550+", label: "Students Trained" },
    { value: "10+", label: "Services" },
    { value: "6", label: "Career courses" },
    { value: "15+", label: "Years experience" },
  ],
  courses: [
    {
      title: "Cabin Crew",
      duration: "6 months",
      image: "/course-cabin-crew.webp",
      description:
        "Training for passenger safety, comfort, boarding support, ticket checks, flight information, safety procedures, onboard service, and emergency response.",
    },
    {
      title: "Ground Handling",
      image: "/course-ground-handling.webp",
      description:
        "Airport support services including passenger check-in, baggage and cargo handling, aircraft servicing, and coordinated ground movement.",
    },
    {
      title: "Hospitality",
      image: "/course-hospitality.webp",
      description:
        "Customer service, hospitality management, food and beverage basics, tourism awareness, hospitality law, cultural awareness, and hands-on hotel exposure.",
    },
    {
      title: "Airline Operations",
      image: "/course-airline-operations.webp",
      description:
        "Safe, secure, and on-time airline operations including reservations, ticketing, departures, check-in counters, baggage screening, and guest assistance.",
    },
    {
      title: "Airport Operations",
      image: "/course-airport-operations.webp",
      description:
        "Airport management fundamentals, budgeting, marketing, air traffic control principles, pilot communication, routing, and passenger flow.",
    },
    {
      title: "Logistics and Management",
      duration: "3 months",
      image: "/course-logistics-management.webp",
      description:
        "Cargo and logistics training covering shipment movement, tracking, inventory, carrier coordination, customs, and import or export regulations.",
    },
  ],
  services: [
    "Aviation subject teaching for colleges",
    "Airport visits for BBA Aviation project work",
    "Airport and airline operations internships",
    "In-flight experience programs",
    "Industry guest lectures",
    "30-hour aviation VAP course for non-aviation students",
    "Placement training",
    "Grooming",
    "Personality development",
    "Mock interview sessions",
  ],
  about: {
    eyebrow: "Affiliated training partner with AASSC",
    title: "Arunand's Aviation Academy",
    body: [
      "Arunand's Aviation Academy is based in Bangalore, the Silicon Valley of India, and offers Aviation and Air Cargo Certificate courses. The academy is led by former airline employees with 15+ years of experience across airline operations, cargo, catering, safety and security, intelligence vigilance, and airport operations.",
      "As an experienced and rapidly expanding aviation training academy, we focus on practical aviation courses, career guidance, and placement support. We train candidates in reliability, grooming, communication skills, personality development, mock interviews, determination, teamwork, and professional conduct so they can reach their future goals.",
    ],
  },
  highlights: [
    {
      title: "Vision",
      description:
        "To provide the best skills to young hearts through training programs that prepare them to become aviation leaders across the world.",
    },
    {
      title: "Mission",
      description:
        "To provide placement-focused aviation training with strong professional exposure and industry-ready qualities.",
    },
    {
      title: "Training",
      description:
        "Students gain flight experience, airport visits, airline exposure, internships, grooming, and interview preparation.",
    },
    {
      title: "AASSC Update",
      description:
        "Arunand's Aviation Academy has joined forces with the Aerospace & Aviation Sector Skill Council under NSDC, Government of India.",
    },
  ],
  testimonials: [
    {
      quote:
        "A million thanks to Arunand's Aviation for helping students gain aviation knowledge, communication skills, and grooming.",
      name: "Vivek",
      role: "Officer Security, SpiceJet Airline",
    },
    {
      quote:
        "Excellent teaching. Classes were interactive and informative, with constant motivation and support for grooming and placement.",
      name: "Sushmitha",
      role: "Ramp Officer, Celebi Aviation",
    },
    {
      quote:
        "Arunand's Aviation has vast aviation experience and gives strong knowledge about the aviation industry.",
      name: "Chethan",
      role: "Safety and Security Officer, SpiceJet Airline",
    },
    {
      quote:
        "The training helped me prepare for a customer-facing aviation career with confidence.",
      name: "Sonia",
      role: "Customer Service Executive, Elite - Bangalore International Airport T2",
    },
  ],
  gallery: [
    {
      title: "Airport Exposure",
      image: "/home-students.webp",
      alt: "Airport terminal interior",
    },
    {
      title: "Flight Training Mindset",
      image: "/course-ground-handling.webp",
      alt: "Aircraft wing above clouds",
    },
    {
      title: "Professional Grooming",
      image: "/home-cabin-training.webp",
      alt: "Professional training discussion",
    },
  ],
  events: [
    {
      title: "Airport Visit Program",
      date: "Upcoming",
      description:
        "Guided airport exposure for aviation students preparing for airport and airline operations roles.",
    },
    {
      title: "Mock Interview Week",
      date: "Monthly",
      description:
        "Practical interview sessions focused on grooming, communication, confidence, and aviation role readiness.",
    },
    {
      title: "Industry Guest Lecture",
      date: "Quarterly",
      description:
        "Sessions led by aviation professionals covering current airline, airport, cargo, and customer service expectations.",
    },
  ],
} satisfies SiteContent;
