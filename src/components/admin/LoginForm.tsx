"use client";

import { useActionState, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useKeepValuesSubmit } from "@/hooks/useKeepValuesSubmit";
import { cn } from "@/lib/cn";

import type { FormResult } from "./AdminForm";

type LoginFormProps = {
  action: (previous: FormResult, formData: FormData) => Promise<FormResult>;
};

const inputClass =
  "w-full rounded-field border border-line-2 bg-bg/60 py-3 pr-3.5 pl-11 text-[0.95rem] text-fg outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-faint focus:border-c1/70 focus:bg-surface-solid focus:shadow-[0_0_0_4px_var(--highlight)] aria-invalid:border-red/60";

const iconClass = "pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted";

// The sign-in form: its own pending and error states (not the edit-form toolbar), a show/hide
// password toggle and a Caps Lock hint. Works without JavaScript through the form action.
export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const submit = useKeepValuesSubmit(formAction);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const errorId = `${id}-error`;
  const capsId = `${id}-caps`;

  // After a failed attempt the password is cleared and focused, ready to retype.
  useEffect(() => {
    const input = passwordRef.current;
    if (!state.error || !input) return;
    input.value = "";
    input.focus();
  }, [state]);

  function trackCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState("CapsLock"));
  }

  const invalid = state.error ? true : undefined;

  return (
    <form action={formAction} onSubmit={submit} className="flex flex-col gap-5">
      {state.error ? (
        <div
          id={errorId}
          role="alert"
          className="flex items-start gap-3 rounded-field border border-red/25 bg-red/8 px-4 py-3 text-sm leading-relaxed text-red"
        >
          <Icon name="alert" size={18} className="mt-0.5 flex-none" />
          <p>{state.error}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-email`} className="text-sm font-semibold text-fg">
          Email
        </label>
        <div className="relative">
          <Icon name="mail" size={18} className={iconClass} />
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            required
            aria-invalid={invalid}
            aria-describedby={state.error ? errorId : undefined}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-password`} className="text-sm font-semibold text-fg">
          Password
        </label>
        <div className="relative">
          <Icon name="lock" size={18} className={iconClass} />
          <input
            ref={passwordRef}
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            required
            onKeyDown={trackCapsLock}
            onKeyUp={trackCapsLock}
            aria-invalid={invalid}
            aria-describedby={
              [state.error ? errorId : "", capsLock ? capsId : ""].filter(Boolean).join(" ") ||
              undefined
            }
            className={cn(inputClass, "pr-14")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
          >
            <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
          </button>
        </div>
        {capsLock ? (
          <p id={capsId} className="flex items-center gap-1.5 text-sm text-muted">
            <Icon name="alert" size={15} className="flex-none" />
            Caps Lock is on.
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(buttonClassName("accent", "lg"), "mt-1 w-full")}
      >
        {pending ? (
          <>
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <Icon name="arrow-right" size={18} />
          </>
        )}
      </button>
    </form>
  );
}
