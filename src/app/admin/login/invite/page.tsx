import { Suspense } from "react";

import { acceptInvite } from "@/app/admin/system-actions";
import { AuthCard } from "@/components/admin/AuthCard";
import { AuthField, AuthForm } from "@/components/admin/AuthForm";
import { isRole, ROLE_LABELS } from "@/lib/admin/roles";
import { hashToken } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export const metadata = { title: "Accept invitation" };

// Shows who the invitation is for before asking for a password; the action checks it again.
async function InviteForm({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const invite = token
    ? await getDb()
        ?.invite.findUnique({ where: { tokenHash: hashToken(token) } })
        .catch(() => null)
    : null;

  if (!token || !invite || invite.acceptedAt || invite.expires < new Date()) {
    return (
      <p className="text-muted">
        This invitation has expired or was already used. Ask the person who invited you for a new
        one.
      </p>
    );
  }

  return (
    <>
      <p className="mb-6 text-muted">
        <span className="font-semibold text-fg">{invite.email}</span> joins as{" "}
        {isRole(invite.role) ? ROLE_LABELS[invite.role].toLowerCase() : invite.role}. Choose a
        password to finish.
      </p>
      <AuthForm
        action={acceptInvite}
        hidden={{ token }}
        submitLabel="Create my account"
        pendingLabel="Creating…"
      >
        <AuthField label="Your name" name="name" autoComplete="name" maxLength={80} />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          hint="At least 12 characters."
          required
        />
        <AuthField
          label="Repeat it"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </AuthForm>
    </>
  );
}

export default function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <AuthCard eyebrow="Invitation" title="Join the portfolio admin">
      <Suspense fallback={<div className="h-72 animate-pulse rounded-field bg-surface-2" />}>
        <InviteForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
