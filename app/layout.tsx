import type { Metadata } from "next";
import "./globals.css";

import { FloatingWidgetsClient } from "@/components/floating-widgets-client";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
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
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Footer />
        <FloatingWidgetsClient />
      </body>
    </html>
  );
}
