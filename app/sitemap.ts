import type { MetadataRoute } from "next";

const baseUrl = "https://www.arunandsaviation.com";

const publicRoutes = [
  "",
  "/about",
  "/courses",
  "/events",
  "/gallery",
  "/testimonials",
  "/enquiry",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
