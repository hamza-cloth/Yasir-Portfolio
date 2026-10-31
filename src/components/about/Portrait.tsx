"use client";

import { useState } from "react";
import Image from "next/image";

import { AVATAR_ALT } from "@/components/ui/Avatar";
import type { ProfilePhoto } from "@/lib/profile-photo";

type PortraitProps = {
  name: string;
  photo: ProfilePhoto | null;
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// The About page photo; the same 4:5 frame holds a monogram when there is no photo or it fails.
export function Portrait({ name, photo }: PortraitProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="tilt-3d relative aspect-[4/5] w-full overflow-hidden rounded-panel border border-line bg-surface-solid shadow-(--shadow-soft)">
      {photo && !failed ? (
        <Image
          src={photo.src}
          alt={AVATAR_ALT}
          fill
          sizes="(min-width: 960px) 420px, 100vw"
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={AVATAR_ALT}
          className="absolute inset-0 grid place-items-center bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:40px_40px]"
        >
          <span
            aria-hidden="true"
            className="text-gradient font-display text-[clamp(5rem,18vw,10rem)] leading-none"
          >
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
