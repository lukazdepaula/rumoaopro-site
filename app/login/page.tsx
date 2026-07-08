import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { nav } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login - RumoAoPro",
  description: "Acesse os programas comprados na RumoAoPro."
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/my-programs" ctaLabel="Minha conta" />
      <section className="py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-signal">Conta</p>
            <h1 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              Acesse seus programas
            </h1>
            <p className="mt-4 text-sm leading-6 text-graphite/72">
              Use o mesmo e-mail da compra para receber um link temporário de
              acesso. Não precisa criar senha.
            </p>
            <LoginForm />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
