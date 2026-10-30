import { LazyGlobe } from "@/components/canvas/LazyGlobe";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";

type StatusCard = {
  title: string;
  detail: string;
  tone: "ok" | "blue" | "mint" | "peach";
  position: string;
  icon: "pulse" | "link" | "check" | "rocket";
};

const CARDS: StatusCard[] = [
  {
    title: "ping hire.yasir",
    detail: "0% packet loss",
    tone: "ok",
    position: "top-[6%] -left-[4%]",
    icon: "pulse",
  },
  {
    title: "OSPF neighbour",
    detail: "State: FULL",
    tone: "blue",
    position: "top-[16%] -right-[6%]",
    icon: "link",
  },
  {
    title: "Ticket resolved",
    detail: "DNS fixed",
    tone: "mint",
    position: "bottom-[18%] -left-[8%]",
    icon: "check",
  },
  {
    title: "Deploy succeeded",
    detail: "3 products in build",
    tone: "peach",
    position: "bottom-[4%] right-[2%]",
    icon: "rocket",
  },
];

const TONES: Record<StatusCard["tone"], string> = {
  ok: "bg-tint-mint text-tint-mint-ink",
  blue: "bg-tint-blue text-tint-blue-ink",
  mint: "bg-tint-mint text-tint-mint-ink",
  peach: "bg-tint-peach text-tint-peach-ink",
};

const ICONS: Record<StatusCard["icon"], string> = {
  pulse: "M3 12h4l2-5 4 10 2-5h6",
  link: "M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1",
  check: "M5 12.5l4.5 4.5L19 7.5",
  rocket: "M5 19l3-1 8-8a3 3 0 0 0-4-4l-8 8-1 3zM14 6l4 4",
};

// The hero visual: the dot globe on a soft sphere, orbit rings and four floating status cards.
// Purely illustrative; every fact on the cards is stated in readable content elsewhere.
export function HeroGlobe({ className }: { className?: string }) {
  return (
    <div className={cn("tilt-3d relative mx-auto aspect-square w-full", className)}>
      <div aria-hidden="true" className="globe-sphere absolute inset-[10%] rounded-full" />
      <div aria-hidden="true" className="orbit absolute inset-[3%] rounded-full" />
      <div aria-hidden="true" className="orbit-tilt absolute -inset-[4%]">
        <div className="orbit orbit--slow size-full rounded-full" />
      </div>
      <LazyGlobe />

      <ul aria-hidden="true">
        {CARDS.map((card, index) => (
          <li
            key={card.title}
            className={cn("absolute z-10 max-sm:scale-90", card.position)}
            style={cssVars({ "--float-delay": `${index * -1.6}s`, "--i": 4 + index })}
          >
            <div className="intro">
              <div className="float-card flex items-center gap-3 rounded-2xl border border-line bg-surface-solid/95 py-2.5 pr-4 pl-2.5 shadow-(--shadow-lift) backdrop-blur-md">
                <span className={cn("grid size-9 place-items-center rounded-xl", TONES[card.tone])}>
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none">
                    <path
                      d={ICONS[card.icon]}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-mono text-xs font-medium text-fg">{card.title}</span>
                  <span className="text-xs text-muted">{card.detail}</span>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
