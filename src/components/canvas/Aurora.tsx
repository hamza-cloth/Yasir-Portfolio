import { cn } from "@/lib/cn";

export function Aurora({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("aurora", className)} />;
}
