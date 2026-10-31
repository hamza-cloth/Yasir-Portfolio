import { Suspense } from "react";

import { SubscriptionButtons } from "@/components/layout/SubscriptionButtons";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Newsletter", robots: { index: false } };

async function Buttons({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return <p className="text-muted">Sign up with the form at the bottom of any page.</p>;
  }
  return <SubscriptionButtons token={token} />;
}

// Opened from the confirmation email; the buttons do the work, so opening the link alone
// changes nothing.
export default function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <section className="pt-[calc(var(--header-h)+56px)] pb-24">
      <Container className="flex max-w-xl flex-col items-center gap-6 text-center">
        <p className="label-mono text-muted">Newsletter</p>
        <h1 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-[-0.04em]">
          New notes and projects, by email
        </h1>
        <p className="text-muted">About once a month. Leave any time with one click.</p>
        <Suspense fallback={<div className="h-12 w-72 animate-pulse rounded-pill bg-surface-2" />}>
          <Buttons searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}
