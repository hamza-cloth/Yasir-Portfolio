import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

// Admin pages read the session cookie on every request, so they are allowed to block.
export const instant = false;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-svh">{children}</div>;
}
