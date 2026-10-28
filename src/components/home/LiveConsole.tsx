"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import { TerminalShell } from "@/components/terminal/TerminalShell";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useTerminalSession } from "@/hooks/useTerminalSession";
import { DEMO_COMMANDS } from "@/lib/terminal/transcript";
import type { TerminalContext, TerminalLine } from "@/lib/terminal/types";

const START_MS = 300;
const TYPE_MS = 45;
const AFTER_COMMAND_MS = 900;
const HANDOVER: TerminalLine = { kind: "accent", text: "Your turn. Type help and press Enter." };

type LiveConsoleProps = {
  context: TerminalContext;
  // The full demo, rendered on the server so the console reads fine without JavaScript.
  transcript: TerminalLine[];
};

export function LiveConsole({ context, transcript }: LiveConsoleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const stoppedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const session = useTerminalSession(context, { initialLines: [...transcript, HANDOVER] });
  const inView = useInView(ref, { once: true, rootMargin: "-20% 0px" });
  const reducedMotion = useReducedMotion();

  function stopDemo() {
    stoppedRef.current = true;
    setPlaying(false);
    session.reset([...transcript, HANDOVER]);
  }

  const handOver = useEffectEvent(stopDemo);
  const typeInto = useEffectEvent((text: string) => session.setInput(text));
  const run = useEffectEvent((command: string) => session.submit(command));
  const clear = useEffectEvent(() => session.reset());

  useEffect(() => {
    if (!inView || reducedMotion || startedRef.current || stoppedRef.current) return;
    startedRef.current = true;
    let commandIndex = 0;
    let charIndex = 0;

    function step() {
      if (stoppedRef.current) return;
      const command = DEMO_COMMANDS[commandIndex];
      if (command === undefined) {
        handOver();
        return;
      }
      if (charIndex < command.length) {
        charIndex += 1;
        typeInto(command.slice(0, charIndex));
        timer = window.setTimeout(step, TYPE_MS);
        return;
      }
      run(command);
      commandIndex += 1;
      charIndex = 0;
      timer = window.setTimeout(step, AFTER_COMMAND_MS);
    }

    let timer = window.setTimeout(() => {
      clear();
      setPlaying(true);
      step();
    }, START_MS);
    return () => {
      window.clearTimeout(timer);
      startedRef.current = false;
    };
  }, [inView, reducedMotion]);

  // Focusing the console mid-demo stops the demo and hands over straight away.
  function takeOver() {
    if (playing) stopDemo();
  }

  return (
    <div ref={ref} className="min-w-0">
      <TerminalShell
        session={session}
        title="yasir@r1 · live console"
        announce={!playing}
        onInputFocus={takeOver}
      />
    </div>
  );
}
