"use client";

import { useActionState, useId } from "react";

import { subscribe, type SubscribeState } from "@/app/(site)/subscribe/actions";
import { buttonClassName } from "@/components/ui/Button";

const INITIAL: SubscribeState = { status: "idle" };

// The footer's newsletter sign-up. Double opt-in: the confirmation link arrives by email.
export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, INITIAL);
  const id = useId();

  if (state.status === "sent") {
    return (
      <p role="status" className="max-w-sm text-sm text-ok">
        Nearly done: check your inbox and confirm the subscription.
      </p>
    );
  }

  return (
    <form action={action} className="flex max-w-sm flex-col gap-2">
      <label htmlFor={`${id}-email`} className="text-sm text-muted">
        New notes and projects by email, about once a month.
      </label>
      <div className="flex gap-2">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-invalid={state.status === "error" ? true : undefined}
          aria-describedby={state.status === "error" ? `${id}-error` : undefined}
          className="min-h-11 min-w-0 flex-1 rounded-field border border-line-2 bg-bg/60 px-3.5 text-[0.95rem] text-fg outline-none placeholder:text-faint focus:border-c1/70 focus:shadow-[0_0_0_4px_var(--highlight)]"
        />
        {/* Honeypot: hidden from people, filled in by bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button type="submit" disabled={pending} className={buttonClassName("line", "sm")}>
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {state.status === "error" ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
