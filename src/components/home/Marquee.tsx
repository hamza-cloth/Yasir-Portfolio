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

function WordRun() {
  return (
    <ul className="flex flex-none items-center">
      {WORDS.map((word) => (
        <li
          key={word}
          className="flex items-center gap-10 pr-10 font-display text-[clamp(1.25rem,2.4vw,1.9rem)] leading-none font-medium tracking-[-0.03em] whitespace-nowrap text-muted"
        >
          {word}
          <span className="text-serif-accent text-[1.2em] text-c1/70">✦</span>
        </li>
      ))}
    </ul>
  );
}

// Decorative: every word here is also stated in readable content elsewhere on the page.
export function Marquee() {
  return (
    <PlayWhenVisible className="relative overflow-hidden border-y border-line bg-bg-2/60 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] py-7">
      <div aria-hidden="true" className="marquee-track flex w-max">
        <WordRun />
        <WordRun />
      </div>
    </PlayWhenVisible>
  );
}
