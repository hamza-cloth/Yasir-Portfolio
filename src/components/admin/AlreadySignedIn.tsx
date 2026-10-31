"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

// Shown on the sign-in page to someone who already has a session. It moves on to the dashboard
// by itself; the link covers the moment before that, and browsers without JavaScript.
export function AlreadySignedIn({ email }: { email: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex flex-col gap-5">
      <p role="status" className="flex items-start gap-3 text-muted">
        <Icon name="shield" size={18} className="mt-0.5 flex-none text-ok" />
        <span>
          You are signed in as <span className="font-semibold text-fg">{email}</span>. Opening the
          dashboard…
        </span>
      </p>
      <Link href="/admin" replace className={cn(buttonClassName("accent", "lg"), "w-full")}>
        Open the dashboard
        <Icon name="arrow-right" size={18} />
      </Link>
    </div>
  );
}
