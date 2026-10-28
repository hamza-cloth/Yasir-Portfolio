import { ErrorState } from "@/components/page/ErrorState";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="That page is not on this network."
      body="The link may be old or mistyped. Every page is one hop from home."
    />
  );
}
