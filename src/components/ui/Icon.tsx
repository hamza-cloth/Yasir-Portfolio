import type { SVGProps } from "react";

const PATHS = {
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  "arrow-up": "M12 19V5M6 11l6-6 6 6",
  "arrow-up-right": "M7 17 17 7M9 7h8v8",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  close: "M6 6l12 12M18 6 6 18",
} as const;

export type IconName = keyof typeof PATHS;

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  size?: number;
};

// Decorative by default: give the parent control an accessible name instead.
export function Icon({ name, size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
