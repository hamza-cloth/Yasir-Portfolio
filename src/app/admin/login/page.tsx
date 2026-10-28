import Link from "next/link";

import { AdminForm } from "@/components/admin/AdminForm";
import { TextField } from "@/components/admin/fields";
import { Aurora } from "@/components/canvas/Aurora";
import { isAdminConfigured } from "@/lib/auth/session";

import { login } from "../actions";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  const configured = isAdminConfigured();

  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden px-5 py-16">
      <Aurora className="-z-10" />
      <div className="glass animate-rise w-full max-w-md rounded-panel p-8 md:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="surface grid size-11 place-items-center rounded-xl border border-line-2">
            <span className="text-gradient font-display text-base font-semibold">YA</span>
          </span>
          <div>
            <h1 className="text-xl tracking-[-0.03em]">Admin</h1>
            <p className="text-sm text-muted">Sign in to edit the site.</p>
          </div>
        </div>

        {configured ? (
          <AdminForm action={login} submitLabel="Sign in">
            <TextField label="Email" name="email" type="email" autoComplete="username" required />
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </AdminForm>
        ) : (
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
            <p className="text-fg">The admin area is not configured yet.</p>
            <p>
              Set <code className="font-mono text-c1-text">DATABASE_URL</code>,{" "}
              <code className="font-mono text-c1-text">ADMIN_EMAIL</code> and{" "}
              <code className="font-mono text-c1-text">ADMIN_PASSWORD_HASH</code>, then redeploy.
              Generate the hash with <code className="font-mono">npm run admin:hash</code>.
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg"
        >
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
