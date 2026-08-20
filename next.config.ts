import type { NextConfig } from "next";

const legacyShopifyProducts = [
  ["projeto-36-12-semanas", "/programas/projeto-36kmh"],
  [
    "project-36km-h-12-week-speed-acceleration-program-for-footballers",
    "/en/programs/project-36kmh"
  ],
  [
    "project-36km-h-free-demo-speed-acceleration-program",
    "/en/programs/project-36kmh"
  ],
  ["offseason-program-30-days", "/en/programs/offseason-30-days"],
  ["offseason-program-demo-7-days", "/en/programs/offseason-30-days"],
  ["preseason-project-12-weeks", "/en/programs/offseason-30-days"],
  ["projeto-adama-9-semanas", "/programas/projeto-adama-2022"],
  ["projeto-adama-ii", "/programas/projeto-adama-2022"],
  [
    "offseason-strength-and-power-the-adama-project-12-weeks",
    "/en/programs/adama-strength-power"
  ],
  ["projeto-pre-temporada", "/programas/projeto-pre-temporada"],
  ["projeto-pre-temporada-2-0-2019", "/programas/projeto-pre-temporada"],
  [
    "jogue-os-90-minutos-pre-temporada-3-0",
    "/programas/projeto-pre-temporada"
  ],
  [
    "jogue-os-90-minutos-pre-temporada-2-0",
    "/programas/projeto-pre-temporada"
  ],
  [
    "jogue-os-90-minutos-pre-temporada-2-0-10-semanas",
    "/programas/projeto-pre-temporada"
  ],
  [
    "pacote-j90-minutos-pre-temporada-atletas-em-offseason",
    "/programas/projeto-pre-temporada"
  ],
  [
    "de-volta-aos-gramados-rehabilitacao-de-pubalgia",
    "/programas/de-volta-aos-gramados"
  ],
  ["elanga-project", "/en/programs/elanga-in-season"],
  ["projeto-lindsey-in-season", "/programas/elanga-in-season"],
  ["preparopro-plataforma-para-preparadores", "/cursos"],
  ["1on1coaching", "/assessoria"],
  ["sessao-no-skype-com-lucas-de-paula", "/assessoria"],
  ["chamada-no-zoom-1x1-com-lukaz-de-paula", "/assessoria"]
] as const;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      ...legacyShopifyProducts.flatMap(([handle, destination]) => [
        {
          source: `/products/${handle}`,
          destination,
          permanent: true
        },
        {
          source: `/collections/:collection/products/${handle}`,
          destination,
          permanent: true
        }
      ]),
      {
        source: "/products/:handle",
        destination: "/programas",
        permanent: true
      },
      {
        source: "/collections/:collection/products/:handle",
        destination: "/programas",
        permanent: true
      },
      {
        source: "/collections/:collection/:path*",
        destination: "/programas",
        permanent: true
      },
      {
        source: "/collections/:collection",
        destination: "/programas",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          {
            key: "Content-Security-Policy",
            value:
              "base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'"
          }
        ]
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }]
      },
      {
        source: "/admin-sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/admin" }
        ]
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'"
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com"
      },
      {
        protocol: "https",
        hostname: "www.rumoaopro.com.br"
      }
    ]
  }
};

export default nextConfig;
