"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/page/ErrorState";
import { reportError } from "@/lib/monitoring";

// Catches a failure in any public page; the header and footer stay up around it.
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => reportError(error, { boundary: "site" }), [error]);

  return (
    <ErrorState
      code="Something broke"
      title="This page hit a snag."
      body="It is on my side, not yours. Try again, or head back home."
      onRetry={retry}
    />
  );
}
