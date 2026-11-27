import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Station pages (/hideout/<id>) are left out: their ids come from the data
// source, and /hideout already leads to them.
const routes = [
  "",
  "/ammunition",
  "/hideout",
  "/crafts",
  "/items",
  "/tasks",
  "/achievements",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.7,
  }));
}
