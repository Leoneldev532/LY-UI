import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const BASE_URL = "https://ly-ui.vercel.app";

function getPageUrl(slug?: string[]) {
  if (!slug || slug.length === 0) return `${BASE_URL}/docs`;
  return `${BASE_URL}/docs/${slug.join("/")}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const urls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  // Add all docs pages from the page tree
  function walk(node: any, parentSlug: string[] = []) {
    if (node.slug && node.slug.length > 0) {
      urls.push({
        url: getPageUrl(node.slug),
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: node.slug.length === 1 ? 0.8 : 0.6,
      });
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child, node.slug || []);
      }
    }
  }

  for (const child of source.pageTree.children) {
    walk(child);
  }

  return urls;
}
