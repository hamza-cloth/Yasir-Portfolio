"use client";

import { useActionState, useEffect, useRef } from "react";

import { buttonClassName } from "@/components/ui/Button";

import type { FormResult } from "./AdminForm";
import { inputClass } from "./fields";
import { toast } from "./Toaster";

type ReplyFormProps = {
  action: (previous: FormResult, form: FormData) => Promise<FormResult>;
  name: string;
};

const TEMPLATES = [
  {
    label: "Thanks, will reply soon",
    body: "Hi {name},\n\nThanks for getting in touch. I've read your message and will reply properly within two working days.\n\nBest,\nYasir",
  },
  {
    label: "Book a call",
    body: "Hi {name},\n\nThanks for the details. The quickest next step is a 20-minute call to go through scope and timeline. Which day this week suits you?\n\nBest,\nYasir",
  },
  {
    label: "Not a fit",
    body: "Hi {name},\n\nThank you for thinking of me. This one is outside what I take on right now, so I'd rather say so early than keep you waiting.\n\nAll the best with it,\nYasir",
  },
];

// Replies to a message by email (Resend), with a few saved starting points. Replies come back to
// the signed-in admin's address.
export function ReplyForm({ action, name }: ReplyFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const firstName = name.split(/\s+/)[0] ?? name;

  useEffect(() => {
    if (state.ok) {
      toast("ok", state.ok);
      formRef.current?.reset();
    } else if (state.error) {
      toast("error", state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.label}
            type="button"
            onClick={() => {
              if (bodyRef.current)
                bodyRef.current.value = template.body.replace("{name}", firstName);
            }}
            className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-3.5 text-sm text-muted hover:text-fg"
          >
            {template.label}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="label-mono text-faint">Subject</span>
        <input
          name="subject"
          defaultValue="Re: your message"
          maxLength={160}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label-mono text-faint">Reply</span>
        <textarea
          ref={bodyRef}
          name="body"
          rows={6}
          required
          maxLength={8000}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClassName("accent", "md")}>
          {pending ? "Sending…" : "Send reply"}
        </button>
        {state.error ? (
          <p role="alert" className="text-sm text-red">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
