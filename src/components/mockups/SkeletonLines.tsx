import { cn } from "@/lib/cn";

const WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-2/3", "w-1/2"];

export function SkeletonLines({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={cn("h-1.5 rounded-full bg-line-2", WIDTHS[index % WIDTHS.length])}
        />
      ))}
    </div>
  );
}
