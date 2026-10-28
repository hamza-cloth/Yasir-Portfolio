import { PlayWhenVisible } from "@/components/ui/PlayWhenVisible";

const WORDS = [
  "Technical Support",
  "Networking",
  "CCNA",
  "Subnetting",
  "VLANs",
  "OSPF",
  "Full-Stack",
  "Next.js",
  "PostgreSQL",
];

const TOOLS = [
  "Cisco IOS",
  "Packet Tracer",
  "TCP/IP",
  "DNS",
  "DHCP",
  "TypeScript",
  "React",
  "NestJS",
  "Tailwind",
  "Redis",
  "Docker",
  "Linux",
];

function WordRun() {
  return (
    <ul className="flex flex-none items-center">
      {WORDS.map((word) => (
        <li
          key={word}
          className="flex items-center gap-10 pr-10 font-display text-[clamp(1.35rem,2.6vw,2.1rem)] leading-none font-medium tracking-[-0.03em] whitespace-nowrap text-fg/80"
        >
          {word}
          <span className="text-serif-accent text-[1.1em] text-c1/70">✦</span>
        </li>
      ))}
    </ul>
  );
}

function ToolRun() {
  return (
    <ul className="flex flex-none items-center">
      {TOOLS.map((tool) => (
        <li
          key={tool}
          className="label-mono mr-3 rounded-pill border border-line px-4 py-2 whitespace-nowrap text-muted"
        >
          {tool}
        </li>
      ))}
    </ul>
  );
}

// Decorative: every word here is also stated in readable content elsewhere on the page.
export function Marquee() {
  return (
    <PlayWhenVisible className="marquee-pause relative flex flex-col gap-5 overflow-hidden border-y border-line bg-bg-2/60 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] py-7">
      <div aria-hidden="true" className="marquee-track flex w-max">
        <WordRun />
        <WordRun />
      </div>
      <div aria-hidden="true" className="marquee-track marquee-track--reverse flex w-max">
        <ToolRun />
        <ToolRun />
      </div>
    </PlayWhenVisible>
  );
}
