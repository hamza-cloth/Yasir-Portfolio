import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import type { Announcement } from "@/lib/site-config";

// One line above the nav, set in the admin (Appearance). Its 40px are added to --header-h
// while it is on the page, so every page's top spacing makes room for it.
export function AnnouncementBar({ announcement }: { announcement: Announcement }) {
  if (!announcement.enabled || !announcement.text) return null;
  const external = /^https?:/.test(announcement.href);
  const content = (
    <>
      <span className="truncate">{announcement.text}</span>
      {announcement.href ? <Icon name="arrow-right" size={14} className="flex-none" /> : null}
    </>
  );
  const className =
    "flex h-full items-center justify-center gap-2 px-4 text-sm font-medium text-on-fill";

  return (
    <div className="announce-bar h-10 [background:var(--feature-bg)]">
      {announcement.href ? (
        external ? (
          <a href={announcement.href} rel="noopener" className={`${className} hover:underline`}>
            {content}
          </a>
        ) : (
          <Link href={announcement.href} className={`${className} hover:underline`}>
            {content}
          </Link>
        )
      ) : (
        <p className={className}>{content}</p>
      )}
    </div>
  );
}
