import { cn } from "@/lib/cn";

const PRODUCT_TONES = ["bg-c1/25", "bg-amber/25", "bg-ok/20", "bg-line-2"];

export function PhoneStorefront() {
  return (
    <div className="mx-auto flex aspect-[9/17] h-full max-h-full flex-col overflow-hidden rounded-[22px] border-4 border-line-2 bg-surface-solid terminal:rounded-none">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="font-display text-[0.8rem] leading-none text-fg">Hamza Cloth</span>
        <span className="size-3 rounded-full border border-line-2" />
      </div>
      <span className="mx-3 mb-2 h-5 rounded-pill bg-surface-2" />
      <div className="grid flex-1 grid-cols-2 gap-1.5 px-3">
        {PRODUCT_TONES.map((tone) => (
          <div key={tone} className="flex min-h-0 flex-col gap-1">
            <span className={cn("flex-1 rounded-chip", tone)} />
            <span className="h-1 w-3/4 rounded-full bg-line-2" />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2 border-t border-line px-3 py-2">
        {["Home", "Shop", "Bag", "Me"].map((item, index) => (
          <span
            key={item}
            className={cn("mx-auto size-2 rounded-full", index === 0 ? "bg-c1" : "bg-line-2")}
          />
        ))}
      </div>
    </div>
  );
}
