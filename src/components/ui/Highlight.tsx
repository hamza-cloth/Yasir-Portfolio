import type { ReactNode } from "react";

export function Highlight({ children }: { children: ReactNode }) {
  return <mark className="highlight">{children}</mark>;
}
