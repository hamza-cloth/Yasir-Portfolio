import { Suspense, type ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { getSiteSettings } from "@/lib/data/settings";
import { getProfilePhoto } from "@/lib/profile-photo";

import { logout } from "../actions";

function PanelLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-64 animate-pulse rounded-field bg-surface-2" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-card bg-surface-2" />
        <div className="h-24 animate-pulse rounded-card bg-surface-2" />
        <div className="h-24 animate-pulse rounded-card bg-surface-2" />
      </div>
      <div className="h-56 animate-pulse rounded-card bg-surface-2" />
    </div>
  );
}

// The shell is cached and static; each page checks the session itself inside the boundary.
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const photo = await getProfilePhoto(settings.photoUrl);

  return (
    <AdminShell photo={photo}>
      <Suspense fallback={<PanelLoading />}>{children}</Suspense>
      <form action={logout} className="mt-12 border-t border-line pt-6">
        <button type="submit" className="min-h-11 text-sm text-muted hover:text-red">
          Sign out
        </button>
      </form>
    </AdminShell>
  );
}
