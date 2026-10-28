"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { nextTypewriterState, TYPEWRITER_DELAYS, type TypewriterState } from "@/lib/typewriter";

type RoleTyperProps = {
  roles: readonly string[];
  className?: string;
};

export function RoleTyper({ roles, className }: RoleTyperProps) {
  const first = roles[0] ?? "";
  const [state, setState] = useState<TypewriterState>({
    index: 0,
    length: first.length,
    phase: "holding",
  });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || roles.length < 2) return;
    let current: TypewriterState = { index: 0, length: first.length, phase: "holding" };
    let timer = window.setTimeout(function step() {
      const next = nextTypewriterState(current, roles);
      current = next.state;
      setState(next.state);
      timer = window.setTimeout(step, next.delay);
    }, TYPEWRITER_DELAYS.hold);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, roles, first]);

  const visible = reducedMotion ? first : (roles[state.index] ?? "").slice(0, state.length);

  return (
    <p
      className={cn(
        "label-mono flex min-h-[1.4em] items-center gap-3 text-c1-text before:h-px before:w-8 before:bg-c1/60 before:content-['']",
        className,
      )}
    >
      <span className="sr-only">{first}</span>
      <span aria-hidden="true">
        {visible}
        <span className="caret" />
      </span>
    </p>
  );
}
