"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { sendProjectInquiry, type InquiryState } from "@/app/(site)/hire/actions";
import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { BUDGET_RANGES, PROJECT_TYPES, RESPONSE_TIME, TIMELINES, whatsappUrl } from "@/lib/hire";
import { checkInquiry, DETAILS_MAX, DETAILS_MIN, type InquiryField } from "@/lib/inquiry-rules";

const INITIAL: InquiryState = { status: "idle" };

const fieldClass =
  "min-h-12 w-full rounded-field border border-line bg-surface-solid px-4 py-3 text-fg placeholder:text-faint transition-[border-color,box-shadow] duration-200 outline-none hover:border-line-2 focus:border-c1 focus:shadow-[0_0_0_3px_var(--highlight)] aria-invalid:border-red/70";

function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <p id={id} aria-live="polite" className="min-h-0 text-sm text-red empty:hidden">
      {error ?? ""}
    </p>
  );
}

function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <span className="label-mono text-faint">
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="text-c1-text">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </span>
  );
}

function WhatsAppLink({ text, label }: { text?: string; label: string }) {
  const href = whatsappUrl(text);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener" className={buttonClassName("line", "md")}>
      <Icon name="whatsapp" />
      {label}
    </a>
  );
}

export function ProjectInquiryForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(sendProjectInquiry, INITIAL);
  const [clientErrors, setClientErrors] = useState<Partial<Record<InquiryField, string>>>({});
  const [detailsLength, setDetailsLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  const errors = { ...state.fieldErrors, ...clientErrors };
  const values = state.values ?? {};

  // "Get Exact Quote" from the cost calculator arrives with the project type, budget and a
  // summary in the URL; they fill the form once, and only with values the form offers.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    const fill = (name: string, allowed?: readonly string[]) => {
      const value = params.get(name);
      const field = form.elements.namedItem(name);
      if (
        !value ||
        !(
          field instanceof HTMLInputElement ||
          field instanceof HTMLSelectElement ||
          field instanceof HTMLTextAreaElement
        )
      )
        return;
      if (allowed && !allowed.includes(value)) return;
      if (!field.value) field.value = value.slice(0, DETAILS_MAX);
    };
    fill("projectType", PROJECT_TYPES);
    fill("budget", BUDGET_RANGES);
    fill("details");
    fill("estimate");
    const details = form.elements.namedItem("details");
    if (details instanceof HTMLTextAreaElement && details.value) {
      const length = details.value.trim().length;
      const frame = window.requestAnimationFrame(() => setDetailsLength(length));
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  // Validates in the browser first (same rules as the server), then submits without letting
  // React reset the form, so a server error never wipes what was typed.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next = checkInquiry(
      Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value)])),
    );
    if (Object.keys(next).length > 0) {
      setClientErrors(next);
      const first = Object.keys(next)[0];
      if (first) event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setClientErrors({});
    startTransition(() => action(formData));
  }

  // The same answers as a WhatsApp message, for people who would rather chat.
  function whatsappText(): string {
    const form = formRef.current;
    if (!form) return "";
    const data = new FormData(form);
    const line = (label: string, key: string) => {
      const value = String(data.get(key) ?? "").trim();
      return value ? `${label}: ${value}` : null;
    };
    return [
      "Hi Yasir, I want to discuss a website/app project.",
      line("Name", "name"),
      line("Project", "projectType"),
      line("Budget", "budget"),
      line("Timeline", "timeline"),
      line("Details", "details"),
    ]
      .filter(Boolean)
      .join("\n");
  }

  function openWhatsApp() {
    const href = whatsappUrl(whatsappText());
    if (href) window.open(href, "_blank", "noopener");
  }

  if (state.status === "sent") {
    return (
      <div role="status" className="animate-rise flex flex-col items-start gap-5 py-4">
        <span className="grid size-14 place-items-center rounded-full border-2 border-c1 text-c1-text">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-draw"
            />
          </svg>
        </span>
        <h3 className="text-2xl">Thank you!</h3>
        <p className="max-w-md text-muted">
          I&apos;ll get back to you {RESPONSE_TIME}, from {email}.
        </p>
        <WhatsAppLink label="Chat on WhatsApp" />
      </div>
    );
  }

  const whatsappAvailable = Boolean(whatsappUrl());

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <Label required>Full name</Label>
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
          <Label required>Email</Label>
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
        <label className="flex flex-col gap-2">
          <Label required>Phone / WhatsApp</Label>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            defaultValue={values.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={`${id}-phone`}
            className={fieldClass}
            placeholder="+91 98765 43210"
          />
          <FieldError id={`${id}-phone`} error={errors.phone} />
        </label>
        <label className="flex flex-col gap-2">
          <Label required>Project type</Label>
          <select
            name="projectType"
            required
            defaultValue={values.projectType ?? ""}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={`${id}-projectType`}
            className={fieldClass}
          >
            <option value="" disabled>
              Choose one
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <FieldError id={`${id}-projectType`} error={errors.projectType} />
        </label>
        <label className="flex flex-col gap-2">
          <Label>Budget range</Label>
          <select name="budget" defaultValue={values.budget ?? ""} className={fieldClass}>
            <option value="">Prefer not to say</option>
            {BUDGET_RANGES.map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <Label>Timeline</Label>
          <select name="timeline" defaultValue={values.timeline ?? ""} className={fieldClass}>
            <option value="">Not decided</option>
            {TIMELINES.map((timeline) => (
              <option key={timeline}>{timeline}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <Label required>Project details</Label>
        <textarea
          name="details"
          rows={6}
          required
          maxLength={DETAILS_MAX}
          defaultValue={values.details}
          onChange={(event) => setDetailsLength(event.currentTarget.value.trim().length)}
          aria-invalid={Boolean(errors.details)}
          aria-describedby={`${id}-details ${id}-count`}
          className={cn(fieldClass, "min-h-40 resize-y leading-relaxed")}
          placeholder="What should it do, who is it for, and any sites you like."
        />
        <span className="flex items-start justify-between gap-4">
          <FieldError id={`${id}-details`} error={errors.details} />
          <span
            id={`${id}-count`}
            className={cn(
              "ml-auto font-mono text-xs",
              detailsLength >= DETAILS_MIN ? "text-faint" : "text-muted",
            )}
          >
            {detailsLength}/{DETAILS_MAX} · min {DETAILS_MIN}
          </span>
        </span>
      </label>

      {/* Hidden from people and assistive tech; only bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {/* The calculator's selection, when the visitor came from "Get Exact Quote". */}
      <input type="hidden" name="estimate" defaultValue="" />

      {state.status === "error" && state.message ? (
        <div role="alert" className="flex flex-col gap-3 rounded-field border border-red/40 p-4">
          <p className="text-sm text-fg">{state.message}</p>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClassName("line", "sm")}>
              Try again
            </button>
            {whatsappAvailable ? (
              <button
                type="button"
                onClick={openWhatsApp}
                className={buttonClassName("line", "sm")}
              >
                <Icon name="whatsapp" />
                Send on WhatsApp
              </button>
            ) : null}
            <a
              href={`mailto:${email}?subject=Project%20Inquiry`}
              className={buttonClassName("line", "sm")}
            >
              <Icon name="mail" />
              Email instead
            </a>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className={buttonClassName("accent", "lg", "w-full sm:w-auto")}
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
              Send Project Inquiry
              <Icon name="arrow-right" />
            </>
          )}
        </button>
        {whatsappAvailable ? (
          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            <Icon name="whatsapp" size={16} />
            Send via WhatsApp instead
          </button>
        ) : null}
      </div>
    </form>
  );
}
