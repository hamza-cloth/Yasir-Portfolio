"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";

import { Dialog } from "@/components/overlay/Dialog";
import { buttonClassName } from "@/components/ui/Button";
import { useKeepValuesSubmit } from "@/hooks/useKeepValuesSubmit";
import { cn } from "@/lib/cn";

import { toast } from "./Toaster";

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
    <button type="submit" disabled={pending} className={buttonClassName("accent", "md")}>
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

// Warns before leaving the page (reload, close, or an in-app link) while there are unsaved edits.
function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link || link.getAttribute("target") === "_blank") return;
      if (!window.confirm("You have unsaved changes. Leave this page and lose them?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}

// Every admin edit form: one server action, a pending button, a toast and an inline result,
// and a guard against leaving with unsaved edits.
export function AdminForm({ action, submitLabel = "Save", className, children }: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [dirty, setDirty] = useState(false);
  const submitNow = useKeepValuesSubmit(formAction);
  const [seenState, setSeenState] = useState(state);

  // A new result from the server: clear "unsaved" after a successful save (derived state,
  // adjusted during render rather than in an effect).
  if (state !== seenState) {
    setSeenState(state);
    if (state.ok) setDirty(false);
  }

  useUnsavedGuard(dirty && !pending);

  // Toasts are a side effect, so they stay in an effect; it sets no state.
  useEffect(() => {
    if (state.ok) toast("ok", state.ok);
    else if (state.error) toast("error", state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={submitNow}
      onInput={() => setDirty(true)}
      onChange={() => setDirty(true)}
      className={cn("flex flex-col gap-5", className)}
    >
      {children}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 self-start rounded-pill border border-line-2 bg-surface/90 py-2 pr-5 pl-2 shadow-(--shadow-soft) backdrop-blur-xl">
        <SubmitButton label={submitLabel} pending={pending} />
        {state.error ? (
          <p role="alert" className="text-sm text-red">
            {state.error}
          </p>
        ) : dirty ? (
          <p className="text-sm text-muted">Unsaved changes</p>
        ) : state.ok ? (
          <p className="text-sm text-ok">{state.ok}</p>
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
  disabled?: boolean;
  title?: string;
};

// A one-button form (delete, star, archive) for rows; destructive ones ask first in a dialog.
export function InlineAction({
  action,
  label,
  confirm,
  tone = "default",
  hidden,
  disabled = false,
  title,
}: InlineActionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);
  const [asking, setAsking] = useState(false);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(event) => {
        if (confirm && !confirmedRef.current) {
          event.preventDefault();
          setAsking(true);
          return;
        }
        confirmedRef.current = false;
      }}
    >
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        disabled={disabled}
        title={title}
        className={cn(
          "inline-flex min-h-11 items-center rounded-pill border px-3.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
          tone === "danger"
            ? "border-red/40 text-red hover:bg-red/10"
            : "border-line-2 text-muted hover:border-fg/30 hover:text-fg",
        )}
      >
        {label}
      </button>
      {confirm ? (
        <Dialog open={asking} onClose={() => setAsking(false)} label="Please confirm">
          <div className="flex flex-col gap-5 p-6">
            <p className="text-lg font-semibold text-fg">{confirm}</p>
            <p className="text-sm text-muted">This cannot be undone.</p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setAsking(false)}
                className={buttonClassName("line", "md")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmedRef.current = true;
                  setAsking(false);
                  formRef.current?.requestSubmit();
                }}
                className="inline-flex min-h-12 items-center rounded-pill bg-red px-6 font-semibold text-white"
              >
                {label}
              </button>
            </div>
          </div>
        </Dialog>
      ) : null}
    </form>
  );
}
