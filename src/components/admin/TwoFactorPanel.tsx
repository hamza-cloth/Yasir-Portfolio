"use client";

import { useActionState, useState, useTransition } from "react";

import type { BackupCodesResult, TwoFactorSetup } from "@/app/admin/system-actions";
import { buttonClassName } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

import type { FormResult } from "./AdminForm";
import { inputClass } from "./fields";

type TwoFactorPanelProps = {
  enabled: boolean;
  available: boolean;
  backupCodesLeft: number;
  start: () => Promise<TwoFactorSetup>;
  confirm: (previous: BackupCodesResult, form: FormData) => Promise<BackupCodesResult>;
  regenerate: (previous: BackupCodesResult, form: FormData) => Promise<BackupCodesResult>;
  disable: (previous: FormResult, form: FormData) => Promise<FormResult>;
};

function CodeInput({ label = "6-digit code from the app" }: { label?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="label-mono text-faint">{label}</span>
      <input
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7}
        required
        className={`${inputClass} max-w-48 font-mono tracking-[0.2em]`}
      />
    </label>
  );
}

function Result({ state }: { state: FormResult }) {
  if (state.error) {
    return (
      <p role="alert" className="text-sm text-red">
        {state.error}
      </p>
    );
  }
  return state.ok ? (
    <p role="status" className="text-sm text-ok">
      {state.ok}
    </p>
  ) : null;
}

function BackupCodes({ codes }: { codes: string[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-amber/30 bg-amber/8 p-4">
      <p className="text-sm text-fg">
        Save these backup codes somewhere safe. Each one signs you in once if you lose your phone.
        They are shown only now.
      </p>
      <ul className="grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-4">
        {codes.map((code) => (
          <li key={code} className="rounded-field bg-surface-solid px-2 py-1.5 text-center">
            {code}
          </li>
        ))}
      </ul>
      <CopyButton value={codes.join("\n")} className="self-start">
        Copy the codes
      </CopyButton>
    </div>
  );
}

// Turning two-factor on is two steps: a new secret (QR code), then a code from the app to prove
// it works, which returns the backup codes.
export function TwoFactorPanel({
  enabled,
  available,
  backupCodesLeft,
  start,
  confirm,
  regenerate,
  disable,
}: TwoFactorPanelProps) {
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [starting, startTransition] = useTransition();
  const [confirmState, confirmAction, confirming] = useActionState(confirm, {});
  const [regenState, regenAction, regenerating] = useActionState(regenerate, {});
  const [disableState, disableAction, disabling] = useActionState(disable, {});

  if (!available) {
    return (
      <p className="text-sm text-muted">
        Add <code>ADMIN_ENCRYPTION_KEY</code> (any random string of 32+ characters) to the
        environment and redeploy to turn on two-factor sign-in.
      </p>
    );
  }

  if (confirmState.codes) {
    return (
      <div className="flex flex-col gap-4">
        <Result state={confirmState} />
        <BackupCodes codes={confirmState.codes} />
      </div>
    );
  }

  if (!enabled) {
    if (!setup?.secret) {
      return (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Off. With it on, signing in also asks for a code from an authenticator app (Google
            Authenticator, 1Password, Authy…).
          </p>
          <button
            type="button"
            disabled={starting}
            onClick={() => startTransition(async () => setSetup(await start()))}
            className={buttonClassName("accent", "md")}
          >
            {starting ? "Preparing…" : "Set up two-factor"}
          </button>
          {setup?.error ? <Result state={setup} /> : null}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        {setup.qr ? (
          // A data: URL drawn on the server; next/image adds nothing here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={setup.qr}
            alt="QR code for your authenticator app"
            width={220}
            height={220}
            className="rounded-card bg-white p-2"
          />
        ) : null}
        <form action={confirmAction} className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            1. Scan the code with your authenticator app, or type this key:
          </p>
          <p className="font-mono text-sm break-all text-fg">{setup.secret}</p>
          <p className="text-sm text-muted">2. Enter the code the app shows.</p>
          <CodeInput />
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={confirming} className={buttonClassName("accent", "md")}>
              {confirming ? "Checking…" : "Turn on"}
            </button>
            <Result state={confirmState} />
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">On. {backupCodesLeft} of 8 backup codes left.</p>
      {regenState.codes ? <BackupCodes codes={regenState.codes} /> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <form action={regenAction} className="flex flex-col items-start gap-3">
          <p className="font-medium text-fg">New backup codes</p>
          <CodeInput />
          <button type="submit" disabled={regenerating} className={buttonClassName("line", "md")}>
            {regenerating ? "Creating…" : "Create new codes"}
          </button>
          {!regenState.codes ? <Result state={regenState} /> : null}
        </form>
        <form action={disableAction} className="flex flex-col items-start gap-3">
          <p className="font-medium text-fg">Turn off two-factor</p>
          <CodeInput />
          <button
            type="submit"
            disabled={disabling}
            className="inline-flex min-h-11 items-center rounded-pill border border-red/40 px-4 text-sm text-red hover:bg-red/10"
          >
            {disabling ? "Turning off…" : "Turn off"}
          </button>
          <Result state={disableState} />
        </form>
      </div>
    </div>
  );
}
