"use client";

import { useActionState, type ReactNode } from "react";

import { submitTestimonial, type TestimonialState } from "@/app/(site)/testimonial/actions";
import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const INITIAL: TestimonialState = { status: "idle" };

const inputClass =
  "min-h-12 w-full rounded-field border border-line-2 bg-surface-solid px-4 py-3 text-fg outline-none placeholder:text-faint focus:border-c1 focus:shadow-[0_0_0_4px_var(--highlight)]";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-semibold text-fg">{label}</span>
      {children}
    </label>
  );
}

// The public testimonial form: it lands as "pending" in the admin until approved.
export function TestimonialForm() {
  const [state, action, pending] = useActionState(submitTestimonial, INITIAL);

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="surface flex flex-col gap-3 rounded-panel border border-line p-8"
      >
        <Icon name="check" size={28} className="text-ok" />
        <p className="font-display text-2xl font-semibold text-fg">Thank you!</p>
        <p className="text-muted">
          Your words are with me now. Once I approve them they appear on the home page.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="surface flex flex-col gap-5 rounded-panel border border-line p-6 sm:p-8"
    >
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-field border border-red/25 bg-red/8 px-4 py-3 text-sm text-red"
        >
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name">
          <input name="name" required maxLength={80} autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Role (optional)">
          <input name="role" maxLength={80} placeholder="Founder" className={inputClass} />
        </Field>
        <Field label="Company (optional)">
          <input name="company" maxLength={80} autoComplete="organization" className={inputClass} />
        </Field>
        <Field label="Rating">
          <select name="rating" defaultValue="5" className={inputClass}>
            <option value="5">★★★★★ Excellent</option>
            <option value="4">★★★★ Very good</option>
            <option value="3">★★★ Good</option>
            <option value="2">★★ Fair</option>
            <option value="1">★ Poor</option>
          </select>
        </Field>
      </div>
      <Field label="How was it working together?">
        <textarea
          name="quote"
          required
          minLength={10}
          maxLength={1200}
          rows={5}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </Field>
      {/* Honeypot: hidden from people, filled in by bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName("accent", "lg", "self-start")}
      >
        {pending ? "Sending…" : "Send testimonial"}
        <Icon name="arrow-right" size={16} />
      </button>
      <p className="text-xs text-faint">
        Shown on the site only after I approve it. Your name, role and company appear with it.
      </p>
    </form>
  );
}
