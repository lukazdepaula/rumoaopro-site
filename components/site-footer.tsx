import Link from "next/link";
import { assets, contact } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
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
            Assessoria, programas e performance para atletas que querem treinar
            com intenção profissional.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-white/50">Contato</p>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <a className="block hover:text-white" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            <a
              className="block hover:text-white"
              href={`https://wa.me/${contact.whatsapp}`}
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-white/50">Navegação</p>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <Link className="block hover:text-white" href="/assessoria">
              Assessoria
            </Link>
            <Link className="block hover:text-white" href="/en/coaching">
              Coaching
            </Link>
            <Link className="block hover:text-white" href="/links">
              Links
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
