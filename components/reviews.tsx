import { Star } from "lucide-react";
import {
  reviewGroups,
  type PublicReview,
  type ReviewGroupKey,
  type ReviewLocale
} from "@/lib/reviews";

type ReviewTone = "light" | "dark";

type ReviewBadgeProps = {
  className?: string;
  groupKey: ReviewGroupKey;
  locale: ReviewLocale;
  tone?: ReviewTone;
};

type ReviewsSectionProps = {
  eyebrow?: string;
  groupKey: ReviewGroupKey;
  limit?: number;
  locale: ReviewLocale;
  title?: string;
  tone?: ReviewTone;
};

const copy = {
  pt: {
    reviews: "avaliações",
    verified: "Compra verificada",
    defaultEyebrow: "Avaliações",
    defaultTitle: "O que atletas falaram depois de comprar"
  },
  en: {
    reviews: "reviews",
    verified: "Verified purchase",
    defaultEyebrow: "Reviews",
    defaultTitle: "What players said after buying"
  }
};

function Stars({ tone = "light" }: { tone?: ReviewTone }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex gap-0.5 ${
        tone === "dark" ? "text-gold" : "text-signal"
      }`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star className="h-4 w-4 fill-current" key={index} />
      ))}
    </span>
  );
}

function reviewText(review: PublicReview, locale: ReviewLocale) {
  return review.quote[locale] || review.quote.pt;
}

export function ReviewBadge({
  className = "",
  groupKey,
  locale,
  tone = "light"
}: ReviewBadgeProps) {
  const group = reviewGroups[groupKey];
  const textTone =
    tone === "dark" ? "text-white/78" : "text-graphite/72";

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-md ${
        tone === "dark"
          ? "border border-white/12 bg-black/30"
          : "border border-ink/10 bg-white"
      } px-3 py-2 shadow-sm ${className}`}
    >
      <Stars tone={tone} />
      <span className={`text-xs font-bold uppercase ${textTone}`}>
        {group.average.toFixed(1)} / 5 · {group.count} {copy[locale].reviews}
      </span>
    </div>
  );
}

export function ReviewsSection({
  eyebrow,
  groupKey,
  limit = 3,
  locale,
  title,
  tone = "light"
}: ReviewsSectionProps) {
  const group = reviewGroups[groupKey];
  const visibleReviews = group.reviews.slice(0, limit);
  const isDark = tone === "dark";

  return (
    <section className={`${isDark ? "bg-ink text-white" : "bg-white"} py-16`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p
              className={`text-sm font-bold uppercase ${
                isDark ? "text-gold" : "text-signal"
              }`}
            >
              {eyebrow || copy[locale].defaultEyebrow}
            </p>
            <h2
              className={`mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl ${
                isDark ? "text-white" : "text-ink"
              }`}
            >
              {title || copy[locale].defaultTitle}
            </h2>
            <p
              className={`mt-4 max-w-2xl text-sm leading-6 ${
                isDark ? "text-white/58" : "text-graphite/65"
              }`}
            >
              {group.sourceNote[locale]}
            </p>
          </div>
          <ReviewBadge groupKey={groupKey} locale={locale} tone={tone} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {visibleReviews.map((review) => (
            <article
              className={`rounded-lg p-5 shadow-sm ${
                isDark
                  ? "border border-white/10 bg-white/[0.06]"
                  : "border border-ink/10 bg-smoke"
              }`}
              key={`${review.date}-${review.name}`}
            >
              <Stars tone={tone} />
              <blockquote
                className={`mt-4 text-sm font-semibold leading-7 ${
                  isDark ? "text-white/76" : "text-graphite/78"
                }`}
              >
                “{reviewText(review, locale)}”
              </blockquote>
              <div className="mt-5 border-t border-current/10 pt-4">
                <p
                  className={`text-sm font-bold ${
                    isDark ? "text-white" : "text-ink"
                  }`}
                >
                  {review.name}
                </p>
                {review.verified ? (
                  <p
                    className={`mt-1 text-xs font-bold uppercase ${
                      isDark ? "text-gold" : "text-signal"
                    }`}
                  >
                    {copy[locale].verified}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
