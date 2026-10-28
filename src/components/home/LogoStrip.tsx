import { Container } from "@/components/ui/Container";

// Where Yasir trained, studied and worked, as plain-text wordmarks (no third-party logos).
const NAMES = [
  { name: "Cisco CCNA", note: "Training" },
  { name: "DUCAT", note: "Training" },
  { name: "Cyfuture India", note: "Support" },
  { name: "Earthix Software Solutions", note: "Support" },
  { name: "MUIT Noida", note: "BCA" },
];

export function LogoStrip() {
  return (
    <section aria-labelledby="logos-title" className="py-10">
      <Container className="flex flex-col items-center gap-6">
        <h2 id="logos-title" className="label-mono text-faint">
          Trained, studied and worked with
        </h2>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-14">
          {NAMES.map((item) => (
            <li key={item.name} className="group flex flex-col items-center gap-0.5">
              <span className="text-[clamp(1.05rem,1.6vw,1.35rem)] font-extrabold tracking-[-0.03em] text-fg/40 transition-colors duration-300 group-hover:text-fg">
                {item.name}
              </span>
              <span className="label-mono text-xs text-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.note}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
