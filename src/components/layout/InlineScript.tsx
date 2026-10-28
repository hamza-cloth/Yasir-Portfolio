// Executes during HTML parsing on full page loads. On the client the type is swapped to
// text/plain so React never re-runs it or warns about rendering a <script>.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
