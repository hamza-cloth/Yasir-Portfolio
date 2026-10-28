"use client";

import { useActionState, type ReactNode } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { useKeepValuesSubmit } from "@/hooks/useKeepValuesSubmit";
import { cn } from "@/lib/cn";

export type FormResult = {
  ok?: string;
  error?: string;
};

type AdminFormProps = {
  action: (previous: FormResult, formData: FormData) => Promise<FormResult>;
  submitLabel?: string;
  className?: string;
  children: ReactNode;
};

function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className={buttonClassName("primary", "md")}>
      {pending ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      {pending ? "Saving…" : label}
    </button>
  );
}

// Every admin edit form: one server action, a pending button and an inline result line.
export function AdminForm({ action, submitLabel = "Save", className, children }: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const onSubmit = useKeepValuesSubmit(formAction);

  return (
    <form action={formAction} onSubmit={onSubmit} className={cn("flex flex-col gap-5", className)}>
      {children}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 self-start rounded-pill border border-line-2 bg-surface/90 py-2 pr-5 pl-2 backdrop-blur-xl">
        <SubmitButton label={submitLabel} pending={pending} />
        {state.error ? (
          <p role="alert" className="text-sm text-red">
            {state.error}
          </p>
        ) : state.ok ? (
          <p role="status" className="text-sm text-ok">
            {state.ok}
          </p>
        ) : null}
      </div>
    </form>
  );
}

type InlineActionProps = {
  action: (formData: FormData) => Promise<void>;
  label: string;
  confirm?: string;
  tone?: "default" | "danger";
  hidden?: Record<string, string>;
};

// A one-button form (delete, mark read) for rows in admin tables.
export function InlineAction({
  action,
  label,
  confirm,
  tone = "default",
  hidden,
}: InlineActionProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        className={cn(
          "inline-flex min-h-11 items-center rounded-pill border px-3.5 text-sm transition-colors",
          tone === "danger"
            ? "border-red/40 text-red hover:bg-red/10"
            : "border-line-2 text-muted hover:border-fg/30 hover:text-fg",
        )}
      >
        {label}
      </button>
    </form>
  );
}
