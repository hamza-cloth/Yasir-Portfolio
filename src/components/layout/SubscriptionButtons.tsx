"use client";

import { useActionState } from "react";

import { confirmSubscription, unsubscribe, type TokenState } from "@/app/(site)/subscribe/actions";
import { buttonClassName } from "@/components/ui/Button";

const INITIAL: TokenState = { status: "idle" };

const RESULT: Record<Exclude<TokenState["status"], "idle">, string> = {
  confirmed: "You're subscribed. Thanks!",
  unsubscribed: "You're unsubscribed. No more emails.",
  error: "This link is not valid any more.",
};

// Confirm or leave the newsletter from the emailed link.
export function SubscriptionButtons({ token }: { token: string }) {
  const [confirmState, confirmAction, confirming] = useActionState(confirmSubscription, INITIAL);
  const [leaveState, leaveAction, leaving] = useActionState(unsubscribe, INITIAL);
  const done = leaveState.status !== "idle" ? leaveState : confirmState;

  if (done.status !== "idle") {
    return (
      <p role="status" className={done.status === "error" ? "text-red" : "text-ok"}>
        {RESULT[done.status]}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <form action={confirmAction}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" disabled={confirming} className={buttonClassName("accent", "md")}>
          {confirming ? "Confirming…" : "Confirm my subscription"}
        </button>
      </form>
      <form action={leaveAction}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" disabled={leaving} className={buttonClassName("line", "md")}>
          {leaving ? "Unsubscribing…" : "Unsubscribe"}
        </button>
      </form>
    </div>
  );
}
