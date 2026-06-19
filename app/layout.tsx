import type { Metadata } from "next";
import "./globals.css";

import { Header } from "@/components/header";
import { PageTransitionShell } from "@/components/page-transition-shell";
import { Footer } from "@/components/footer";
import { RootClientEnhancements } from "@/components/root-client-enhancements";
import { TopMarquee } from "@/components/top-marquee";
import { siteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: {
    default: siteContent.meta.title,
    template: `%s | ${siteContent.meta.name}`,
  },
  description: siteContent.meta.description,
  metadataBase: new URL("https://www.arunandsaviation.com"),
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    type: "website",
    siteName: siteContent.meta.name,
    images: [
      {
        url: "/images/company-logo.png",
        width: 512,
        height: 512,
        alt: siteContent.meta.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    images: ["/images/company-logo.png"],
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteContent.meta.name,
    url: "https://www.arunandsaviation.com",
    logo: "https://www.arunandsaviation.com/images/company-logo.png",
    description: siteContent.meta.description,
    email: siteContent.contact.email,
    telephone: siteContent.contact.phone,
    sameAs: siteContent.contact.socialLinks.map((link) => link.href),
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "3rd Floor, AMS Complex, No 182/183, Bagalur Main Rd, opposite Indian Oil Petrol Bunk, Dwarka Nagar, Kattigenahalli",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560064",
      addressCountry: "IN",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteContent.meta.name,
    url: "https://www.arunandsaviation.com",
    description: siteContent.meta.description,
    inLanguage: "en-IN",
  };

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Header />
        <TopMarquee />
        <RootClientEnhancements />
        <PageTransitionShell>{children}</PageTransitionShell>
        <Footer />
      </body>
    </html>
  );
}
