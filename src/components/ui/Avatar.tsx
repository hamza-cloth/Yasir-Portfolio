"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/cn";

export const AVATAR_ALT = "Yasir Abdullah, Software & Network Engineer";

type AvatarProps = {
  photo: { src: string; blurDataURL: string } | null;
  size: number;
  sizes?: string;
  preload?: boolean;
  // A ring in the look's accent colour and a green "open to work" dot.
  ring?: boolean;
  online?: boolean;
  className?: string;
};

// The profile photo, or a same-size "YA" avatar when there is no photo or it fails to load.
export function Avatar({
  photo,
  size,
  sizes,
  preload = false,
  ring = false,
  online = false,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = photo && !failed;

  return (
    <span
      className={cn("relative inline-block flex-none", className)}
      style={{ width: size, height: size }}
    >
      <span
        className={cn(
          "block size-full overflow-hidden rounded-full bg-c1-soft",
          ring && "ring-4 ring-c1/25 ring-offset-2 ring-offset-bg",
        )}
      >
        {showPhoto ? (
          <Image
            src={photo.src}
            alt={AVATAR_ALT}
            width={size}
            height={size}
            sizes={sizes ?? `${size}px`}
            preload={preload}
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            onError={() => setFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <span
            role="img"
            aria-label={AVATAR_ALT}
            className="grid size-full place-items-center font-display text-c1-text"
            style={{ fontSize: size * 0.36 }}
          >
            YA
          </span>
        )}
      </span>
      {online ? (
        <span
          aria-hidden="true"
          className="absolute right-[6%] bottom-[6%] block size-[22%] max-h-5 max-w-5 rounded-full border-[3px] border-bg bg-ok"
        />
      ) : null}
    </span>
  );
}
