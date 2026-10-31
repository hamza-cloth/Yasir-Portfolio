import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";

import { AlreadySignedIn } from "@/components/admin/AlreadySignedIn";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/brand/LogoMark";
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
    title: "Invited accounts only",
    body: "Owners invite editors and viewers. Passwords are stored as argon2id hashes, with optional two-factor codes.",
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

// Same footprint as the card, so nothing shifts when it streams in.
function CardSkeleton() {
  return (
    <div
      role="status"
      className="rounded-panel border border-line bg-surface-solid p-6 shadow-(--shadow-lift) sm:p-9"
    >
      <span className="sr-only">Loading sign-in…</span>
      <div className="flex items-center gap-4">
        <div className="size-14 animate-pulse rounded-full bg-surface-2" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-28 animate-pulse rounded bg-surface-2" />
          <div className="h-7 w-44 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
      <div className="mt-4 mb-7 h-12 animate-pulse rounded bg-surface-2" />
      <div className="flex flex-col gap-5">
        <div className="h-[4.75rem] animate-pulse rounded-field bg-surface-2" />
        <div className="h-[4.75rem] animate-pulse rounded-field bg-surface-2" />
        <div className="mt-1 h-14 animate-pulse rounded-pill bg-surface-2" />
      </div>
    </div>
  );
}

// Reads the session, so it streams in behind the page's Suspense boundary (Cache Components
// keeps request data out of the static shell).
async function SignInCard({
  photoUrl,
  searchParams,
}: {
  photoUrl: string | null;
  searchParams: Promise<{ welcome?: string; reset?: string }>;
}) {
  // Wait for the request before the checks below, so their catch never swallows the prerender
  // signal and bakes a signed-out card into the shell.
  await connection();
  const configured = isAdminConfigured();
  // A visitor who is already signed in is sent on to the dashboard (from the client: a redirect
  // thrown mid-stream would cut the response). A database hiccup just shows the form.
  const admin = configured ? await getAdmin().catch(() => null) : null;
  const photo = await getProfilePhoto(photoUrl).catch(() => null);
  const { welcome, reset } = await searchParams;
  const notice = welcome
    ? "Your account is ready. Sign in with your new password."
    : reset
      ? "Password changed. Sign in with the new one."
      : null;

  return (
    <div className="animate-rise rounded-panel border border-line bg-surface-solid p-6 shadow-(--shadow-lift) sm:p-9">
      <div className="flex items-center gap-4">
        <Avatar photo={photo} size={56} sizes="56px" ring />
        <div className="min-w-0">
          <p className="label-mono text-muted">Admin console</p>
          <h1 className="mt-1 text-[1.75rem] leading-tight tracking-[-0.03em]">
            {admin ? "You're signed in" : configured ? "Welcome back" : "Finish the setup"}
          </h1>
        </div>
      </div>

      {admin ? (
        <div className="mt-6">
          <AlreadySignedIn email={admin.email} />
        </div>
      ) : (
        <>
          <p className="mt-4 mb-7 text-muted">
            {configured
              ? "Sign in to manage projects, notes, messages and the home-page looks."
              : "The admin area needs a database before anyone can sign in. Four steps:"}
          </p>
          {notice && configured ? (
            <p
              role="status"
              className="mb-5 flex items-start gap-3 rounded-field border border-ok/25 bg-ok/8 px-4 py-3 text-sm leading-relaxed text-ok"
            >
              <Icon name="shield" size={18} className="mt-0.5 flex-none" />
              {notice}
            </p>
          ) : null}
          {configured ? (
            <>
              <LoginForm action={login} />
              <p className="mt-5 text-center text-sm">
                <Link
                  href="/admin/login/forgot"
                  className="inline-flex min-h-11 items-center font-medium text-c1-text hover:underline"
                >
                  Forgot your password?
                </Link>
              </p>
            </>
          ) : (
            <SetupSteps />
          )}
        </>
      )}
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; reset?: string }>;
}) {
  const settings = await getSiteSettings().catch(() => DEFAULT_SITE_SETTINGS);

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

          <Suspense fallback={<CardSkeleton />}>
            <SignInCard photoUrl={settings.photoUrl} searchParams={searchParams} />
          </Suspense>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted">
            <Icon name="shield" size={16} className="flex-none" />
            Protected area, rate-limited sign-in.
          </p>
        </div>
      </section>

      {/* Brand panel, shown beside the form from large screens up. */}
      <aside
        aria-label="About the admin"
        className="relative isolate hidden overflow-hidden text-on-fill [background:var(--feature-bg)] lg:order-first lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 [background-image:radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1.4px)] [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_75%)] bg-size-[22px_22px]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-40 -bottom-48 -z-10 size-[36rem] rounded-full bg-on-fill/10 blur-3xl"
        />

        <Link href="/" className="inline-flex min-h-11 items-center gap-3 self-start font-bold">
          {/* The favicon's ink tile, so the gold Y stays visible on a gold panel. */}
          <span className="grid size-11 place-items-center rounded-xl bg-[#0b0d12] text-[#f4f1ea] [--logo-y:#c9a45c]">
            <LogoMark className="h-7" />
          </span>
          {settings.name}
          <span className="sr-only">, back to the site</span>
        </Link>

        <div className="max-w-md py-12">
          <p className="label-mono text-on-fill/90">Portfolio admin</p>
          <h2 className="mt-4 text-[clamp(2.1rem,3.2vw,3rem)] leading-[1.05] tracking-[-0.035em] text-on-fill">
            Every part of the site, edited in one place.
          </h2>
          <ul className="mt-10 flex flex-col gap-6">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="grid size-11 flex-none place-items-center rounded-xl bg-on-fill/15 ring-1 ring-on-fill/25">
                  <Icon name={feature.icon} size={19} />
                </span>
                <span>
                  <span className="block font-semibold text-on-fill">{feature.title}</span>
                  <span className="mt-0.5 block text-[0.95rem] leading-relaxed text-on-fill/90">
                    {feature.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center gap-2 text-sm text-on-fill/90">
          <Icon name="database" size={16} />
          Changes publish to the live site as soon as you save.
        </p>
      </aside>
    </main>
  );
}
