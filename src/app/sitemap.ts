import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://kalima.fun", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://kalima.fun/home", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://kalima.fun/rawabet", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://kalima.fun/pro", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
