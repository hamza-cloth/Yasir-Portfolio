import { Suspense } from "react";
import Link from "next/link";

import { resetPassword } from "@/app/admin/system-actions";
import { AuthCard } from "@/components/admin/AuthCard";
import { AuthField, AuthForm } from "@/components/admin/AuthForm";

export const metadata = { title: "Choose a new password" };

// The token comes from the emailed link; it is checked when the form is sent.
async function ResetForm({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <p className="text-muted">
        This page needs the link from the reset email.{" "}
        <Link href="/admin/login/forgot" className="font-medium text-c1-text hover:underline">
          Ask for a new link
        </Link>
        .
      </p>
    );
  }
  return (
    <AuthForm
      action={resetPassword}
      hidden={{ token }}
      submitLabel="Save the new password"
      pendingLabel="Saving…"
    >
      <AuthField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={12}
        hint="At least 12 characters. Every signed-in device is signed out."
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
  );
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <AuthCard eyebrow="Password reset" title="Choose a new password">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-field bg-surface-2" />}>
        <ResetForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
