import Link from "next/link";

import { LogoMark } from "@/components/brand/LogoMark";

type ErrorStateProps = {
  code: string;
  title: string;
  body: string;
  onRetry?: () => void;
};

// The friendly face of every error and not-found page. No stack traces, ever.
export function ErrorState({ code, title, body, onRetry }: ErrorStateProps) {
  return (
    <section
      aria-labelledby="error-title"
      className="shell flex min-h-[70svh] flex-col items-center justify-center gap-6 pt-[calc(var(--header-h)+24px)] pb-16 text-center"
    >
      <LogoMark className="h-14 text-fg" />
      <p className="font-display text-[clamp(5rem,16vw,9rem)] leading-none font-semibold tracking-[-0.04em] text-fg">
        {code}
      </p>
      <h1 id="error-title" className="max-w-2xl text-h2">
        {title}
      </h1>
      <p className="max-w-md text-lg text-muted">{body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="btn-accent inline-flex min-h-12 items-center rounded-(--r-button) px-6 font-semibold"
          >
            Try again
          </button>
        ) : null}
        <Link
          href="/"
          className={
            onRetry
              ? "inline-flex min-h-12 items-center rounded-(--r-button) border border-line-2 bg-surface-solid px-6 font-semibold text-fg transition-colors hover:border-c1"
              : "btn-accent inline-flex min-h-12 items-center rounded-(--r-button) px-6 font-semibold transition-transform hover:-translate-y-0.5"
          }
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
