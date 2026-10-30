import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

// A bento tile. Its cursor glow (--spot-x / --spot-y) and 3D lean are set by SpotlightController.
export function Tile({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "spotlight tilt-3d surface @container relative isolate min-w-0 overflow-hidden rounded-tile border border-line p-6 transition-colors duration-500 hover:border-line-2 md:p-7",
        className,
      )}
      {...props}
    />
  );
}
