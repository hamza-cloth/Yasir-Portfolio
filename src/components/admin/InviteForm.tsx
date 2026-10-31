"use client";

import { useActionState } from "react";

import type { InviteResult } from "@/app/admin/system-actions";
import { buttonClassName } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

import { SelectField, TextField } from "./fields";

type InviteFormProps = {
  action: (previous: InviteResult, form: FormData) => Promise<InviteResult>;
};

// Invites an editor or viewer. Without email configured, the link is shown to send by hand.
export function InviteForm({ action }: InviteFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem]">
        <TextField label="Email" name="email" type="email" autoComplete="off" required />
        <SelectField
          label="Role"
          name="role"
          defaultValue="EDITOR"
          options={[
            ["EDITOR", "Editor: content, messages, leads"],
            ["VIEWER", "Viewer: read only"],
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClassName("accent", "md")}>
          {pending ? "Inviting…" : "Send invitation"}
        </button>
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
      {state.link ? (
        <div className="flex flex-col gap-2 rounded-card border border-line-2 p-4">
          <p className="font-mono text-sm break-all text-fg">{state.link}</p>
          <CopyButton value={state.link} className="self-start">
            Copy the link
          </CopyButton>
        </div>
      ) : null}
    </form>
  );
}
