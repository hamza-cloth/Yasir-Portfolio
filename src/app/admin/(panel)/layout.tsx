import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { getSiteSettings } from "@/lib/data/settings";
import { getProfilePhoto } from "@/lib/profile-photo";

import { logout } from "../actions";

// The shell is cached and static; each page checks the session itself, inside the boundary that
// loading.tsx puts around every page (so switching sections shows a skeleton at once).
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const photo = await getProfilePhoto(settings.photoUrl);

  return (
    <AdminShell photo={photo}>
      {children}
      <form action={logout} className="mt-12 border-t border-line pt-6">
        <button type="submit" className="min-h-11 text-sm text-muted hover:text-red">
          Sign out
        </button>
      </form>
    </AdminShell>
  );
}
