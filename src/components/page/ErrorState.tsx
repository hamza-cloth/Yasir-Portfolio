import Link from "next/link";

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
      <p className="label-mono rounded-pill border border-line bg-surface-solid px-3 py-1.5 text-muted">
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
            className="inline-flex min-h-12 items-center rounded-pill bg-c1 px-6 font-semibold text-c1-ink"
          >
            Try again
          </button>
        ) : null}
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-pill border border-line-2 bg-surface-solid px-6 font-semibold text-fg"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
