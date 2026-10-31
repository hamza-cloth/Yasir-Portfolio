import { ErrorState } from "@/components/page/ErrorState";

export const metadata = { title: "Page not found" };

// For URLs outside every route group; (site)/not-found.tsx covers pages inside the site.
export default function RootNotFound() {
  return (
    <main>
      <ErrorState
        code="404"
        title="That page is not on this network."
        body="The link may be old or mistyped. Every page is one hop from home."
      />
    </main>
  );
}
