import { ProgramGoalFinder } from "@/components/program-goal-finder";

type HomeProgramCollectionsProps = {
  locale: "pt" | "en";
};

export function HomeProgramCollections({
  locale
}: HomeProgramCollectionsProps) {
  return (
    <section className="border-b border-ink/10 bg-smoke py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProgramGoalFinder locale={locale} />
      </div>
    </section>
  );
}
