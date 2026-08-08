import Link from "next/link";
import { assets, contact } from "@/lib/content";
import { PrivacySettingsButton } from "@/components/privacy-consent";

export function SiteFooter({ locale = "pt" }: { locale?: "pt" | "en" }) {
  const isEnglish = locale === "en";

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img
              alt="RumoAoPro"
              className="h-10 w-10 object-contain"
              height={40}
              src={assets.logo}
              width={40}
            />
            <p className="font-display text-xl uppercase">RumoAoPro</p>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
            {isEnglish
              ? "Coaching, training programs and performance for footballers who want to train with professional intent."
              : "Assessoria, programas e performance para atletas que querem treinar com intenção profissional."}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-white/50">
            {isEnglish ? "Contact" : "Contato"}
          </p>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <a className="block hover:text-white" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            <a className="block hover:text-white" href={`https://wa.me/${contact.whatsapp}`}>
              WhatsApp
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-white/50">
            {isEnglish ? "Navigation" : "Navegação"}
          </p>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            {isEnglish ? (
              <>
                <Link className="block hover:text-white" href="/en/coaching">Coaching</Link>
                <Link className="block hover:text-white" href="/en/programs">Programs</Link>
                <Link className="block hover:text-white" href="/en/courses">Courses</Link>
                <Link className="block hover:text-white" href="/en/links">Links</Link>
              </>
            ) : (
              <>
                <Link className="block hover:text-white" href="/assessoria">Assessoria</Link>
                <Link className="block hover:text-white" href="/en/coaching">Coaching</Link>
                <Link className="block hover:text-white" href="/programas">Programas</Link>
                <Link className="block hover:text-white" href="/en/programs">Programs</Link>
                <Link className="block hover:text-white" href="/cursos">Cursos</Link>
                <Link className="block hover:text-white" href="/en/courses">Courses</Link>
                <Link className="block hover:text-white" href="/links">Links</Link>
                <Link className="block hover:text-white" href="/en/links">Links EN</Link>
              </>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-white/50">Legal</p>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            {isEnglish ? (
              <>
                <Link className="block hover:text-white" href="/en/terms">Terms of use</Link>
                <Link className="block hover:text-white" href="/en/privacy">Privacy</Link>
                <Link className="block hover:text-white" href="/en/refunds">Refunds</Link>
                <PrivacySettingsButton locale="en" />
              </>
            ) : (
              <>
                <Link className="block hover:text-white" href="/termos">Termos de uso</Link>
                <Link className="block hover:text-white" href="/privacidade">Privacidade</Link>
                <Link className="block hover:text-white" href="/reembolsos">Reembolsos</Link>
                <Link className="block hover:text-white" href="/en/terms">Terms of use</Link>
                <Link className="block hover:text-white" href="/en/privacy">Privacy</Link>
                <Link className="block hover:text-white" href="/en/refunds">Refunds</Link>
                <PrivacySettingsButton locale="pt" />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50 sm:px-6">
        © {new Date().getFullYear()} RumoAoPro. {isEnglish ? "All rights reserved." : "Todos os direitos reservados."}
      </div>
    </footer>
  );
}
