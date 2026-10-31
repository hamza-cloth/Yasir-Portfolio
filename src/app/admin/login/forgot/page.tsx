import { requestPasswordReset } from "@/app/admin/system-actions";
import { AuthCard } from "@/components/admin/AuthCard";
import { AuthField, AuthForm } from "@/components/admin/AuthForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Password reset"
      title="Forgot your password?"
      description="Enter the email you sign in with. If it has an admin account, a link to choose a new password arrives within a minute and works for 30 minutes."
    >
      <AuthForm
        action={requestPasswordReset}
        submitLabel="Send the reset link"
        pendingLabel="Sending…"
      >
        <AuthField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          required
        />
      </AuthForm>
    </AuthCard>
  );
}
