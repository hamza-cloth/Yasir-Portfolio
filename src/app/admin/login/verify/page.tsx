import Link from "next/link";

import { AuthCard } from "@/components/admin/AuthCard";
import { AuthField, AuthForm } from "@/components/admin/AuthForm";

import { verifyTwoFactor } from "../../actions";

export const metadata = { title: "Two-factor code" };

// Second step of a two-factor sign-in. The pending sign-in lives in a 5-minute cookie; the
// action says so when it has expired.
export default function VerifyPage() {
  return (
    <AuthCard
      eyebrow="Two-factor sign-in"
      title="Enter your code"
      description="Open your authenticator app and type the 6-digit code for the portfolio admin. A backup code works too, once."
    >
      <AuthForm action={verifyTwoFactor} submitLabel="Verify and sign in" pendingLabel="Checking…">
        <AuthField
          label="Code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="123 456"
          maxLength={20}
          required
          autoFocus
        />
      </AuthForm>
      <p className="mt-6 text-sm text-muted">
        Lost your phone and your backup codes? Another owner can remove your account and invite you
        again. Code expired?{" "}
        <Link href="/admin/login" className="font-medium text-c1-text hover:underline">
          Start again
        </Link>
        .
      </p>
    </AuthCard>
  );
}
