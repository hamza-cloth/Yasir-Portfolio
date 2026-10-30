import { Container } from "@/components/ui/Container";

// Where Yasir trained, studied and worked, as plain-text wordmarks (no third-party logos).
const NAMES = [
  { name: "Cisco CCNA", note: "Training" },
  { name: "DUCAT", note: "Training" },
  { name: "Cyfuture India", note: "Support" },
  { name: "Earthix Software Solutions", note: "Support" },
  { name: "MUIT Noida", note: "BCA" },
];

function NameList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex flex-none items-center">
      {NAMES.map((item) => (
        <li key={item.name} className="flex items-center gap-3 px-7 md:px-10">
          <span className="text-[clamp(1.05rem,1.6vw,1.35rem)] font-extrabold tracking-[-0.03em] whitespace-nowrap text-fg/55">
            {item.name}
          </span>
          <span className="label-mono rounded-pill border border-line px-2 py-0.5 text-faint">
            {item.note}
          </span>
        </li>
      ))}
    </ul>
  );
}

// A slow marquee; with reduced motion it stops and the copy is hidden from view.
export function LogoStrip() {
  return (
    <section aria-labelledby="logos-title" className="py-8">
      <Container className="flex flex-col items-center gap-5">
        <h2 id="logos-title" className="label-mono text-faint">
          Trained, studied and worked with
        </h2>
        <div className="marquee w-full overflow-hidden">
          <div className="marquee-track flex w-max">
            <NameList />
            <NameList hidden />
          </div>
        </div>
      </Container>
    </section>
  );
}
