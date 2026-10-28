import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("shell", className)} {...props} />;
}
