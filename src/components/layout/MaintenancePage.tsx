import { LogoMark } from "@/components/brand/LogoMark";
import { Container } from "@/components/ui/Container";

// Shown in place of every public page while maintenance mode is on (admin → Appearance).
export function MaintenancePage({
  name,
  message,
  email,
}: {
  name: string;
  message: string;
  email: string;
}) {
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-bg py-16">
      <Container className="flex max-w-xl flex-col items-center gap-6 text-center">
        <LogoMark className="h-12 [--logo-y:var(--c1)]" />
        <p className="label-mono text-muted">{name}</p>
        <h1 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-[-0.04em]">
          Back in a few minutes
        </h1>
        <p className="text-lg text-muted">{message}</p>
        <a href={`mailto:${email}`} className="text-c1-text hover:underline">
          {email}
        </a>
      </Container>
    </main>
  );
}
