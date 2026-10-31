"use client";

import { useActionState, useEffect, useState } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { renderEmail } from "@/lib/email-template";

import type { FormResult } from "./AdminForm";
import { inputClass } from "./fields";
import { toast } from "./Toaster";

type ReplyFormProps = {
  action: (previous: FormResult, form: FormData) => Promise<FormResult>;
  name: string;
  email: string;
  original: { body: string; date: string };
  contact: { email: string | null; whatsapp: string | null };
};

const TEMPLATES = [
  {
    label: "Thanks, will reply soon",
    body: "Hi {name},\n\nThanks for getting in touch. I've read your message and will reply properly within two working days.\n\nBest regards,\nYasir",
  },
  {
    label: "Book a call",
    body: "Hi {name},\n\nThanks for the details. The quickest next step is a 20-minute call to go through scope and timeline. Which day this week suits you?\n\nBest regards,\nYasir",
  },
  {
    label: "Send a quote",
    body: "Hi {name},\n\nThank you for sharing your requirements. Based on what you've described, here is how I would approach it:\n\n• Scope:\n• Timeline:\n• Investment:\n\nHappy to walk you through it on a quick call.\n\nBest regards,\nYasir",
  },
  {
    label: "Not a fit",
    body: "Hi {name},\n\nThank you for thinking of me. This one is outside what I take on right now, so I'd rather say so early than keep you waiting.\n\nAll the best with it,\nYasir",
  },
];

// Replies to a message straight from the admin, as "Yasir Portfolio", in the branded email.
// The preview renders the exact email with the same template the server sends.
export function ReplyForm({ action, name, email, original, contact }: ReplyFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [subject, setSubject] = useState("Re: your message");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [seenState, setSeenState] = useState(state);
  const firstName = name.split(/\s+/)[0] ?? name;

  // A sent reply clears the form (derived state, adjusted during render).
  if (state !== seenState) {
    setSeenState(state);
    if (state.ok) {
      setBody("");
      setPreview(false);
    }
  }

  useEffect(() => {
    if (state.ok) toast("ok", state.ok);
    else if (state.error) toast("error", state.error);
  }, [state]);

  const topic = subject.replace(/^re:\s*/i, "").trim();
  const html = preview
    ? renderEmail({
        siteUrl: window.location.origin,
        preheader: body.slice(0, 110),
        eyebrow: "Reply to your message",
        heading:
          !topic || /^your message$/i.test(topic)
            ? "Thanks for getting in touch"
            : topic.charAt(0).toUpperCase() + topic.slice(1),
        body: body || "Your reply appears here.",
        quote: { label: `Your message · ${original.date}`, text: original.body.slice(0, 1500) },
        signature: true,
        contact,
      }).html
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-sm text-muted">
        <Icon name="mail" size={15} className="flex-none" />
        To {name} &lt;{email}&gt; · from “Yasir Portfolio”
      </p>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.label}
            type="button"
            onClick={() => setBody(template.body.replace("{name}", firstName))}
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
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          maxLength={160}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label-mono text-faint">Reply</span>
        <textarea
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={8}
          required
          maxLength={8000}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </label>
      {preview ? (
        <iframe
          title="Email preview"
          srcDoc={html}
          sandbox=""
          className="h-[38rem] w-full rounded-card border border-line bg-white"
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClassName("accent", "md")}>
          <Icon name="mail" size={16} />
          {pending ? "Sending…" : "Send reply"}
        </button>
        <button
          type="button"
          onClick={() => setPreview((shown) => !shown)}
          className={buttonClassName("line", "md")}
        >
          <Icon name={preview ? "eye-off" : "eye"} size={16} />
          {preview ? "Hide preview" : "Preview email"}
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
