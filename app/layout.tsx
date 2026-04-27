import type { Metadata } from "next";
import "./globals.css";

import { siteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: {
    default: siteContent.meta.title,
    template: `%s | ${siteContent.meta.name}`,
  },
  description: siteContent.meta.description,
  metadataBase: new URL("https://www.arunandsaviation.com"),
  openGraph: {
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    type: "website",
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
