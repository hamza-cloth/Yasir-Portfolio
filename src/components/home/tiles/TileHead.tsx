import type { ReactNode } from "react";

type TileHeadProps = {
  eyebrow: string;
  title?: ReactNode;
};

export function TileHead({ eyebrow, title }: TileHeadProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="label-mono flex items-center gap-2.5 text-faint">
        <span aria-hidden="true" className="signal-dot" />
        {eyebrow}
      </p>
      {title ? (
        <h3 className="text-[clamp(1.35rem,2.1vw,1.75rem)] leading-[1.1] tracking-[-0.035em]">
          {title}
        </h3>
      ) : null}
    </div>
  );
}
