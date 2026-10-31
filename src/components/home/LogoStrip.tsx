import { Container } from "@/components/ui/Container";

// Where Yasir trained, studied and worked, as plain-text wordmarks (no third-party logos).
const NAMES = [
  { name: "Cisco CCNA", note: "Training" },
  { name: "DUCAT", note: "Training" },
  { name: "Cyfuture India", note: "Support" },
  { name: "Earthix Software Solutions", note: "Support" },
  { name: "MUIT Noida", note: "BCA" },
];

// The everyday stack, from the services and the skills on the site.
const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "NestJS",
  "Node.js",
  "PostgreSQL",
  "Tailwind CSS",
  "Cisco IOS",
  "OSPF",
  "VLANs & 802.1Q",
  "ACLs",
  "NAT/PAT",
  "Subnetting / VLSM",
  "DNS",
  "DHCP",
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

function StackList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : "Everyday stack"}
      className="flex flex-none items-center gap-3 pr-3"
    >
      {STACK.map((item) => (
        <li key={item} className="stack-chip">
          <span aria-hidden="true" className="stack-chip-dot" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// Two slow marquees, the stack running the other way; with reduced motion they stop and the
// copies are hidden from view.
export function LogoStrip() {
  return (
    <section aria-labelledby="logos-title" className="py-10">
      <Container className="flex flex-col items-center gap-6">
        <h2 id="logos-title" className="label-mono text-faint">
          Trained, studied and worked with
        </h2>
        <div className="marquee w-full overflow-hidden">
          <div className="marquee-track flex w-max">
            <NameList />
            <NameList hidden />
          </div>
        </div>
        <div className="marquee w-full overflow-hidden">
          <div className="marquee-track marquee-track--reverse flex w-max">
            <StackList />
            <StackList hidden />
          </div>
        </div>
      </Container>
    </section>
  );
}
