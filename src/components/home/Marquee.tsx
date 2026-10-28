import { PlayWhenVisible } from "@/components/ui/PlayWhenVisible";
import { cn } from "@/lib/cn";

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
    <ul className="flex flex-none items-center gap-10 pr-10">
      {WORDS.map((word, index) => (
        <li
          key={word}
          className={cn(
            "font-display text-[clamp(2rem,6vw,4.5rem)] leading-none whitespace-nowrap",
            index % 2 === 0 ? "text-fg" : "text-outline",
          )}
        >
          {word}
        </li>
      ))}
    </ul>
  );
}

// Decorative: every word here is also stated in readable content elsewhere on the page.
export function Marquee() {
  return (
    <PlayWhenVisible className="overflow-hidden border-y border-line py-8">
      <div aria-hidden="true" className="marquee-track flex w-max">
        <WordRun />
        <WordRun />
      </div>
    </PlayWhenVisible>
  );
}
