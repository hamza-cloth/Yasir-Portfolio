import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { Aurora } from "@/components/canvas/Aurora";
import { Avatar } from "@/components/ui/Avatar";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getAdmin, isAdminConfigured } from "@/lib/auth/session";
import { DEFAULT_SITE_SETTINGS } from "@/lib/content/site-settings";
import { getSiteSettings } from "@/lib/data/settings";
import { getProfilePhoto } from "@/lib/profile-photo";

import { login } from "../actions";

export const metadata = { title: "Sign in" };

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "shield",
    title: "One private account",
    body: "Only the admin can sign in, and the password is stored as an argon2id hash.",
  },
  {
    icon: "lock",
    title: "Guarded sign-in",
    body: "Five attempts per 15 minutes, counted per connection and per email.",
  },
  {
    icon: "list",
    title: "Every change on record",
    body: "Edits, uploads and sign-ins show up in the dashboard's activity feed.",
  },
];

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
      {children}
    </code>
  );
}

const SETUP_STEPS: ReactNode[] = [
  <>
    Add <Code>DATABASE_URL</Code> to <Code>.env</Code> (Neon&apos;s pooled URL in production).
  </>,
  <>
    Create the tables with <Code>npm run db:deploy</Code>.
  </>,
  <>
    Put <Code>ADMIN_EMAIL</Code> and <Code>ADMIN_PASSWORD</Code> in your local <Code>.env</Code>,
    then run <Code>npm run db:seed</Code>.
  </>,
  <>Restart the server and sign in here.</>,
];

function SetupSteps() {
  return (
    <ol className="flex flex-col gap-4">
      {SETUP_STEPS.map((step, index) => (
        <li key={index} className="flex gap-3.5 text-[0.95rem] leading-relaxed text-muted">
          <span className="grid size-7 flex-none place-items-center rounded-full bg-c1-soft text-sm font-bold text-c1-text">
            {index + 1}
          </span>
          <span className="pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function LoginPage() {
  const configured = isAdminConfigured();
  // Already signed in: go straight to the dashboard. A database hiccup just shows the form.
  if (configured && (await getAdmin().catch(() => null))) redirect("/admin");

  const settings = await getSiteSettings().catch(() => DEFAULT_SITE_SETTINGS);
  const photo = await getProfilePhoto(settings.photoUrl).catch(() => null);

  return (
    <main className="grid min-h-svh bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Sign-in column: first in the page, so keyboard and screen-reader users reach the form first. */}
      <section className="relative isolate flex flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-8 lg:py-16">
        <Aurora className="-z-10 opacity-70" />

        <div className="w-full max-w-[27rem]">
          <Link
            href="/"
            className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-fg"
          >
            <Icon name="arrow-right" size={16} className="rotate-180" />
            Back to the site
          </Link>

          <div className="animate-rise rounded-panel border border-line bg-surface-solid p-6 shadow-(--shadow-lift) sm:p-9">
            <div className="flex items-center gap-4">
              <Avatar photo={photo} size={56} sizes="56px" ring />
              <div className="min-w-0">
                <p className="label-mono text-muted">Admin console</p>
                <h1 className="mt-1 text-[1.75rem] leading-tight tracking-[-0.03em]">
                  {configured ? "Welcome back" : "Finish the setup"}
                </h1>
              </div>
            </div>

            <p className="mt-4 mb-7 text-muted">
              {configured
                ? "Sign in to manage projects, notes, messages and the home-page looks."
                : "The admin area needs a database before anyone can sign in. Four steps:"}
            </p>

            {configured ? <LoginForm action={login} /> : <SetupSteps />}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted">
            <Icon name="shield" size={16} className="flex-none" />
            Protected area, rate-limited sign-in.
          </p>
        </div>
      </section>

      {/* Brand panel, shown beside the form from large screens up. */}
      <aside
        aria-label="About the admin"
        className="relative isolate hidden overflow-hidden text-white [background:var(--feature-bg)] lg:order-first lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 [background-image:radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1.4px)] [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_75%)] bg-size-[22px_22px]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-40 -bottom-48 -z-10 size-[36rem] rounded-full bg-white/10 blur-3xl"
        />

        <Link href="/" className="inline-flex min-h-11 items-center gap-3 self-start font-bold">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full bg-white text-[0.9rem] font-extrabold tracking-[-0.04em] text-[#0e1220]"
          >
            YA
          </span>
          {settings.name}
          <span className="sr-only">, back to the site</span>
        </Link>

        <div className="max-w-md py-12">
          <p className="label-mono text-white/90">Portfolio admin</p>
          <h2 className="mt-4 text-[clamp(2.1rem,3.2vw,3rem)] leading-[1.05] tracking-[-0.035em] text-white">
            Every part of the site, edited in one place.
          </h2>
          <ul className="mt-10 flex flex-col gap-6">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="grid size-11 flex-none place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  <Icon name={feature.icon} size={19} />
                </span>
                <span>
                  <span className="block font-semibold text-white">{feature.title}</span>
                  <span className="mt-0.5 block text-[0.95rem] leading-relaxed text-white/90">
                    {feature.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center gap-2 text-sm text-white/90">
          <Icon name="database" size={16} />
          Changes publish to the live site as soon as you save.
        </p>
      </aside>
    </main>
  );
}
