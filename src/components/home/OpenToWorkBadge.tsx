import { Icon } from "@/components/ui/Icon";
import { PlayWhenVisible } from "@/components/ui/PlayWhenVisible";

export function OpenToWorkBadge() {
  return (
    <PlayWhenVisible className="relative grid size-[clamp(120px,16vw,168px)] flex-none place-items-center">
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="badge-spin absolute inset-0 size-full"
      >
        <defs>
          <path id="badge-circle" d="M100 100 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0" />
        </defs>
        <text className="fill-fg font-mono text-[20px] tracking-[0.16em] uppercase">
          <textPath href="#badge-circle">Open to work · Open to work ·</textPath>
        </text>
      </svg>
      <span className="grid size-[44%] place-items-center rounded-full bg-amber text-amber-ink">
        <span className="sr-only">Open to work</span>
        <Icon name="arrow-up-right" className="size-1/2" />
      </span>
    </PlayWhenVisible>
  );
}
