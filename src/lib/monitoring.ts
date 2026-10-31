// One place to report errors. Without a monitoring service configured it only logs, so nothing
// leaks to the visitor; set NEXT_PUBLIC_SENTRY_DSN and wire @sentry/nextjs here to forward them.
export function reportError(error: unknown, context: Record<string, string> = {}): void {
  if (process.env.NODE_ENV !== "production") return;
  const digest =
    typeof error === "object" && error && "digest" in error ? String(error.digest) : "";
  // eslint-disable-next-line no-console -- the fallback sink when no monitoring service is set
  console.error("[error]", { digest, ...context });
}
