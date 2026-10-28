import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import type { TerminalContext, TerminalLine } from "@/lib/terminal/types";

import { LiveConsole } from "./LiveConsole";

type ConsoleSectionProps = {
  context: TerminalContext;
  transcript: TerminalLine[];
};

export function ConsoleSection({ context, transcript }: ConsoleSectionProps) {
  return (
    <section id="console" aria-labelledby="console-title" className="py-24">
      <Container className="grid gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center">
        <div className="flex flex-col gap-6">
          <SectionHead
            eyebrow="Live console"
            titleId="console-title"
            title="Ask the router"
            lead="A real shell running in your browser. It plays a short demo, then it is yours: try help, skills, traceroute 8.8.8.8 or theme terminal."
          />
          <p className="label-mono text-muted">
            Router output is simulated. No packets leave the page.
          </p>
        </div>
        <LiveConsole context={context} transcript={transcript} />
      </Container>
    </section>
  );
}
