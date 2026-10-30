import Image from "next/image";

import { LazyGlobe } from "@/components/canvas/LazyGlobe";
import type { ProfilePhoto } from "@/lib/profile-photo";

export type PortraitBadge = { title: string; detail: string };

type HeroPortraitProps = {
  photo: ProfilePhoto | null;
  name: string;
  badges: PortraitBadge[];
};

// The hero's right column: the profile photo in a gold ring, a thin outer ring with a slowly
// turning gold arc, a soft glow, and the dot globe turning behind it all. The badges repeat
// facts shown elsewhere on the page, so they are hidden from screen readers.
export function HeroPortrait({ photo, name, badges }: HeroPortraitProps) {
  return (
    <div className="portrait relative mx-auto aspect-square w-[clamp(260px,32vw,440px)]">
      <div aria-hidden="true" className="portrait-glow" />
      <div aria-hidden="true" className="portrait-globe">
        <LazyGlobe />
      </div>
      <div aria-hidden="true" className="portrait-ring" />
      <div aria-hidden="true" className="portrait-arc" />

      <div className="portrait-photo">
        {photo ? (
          <Image
            src={photo.src}
            alt={name}
            width={880}
            height={880}
            sizes="(min-width: 1024px) 440px, (min-width: 720px) 360px, 260px"
            preload
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            className="size-full object-cover object-[center_20%]"
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
      </div>

      <ul aria-hidden="true">
        {badges.slice(0, 2).map((badge, index) => (
          <li key={badge.title} className="portrait-badge" data-slot={index}>
            <span className="font-mono text-[0.8rem] font-medium text-fg">{badge.title}</span>
            <span className="font-mono text-[0.7rem] text-muted">{badge.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
