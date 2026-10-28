"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/page/ErrorState";
import { reportError } from "@/lib/monitoring";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => reportError(error, { boundary: "admin" }), [error]);

  return (
    <ErrorState
      code="Admin error"
      title="That action did not go through."
      body="Nothing was half-saved. Try again; if it keeps failing, check the database connection."
      onRetry={retry}
    />
  );
}
