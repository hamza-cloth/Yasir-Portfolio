"use client";

import { useActionState, useId, type ComponentProps, type ReactNode } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useKeepValuesSubmit } from "@/hooks/useKeepValuesSubmit";
import { cn } from "@/lib/cn";

import type { FormResult } from "./AdminForm";

type AuthFormProps = {
  action: (previous: FormResult, formData: FormData) => Promise<FormResult>;
  submitLabel: string;
  pendingLabel: string;
  hidden?: Record<string, string>;
  children: ReactNode;
};

const inputClass =
  "w-full rounded-field border border-line-2 bg-bg/60 px-3.5 py-3 text-[0.95rem] text-fg outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-faint focus:border-c1/70 focus:bg-surface-solid focus:shadow-[0_0_0_4px_var(--highlight)]";

export function AuthField({
  label,
  hint,
  ...props
}: Omit<ComponentProps<"input">, "className"> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-fg">
        {label}
      </label>
      <input
        id={id}
        className={inputClass}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// The small forms around sign-in (two-factor code, forgotten password, reset, invitation): one
// action, an inline error or success line, and a pending button. Works without JavaScript.
export function AuthForm({ action, submitLabel, pendingLabel, hidden, children }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const submit = useKeepValuesSubmit(formAction);

  return (
    <form action={formAction} onSubmit={submit} className="flex flex-col gap-5">
      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-field border border-red/25 bg-red/8 px-4 py-3 text-sm leading-relaxed text-red"
        >
          <Icon name="alert" size={18} className="mt-0.5 flex-none" />
          <p>{state.error}</p>
        </div>
      ) : state.ok ? (
        <p
          role="status"
          className="flex items-start gap-3 rounded-field border border-ok/25 bg-ok/8 px-4 py-3 text-sm leading-relaxed text-ok"
        >
          <Icon name="shield" size={18} className="mt-0.5 flex-none" />
          {state.ok}
        </p>
      ) : null}
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
      <button
        type="submit"
        disabled={pending}
        className={cn(buttonClassName("accent", "lg"), "mt-1 w-full")}
      >
        {pending ? (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        ) : null}
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
