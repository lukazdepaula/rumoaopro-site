import { CreditCard, QrCode, Zap } from "lucide-react";

type ProgramPurchaseSummaryProps = {
  locale: "pt" | "en";
};

const copy = {
  pt: {
    primaryPrice: "R$ 199",
    primaryLabel: "no Brasil",
    secondaryPrice: "US$ 38,95 no exterior",
    paymentItems: [
      {
        icon: CreditCard,
        text: "Cartão em até 12x"
      },
      {
        icon: QrCode,
        text: "Pix pelo Mercado Pago"
      },
      {
        icon: Zap,
        text: "Acesso após confirmação"
      }
    ]
  },
  en: {
    primaryPrice: "$38.95",
    primaryLabel: "international",
    secondaryPrice: "R$199 in Brazil",
    paymentItems: [
      {
        icon: CreditCard,
        text: "International cards via Stripe"
      },
      {
        icon: QrCode,
        text: "Card or Pix in Brazil"
      },
      {
        icon: Zap,
        text: "Access after confirmation"
      }
    ]
  }
} as const;

export function ProgramPurchaseSummary({
  locale
}: ProgramPurchaseSummaryProps) {
  const content = copy[locale];

  return (
    <div className="mt-4 max-w-2xl border-y border-white/15 py-3 sm:mt-6 sm:py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-3xl uppercase text-white sm:text-4xl">
          {content.primaryPrice}
        </p>
        <p className="text-sm font-bold uppercase text-white/58">
          {content.primaryLabel}
        </p>
        <span aria-hidden="true" className="hidden text-white/24 sm:inline">
          |
        </span>
        <p className="text-sm font-semibold text-white/72">
          {content.secondaryPrice}
        </p>
      </div>

      <div className="mt-3 grid gap-1 sm:mt-4 sm:grid-cols-3 sm:gap-2">
        {content.paymentItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className="flex min-h-8 items-center gap-2 text-xs font-semibold leading-5 text-white/72 last:pr-14 sm:min-h-10 sm:last:pr-0"
              key={item.text}
            >
              <Icon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-gold"
              />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
