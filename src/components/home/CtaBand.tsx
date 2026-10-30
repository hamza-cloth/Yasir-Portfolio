import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

type CtaBandProps = {
  email: string;
  availability: string;
};

// The big blue contact card that closes the home and About pages.
export function CtaBand({ email, availability }: CtaBandProps) {
  return (
    <section aria-labelledby="cta-title" className="py-14 md:py-16">
      <Container>
        <Reveal>
          <div className="tilt-3d relative isolate overflow-hidden rounded-panel px-[clamp(24px,6vw,80px)] py-[clamp(40px,7vw,88px)] text-white shadow-[0_40px_80px_-40px_var(--fill-1)] [background:var(--feature-bg)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 [background-image:radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1.4px)] [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_70%)] bg-size-[22px_22px]"
            />
            <div
              aria-hidden="true"
              className="absolute -top-40 -right-32 -z-10 size-[30rem] rounded-full border-[40px] border-white/8"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-48 -left-24 -z-10 size-[26rem] rounded-full bg-white/8 blur-2xl"
            />

            <ul
              aria-hidden="true"
              className="absolute top-1/2 right-[6%] hidden -translate-y-1/2 flex-col gap-4 xl:flex"
            >
              <li className="float-card flex w-72 items-center gap-3 rounded-2xl bg-white p-4 text-[#0e1220] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.35)]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e7edff] text-[#1d3fbf]">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none">
                    <path
                      d="M4 6h16v12H4zM4 7l8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-bold">New message</span>
                  <span className="text-xs text-[#5d6475]">Hiring · Network support</span>
                </span>
              </li>
              <li
                className="float-card ml-12 flex w-72 items-center gap-3 rounded-2xl bg-white p-4 text-[#0e1220] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.35)]"
                style={{ animationDelay: "-3s" }}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#dff6ec] text-[#0e7a4a]">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-bold">Reply sent</span>
                  <span className="text-xs text-[#5d6475]">Within a day, IST</span>
                </span>
              </li>
            </ul>

            <div className="flex max-w-3xl flex-col items-start gap-6">
              <p className="label-mono inline-flex items-center gap-2 rounded-pill bg-white/15 px-3 py-1.5 text-white">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[#7dffb0]" />
                {availability}
              </p>
              <h2
                id="cta-title"
                className="text-[clamp(2.3rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.035em] text-white"
              >
                Need someone who can fix the network and ship the app?
              </h2>
              <p className="max-w-xl text-lg text-white/80">
                Tell me about the role or the problem. I reply within a day, India Standard Time.
              </p>

              <div className="mt-2 flex w-full max-w-xl flex-col gap-2 rounded-[22px] bg-white/12 p-2 backdrop-blur-sm sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="cta-email">
                  Email address
                </label>
                <input
                  id="cta-email"
                  readOnly
                  value={email}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-[0.95rem] text-white outline-none"
                />
                <CopyButton value={email} variant="white">
                  Copy
                </CopyButton>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <Button href="/contact" variant="white" size="lg">
                  Send a message
                  <Icon name="arrow-right" />
                </Button>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-h-12 items-center gap-2 font-semibold text-white/90 underline-offset-4 hover:underline"
                >
                  <Icon name="mail" size={17} />
                  Open in your mail app
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
