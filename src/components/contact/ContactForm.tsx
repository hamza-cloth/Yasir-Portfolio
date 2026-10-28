"use client";

import { useActionState, useId } from "react";

import { sendMessage, type ContactState } from "@/app/(site)/contact/actions";
import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useKeepValuesSubmit } from "@/hooks/useKeepValuesSubmit";
import { cn } from "@/lib/cn";
import { MESSAGE_TOPICS, type MessageTopicValue } from "@/lib/validation/message";

const INITIAL: ContactState = { status: "idle" };

const fieldClass =
  "w-full rounded-field border border-line-2 bg-bg/60 px-4 py-3.5 text-fg placeholder:text-faint transition-[border-color,box-shadow] duration-300 outline-none focus:border-c1/70 focus:shadow-[0_0_0_4px_var(--highlight)] aria-invalid:border-red/70";

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="text-sm text-red">
      {error}
    </p>
  );
}

export function ContactForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(sendMessage, INITIAL);
  const onSubmit = useKeepValuesSubmit(action);
  const id = useId();
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  if (state.status === "sent") {
    return (
      <div role="status" className="animate-rise flex flex-col items-start gap-5 py-6">
        <span className="grid size-14 place-items-center rounded-full bg-ok/15 text-ok">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-draw"
            />
          </svg>
        </span>
        <h3 className="text-2xl tracking-[-0.03em]">Message received.</h3>
        <p className="max-w-md text-muted">
          Thanks for writing. I read every message and usually reply within a day, from {email}.
        </p>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="label-mono text-faint">Your name</span>
          <input
            name="name"
            autoComplete="name"
            required
            defaultValue={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={`${id}-name`}
            className={fieldClass}
            placeholder="Priya Sharma"
          />
          <FieldError id={`${id}-name`} error={errors.name} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-mono text-faint">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={`${id}-email`}
            className={fieldClass}
            placeholder="you@company.com"
          />
          <FieldError id={`${id}-email`} error={errors.email} />
        </label>
      </div>

      <fieldset className="flex flex-col gap-3" aria-describedby={`${id}-topic`}>
        <legend className="label-mono mb-2 text-faint">What is it about?</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(MESSAGE_TOPICS) as [MessageTopicValue, string][]).map(
            ([value, label], index) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  name="topic"
                  value={value}
                  defaultChecked={values.topic ? values.topic === value : index === 0}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm text-muted transition-colors duration-300 peer-checked:border-fg peer-checked:bg-fg peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-c1 hover:text-fg">
                  {label}
                </span>
              </label>
            ),
          )}
        </div>
        <FieldError id={`${id}-topic`} error={errors.topic} />
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="label-mono text-faint">Message</span>
        <textarea
          name="body"
          rows={6}
          required
          defaultValue={values.body}
          aria-invalid={Boolean(errors.body)}
          aria-describedby={`${id}-body`}
          className={cn(fieldClass, "min-h-40 resize-y leading-relaxed")}
          placeholder="The role, the problem or the idea, and where you are."
        />
        <FieldError id={`${id}-body`} error={errors.body} />
      </label>

      {/* Hidden from people and assistive tech; only bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={pending}
          className={buttonClassName("primary", "lg", "btn-shine min-w-44")}
        >
          {pending ? (
            <>
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
              />
              Sending…
            </>
          ) : (
            <>
              Send message
              <Icon name="arrow-right" />
            </>
          )}
        </button>
        {state.status === "error" && state.message ? (
          <p role="alert" className="text-sm text-red">
            {state.message}
          </p>
        ) : (
          <p className="text-sm text-faint">Replies come from {email}.</p>
        )}
      </div>
    </form>
  );
}
