export type SiteContent = {
  meta: {
    name: string;
    title: string;
    description: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    batchTimings: string[];
  };
  home: {
    announcement: string;
    headline: string;
    intro: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: Array<{
    value: string;
    label: string;
  }>;
  courses: Array<{
    title: string;
    description: string;
    duration?: string;
  }>;
  services: string[];
  about: {
    eyebrow: string;
    title: string;
    body: string[];
  };
  highlights: Array<{
    title: string;
    description: string;
  }>;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
  }>;
};
