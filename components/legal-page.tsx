import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contact, nav } from "@/lib/content";
import {
  legalContent,
  legalRoutes,
  type LegalDocument,
  type LegalLocale
} from "@/lib/legal-content";

type LegalPageProps = {
  document: LegalDocument;
  locale: LegalLocale;
};

const legalIdentity = {
  name: process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() || "RumoAoPro",
  document: process.env.NEXT_PUBLIC_LEGAL_DOCUMENT?.trim() || "",
  address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() || ""
};

function formatLegalText(value: string) {
  return value
    .replaceAll("{{email}}", contact.email)
    .replaceAll("{{whatsapp}}", "+55 19 99281-1078");
}

export function LegalPage({ document, locale }: LegalPageProps) {
  const content = legalContent[locale][document];
  const routes = legalRoutes[locale];
  const english = locale === "en";
  const languageHref = english
    ? legalRoutes.pt[document].href
    : legalRoutes.en[document].href;
  const identityLabels = english
    ? {
        title: "Service provider",
        brand: "Brand",
        legalName: "Legal name",
        document: "Registration",
        address: "Address",
        email: "Email",
        whatsapp: "WhatsApp"
      }
    : {
        title: "Identificação do fornecedor",
        brand: "Marca",
        legalName: "Nome empresarial",
        document: "CPF/CNPJ",
        address: "Endereço",
        email: "E-mail",
        whatsapp: "WhatsApp"
      };

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        ctaHref={english ? "/en/programs" : "/programas"}
        ctaLabel={english ? "Programs" : "Programas"}
        languageHref={languageHref}
        navItems={english ? nav.en : nav.pt}
      />

      <section className="border-b border-white/10 bg-ink text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-bold uppercase text-gold">{content.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl uppercase leading-[1.04] sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
            {content.summary}
          </p>
          <p className="mt-6 text-sm font-semibold text-white/55">
            {content.updatedLabel}: {content.updatedAt}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-bold uppercase text-graphite/50">
            {english ? "Legal documents" : "Documentos legais"}
          </p>
          <nav className="mt-3 grid gap-2" aria-label={english ? "Legal documents" : "Documentos legais"}>
            {(Object.keys(routes) as LegalDocument[]).map((key) => (
              <Link
                aria-current={key === document ? "page" : undefined}
                className={`focus-ring rounded-md border px-4 py-3 text-sm font-bold transition ${
                  key === document
                    ? "border-ink bg-ink text-white"
                    : "border-steel bg-white text-ink hover:border-ink"
                }`}
                href={routes[key].href}
                key={key}
              >
                {routes[key].label}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 rounded-md border border-steel bg-white p-5 shadow-clean sm:p-8 lg:p-10">
          <section className="rounded-md border border-steel bg-smoke p-5 sm:p-6">
            <h2 className="font-display text-xl uppercase text-ink">
              {identityLabels.title}
            </h2>
            <dl className="mt-4 grid gap-3 text-sm text-graphite sm:grid-cols-[150px_1fr]">
              <dt className="font-bold">{identityLabels.brand}</dt>
              <dd>RumoAoPro</dd>
              {legalIdentity.name !== "RumoAoPro" ? (
                <>
                  <dt className="font-bold">{identityLabels.legalName}</dt>
                  <dd>{legalIdentity.name}</dd>
                </>
              ) : null}
              {legalIdentity.document ? (
                <>
                  <dt className="font-bold">{identityLabels.document}</dt>
                  <dd>{legalIdentity.document}</dd>
                </>
              ) : null}
              {legalIdentity.address ? (
                <>
                  <dt className="font-bold">{identityLabels.address}</dt>
                  <dd>{legalIdentity.address}</dd>
                </>
              ) : null}
              <dt className="font-bold">{identityLabels.email}</dt>
              <dd>
                <a className="underline decoration-steel underline-offset-4 hover:decoration-ink" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </dd>
              <dt className="font-bold">{identityLabels.whatsapp}</dt>
              <dd>
                <a className="underline decoration-steel underline-offset-4 hover:decoration-ink" href={`https://wa.me/${contact.whatsapp}`}>
                  +55 19 99281-1078
                </a>
              </dd>
            </dl>
          </section>

          <div className="mt-9 space-y-10">
            {content.sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl uppercase leading-tight text-ink sm:text-3xl">
                  {section.title}
                </h2>
                {section.paragraphs ? (
                  <div className="mt-4 space-y-4 text-base leading-7 text-graphite/80">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{formatLegalText(paragraph)}</p>
                    ))}
                  </div>
                ) : null}
                {section.items ? (
                  <ul className="mt-4 space-y-3 pl-5 text-base leading-7 text-graphite/80 marker:text-signal">
                    {section.items.map((item) => (
                      <li className="list-disc pl-1" key={item}>
                        {formatLegalText(item)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
