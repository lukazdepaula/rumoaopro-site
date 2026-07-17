import type { MetadataRoute } from "next";

const baseUrl = "https://rumoaopro.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${baseUrl}/assessoria`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95
    },
    {
      url: `${baseUrl}/en/coaching`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/programas`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75
    },
    {
      url: `${baseUrl}/cursos`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/en/courses`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.72
    },
    {
      url: `${baseUrl}/programas/adama-strength-power`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.82
    },
    {
      url: `${baseUrl}/programas/offseason-30-days`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.82
    },
    {
      url: `${baseUrl}/programas/projeto-36kmh`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.82
    },
    {
      url: `${baseUrl}/programas/elanga-in-season`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.82
    },
    {
      url: `${baseUrl}/programas/projeto-pre-temporada`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.78
    },
    {
      url: `${baseUrl}/programas/projeto-adama-2022`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.78
    },
    {
      url: `${baseUrl}/programas/projeto-36-2022`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.78
    },
    {
      url: `${baseUrl}/programas/de-volta-aos-gramados`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.78
    },
    {
      url: `${baseUrl}/en/programs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.72
    },
    {
      url: `${baseUrl}/en/programs/adama-strength-power`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/en/programs/offseason-30-days`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/en/programs/project-36kmh`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/en/programs/elanga-in-season`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/links`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/en/links`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.68
    }
  ];
}
