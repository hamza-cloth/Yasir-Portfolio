Authentication answers "who are you?" Authorisation answers "what may you do?" Role-based access control (RBAC) answers the second question by giving permissions to **roles** and giving each user a role, instead of setting permissions person by person.

## Users, roles, permissions

- A **permission** is one action on one kind of thing: `ticket:view`, `ticket:delete`, `user:manage`.
- A **role** is a named set of permissions: Admin, Staff, Viewer.
- A **user** has one or more roles.

When someone changes job, you change their role. When a new feature arrives, you add its permission to the right roles once.

| Permission    | Admin | Staff    | Viewer |
| ------------- | ----- | -------- | ------ |
| View tickets  | ✓     | ✓        | ✓      |
| Create ticket | ✓     | ✓        |        |
| Edit ticket   | ✓     | own only |        |
| Delete ticket | ✓     |          |        |
| Manage users  | ✓     |          |        |

"Own only" is where RBAC meets ownership: the role allows editing, and a second check confirms the record belongs to the user.

## Check on the server, every time

Hiding a button is not security. The server must check the permission on every request, because anyone can send the request without the button.

```ts
const PERMISSIONS = {
  ADMIN: ["ticket:view", "ticket:create", "ticket:edit", "ticket:delete", "user:manage"],
  STAFF: ["ticket:view", "ticket:create", "ticket:edit"],
  VIEWER: ["ticket:view"],
} as const;

export function can(role: keyof typeof PERMISSIONS, permission: string) {
  return (PERMISSIONS[role] as readonly string[]).includes(permission);
}

// In the handler
if (!can(user.role, "ticket:delete")) {
  return new Response("Forbidden", { status: 403 });
}
```

## Principles

- **Least privilege:** give the smallest role that lets someone do their job.
- **Deny by default:** a permission that is not granted is refused.
- **Few roles:** a handful of clear roles beats dozens of near-copies.
- **Separate duties:** the person who approves a payment should not be the one who creates it.
- **Log** permission changes and denied attempts.

## 401 or 403?

- **401 Unauthorized:** not signed in, or the session is invalid. Sign in and try again.
- **403 Forbidden:** signed in, but this role may not do this.

## When it goes wrong

- **A user can see a page but every action fails:** the page checks one permission and the API another. Use one shared `can()` function.
- **Everyone ends up Admin:** roles were too narrow, so people were promoted to get work done. Add the missing permission to the right role instead.
