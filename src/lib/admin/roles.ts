// Who may do what in the admin. Checked on the server by adminContext() for every action and
// by each page; the shell only uses it to hide controls a role cannot use.
export const ROLES = ["OWNER", "EDITOR", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

// view: read every admin page. edit: change content, messages, leads. manage: users, security,
// site-wide settings, backups, emptying the trash.
export type Permission = "view" | "edit" | "manage";

const GRANTS: Record<Role, readonly Permission[]> = {
  OWNER: ["view", "edit", "manage"],
  EDITOR: ["view", "edit"],
  VIEWER: ["view"],
};

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function can(role: string, permission: Permission): boolean {
  return isRole(role) && GRANTS[role].includes(permission);
}
