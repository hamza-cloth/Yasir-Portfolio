import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

type NowListProps = {
  items: string[];
  updatedAt: Date | null;
};

export function NowList({ items, updatedAt }: NowListProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="now-title" className="py-20">
      <Container className="grid gap-10 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-4">
          <SectionHead eyebrow="Now" titleId="now-title" title="What I’m on right now" />
          {updatedAt ? (
            <p className="label-mono text-muted">
              Updated{" "}
              <time dateTime={updatedAt.toISOString()}>{dateFormatter.format(updatedAt)}</time>
            </p>
          ) : null}
        </div>
        <ul className="flex flex-col border-t border-line">
          {items.map((item) => (
            <li key={item} className="flex items-baseline gap-4 border-b border-line py-5 text-lg">
              <span aria-hidden="true" className="size-2 flex-none translate-y-[-0.1em] bg-amber" />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
