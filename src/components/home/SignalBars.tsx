import { cssVars } from "@/lib/css-vars";

const BARS = ["h-1.5", "h-2.5", "h-3.5", "h-[18px]"];

export function SignalBars() {
  return (
    <span aria-hidden="true" className="flex h-[18px] items-end gap-[3px]">
      {BARS.map((height, index) => (
        <span key={height} className={`signal-bar ${height}`} style={cssVars({ "--bar": index })} />
      ))}
    </span>
  );
}
