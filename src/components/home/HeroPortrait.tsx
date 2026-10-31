import Image from "next/image";

import { LazyGlobe } from "@/components/canvas/LazyGlobe";
import type { ProfilePhoto } from "@/lib/profile-photo";

export type PortraitBadge = { title: string; detail: string };

type HeroPortraitProps = {
  photo: ProfilePhoto | null;
  name: string;
  location: string;
  openToWork: boolean;
  badges: PortraitBadge[];
  // Opacity of the globe from 0 to 1 (admin → Appearance); null hides it.
  globeOpacity: number | null;
};

// The hero's right column: the photo in a tall card with a turning accent edge, a caption bar,
// floating badges, a dashed orbit and the dot globe behind. The badges and caption repeat facts
// shown elsewhere on the page, so they are hidden from screen readers.
export function HeroPortrait({
  photo,
  name,
  location,
  openToWork,
  badges,
  globeOpacity,
}: HeroPortraitProps) {
  return (
    <div className="portrait relative mx-auto w-[clamp(250px,72vw,330px)] laptop:w-[clamp(320px,30vw,420px)]">
      <div aria-hidden="true" className="portrait-glow" />
      {globeOpacity !== null ? (
        <div aria-hidden="true" className="portrait-globe" style={{ opacity: globeOpacity }}>
          <LazyGlobe />
        </div>
      ) : null}
      <div aria-hidden="true" className="portrait-orbit" />
      <div aria-hidden="true" className="portrait-orbit portrait-orbit--inner" />

      <div className="portrait-frame">
        <div className="portrait-photo">
          {photo ? (
            <Image
              src={photo.src}
              alt={name}
              width={880}
              height={1100}
              sizes="(min-width: 1024px) 420px, 330px"
              preload
              fetchPriority="high"
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              className="size-full object-cover object-[center_22%]"
            />
          ) : (
            <span
              role="img"
              aria-label={name}
              className="grid size-full place-items-center bg-surface-2 font-display text-[clamp(4rem,10vw,7.5rem)] font-semibold text-c1-text"
            >
              YA
            </span>
          )}
          <div aria-hidden="true" className="portrait-shade" />
        </div>
        <div aria-hidden="true" className="portrait-caption">
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-display text-[0.95rem] font-semibold text-white">
              {name}
            </span>
            <span className="truncate text-xs text-white/70">{location}</span>
          </span>
          {openToWork ? (
            <span className="portrait-live">
              <span className="status-dot" />
              <span className="max-sm:hidden">Open to work</span>
            </span>
          ) : null}
        </div>
      </div>

      <ul aria-hidden="true">
        {badges.slice(0, 3).map((badge, index) => (
          <li key={badge.title} className="portrait-badge" data-slot={index}>
            <span className="portrait-badge-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d={BADGE_PATHS[index % BADGE_PATHS.length]}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="font-mono text-[0.8rem] font-medium text-fg">{badge.title}</span>
              <span className="font-mono text-[0.7rem] text-muted">{badge.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Shield (training), rocket (products), headset (support).
const BADGE_PATHS = [
  "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6zM9 12l2 2 4-4",
  "M5 15c-1 1-1.5 3.5-1.5 5.5 2 0 4.5-.5 5.5-1.5M9 15l-3-3c1-3 3.5-6.5 9-8 0 0 1 5.5-5 11zM14.5 9.5h.01",
  "M4 13v-1a8 8 0 0 1 16 0v1M4 13h2.5v5H5a1 1 0 0 1-1-1zM20 13h-2.5v5H19a1 1 0 0 0 1-1z",
];
