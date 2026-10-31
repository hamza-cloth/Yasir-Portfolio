import type { ReactNode } from "react";

import {
  changePassword,
  confirmTwoFactor,
  disableTwoFactor,
  inviteUser,
  regenerateBackupCodes,
  removeUser,
  revokeInvite,
  revokeOtherSessions,
  revokeSession,
  saveNotificationPrefs,
  setUserRole,
  startTwoFactorSetup,
} from "@/app/admin/system-actions";
import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { CheckField, FormSection, inputClass, TextField } from "@/components/admin/fields";
import { InviteForm } from "@/components/admin/InviteForm";
import { TwoFactorPanel } from "@/components/admin/TwoFactorPanel";
import { describeDevice } from "@/lib/admin/device";
import { dateTime } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can, isRole, ROLE_LABELS, ROLES } from "@/lib/admin/roles";
import { isTwoFactorAvailable } from "@/lib/auth/totp";
import { cn } from "@/lib/cn";
import { getSiteConfig } from "@/lib/data/site-config";
import { getDb } from "@/lib/db";

export const metadata = { title: "Users & security" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="surface flex flex-col gap-4 rounded-card border border-line p-5 md:p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function SecurityPage() {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const isOwner = can(admin.role, "manage");
  const [me, sessions, logins, users, invites, prefs] = await Promise.all([
    db.user.findUnique({
      where: { id: admin.id },
      select: { totpEnabled: true, backupCodes: true },
    }),
    db.session.findMany({
      where: { expires: { gt: new Date() }, ...(isOwner ? {} : { userId: admin.id }) },
      orderBy: { lastSeenAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
    db.loginEvent.findMany({
      where: isOwner ? {} : { email: admin.email },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    isOwner
      ? db.user.findMany({
          where: { passwordHash: { not: null } },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            totpEnabled: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
    isOwner
      ? db.invite.findMany({ where: { acceptedAt: null }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    getSiteConfig("notifications"),
  ]);

  return (
    <>
      <AdminHeader
        title="Users & security"
        description={`Signed in as ${admin.email} (${isRole(admin.role) ? ROLE_LABELS[admin.role] : admin.role}).`}
      />
      <div className="flex flex-col gap-6">
        <Section
          title="Two-factor sign-in"
          description="A code from your phone on top of the password."
        >
          <TwoFactorPanel
            enabled={Boolean(me?.totpEnabled)}
            available={isTwoFactorAvailable()}
            backupCodesLeft={me?.backupCodes.length ?? 0}
            start={startTwoFactorSetup}
            confirm={confirmTwoFactor}
            regenerate={regenerateBackupCodes}
            disable={disableTwoFactor}
          />
        </Section>

        <AdminForm action={changePassword} submitLabel="Change password">
          <FormSection title="Password">
            <TextField
              label="Current password"
              name="current"
              type="password"
              autoComplete="current-password"
              required
            />
            <span className="hidden md:block" />
            <TextField
              label="New password"
              name="next"
              type="password"
              autoComplete="new-password"
              minLength={12}
              hint="At least 12 characters. Other devices are signed out."
              required
            />
            <TextField
              label="Repeat the new password"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </FormSection>
        </AdminForm>

        <Section
          title="Signed-in devices"
          description={
            isOwner
              ? "Every admin's active sessions. Sessions last 7 days."
              : "Your active sessions. Sessions last 7 days."
          }
        >
          <ul className="divide-y divide-line">
            {sessions.map((session) => {
              const current = session.sessionToken === admin.sessionHash;
              return (
                <li
                  key={session.sessionToken}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-fg">
                      {describeDevice(session.userAgent)}
                      {current ? (
                        <span className="label-mono ml-2 text-ok">this device</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-faint">
                      {isOwner ? `${session.user.email} · ` : ""}
                      Signed in {dateTime.format(session.createdAt)}
                      {session.lastSeenAt
                        ? ` · last seen ${dateTime.format(session.lastSeenAt)}`
                        : ""}
                    </p>
                  </div>
                  {!current ? (
                    <InlineAction
                      action={revokeSession}
                      hidden={{ token: session.sessionToken }}
                      label="Sign out"
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
          {sessions.some(
            (session) => session.userId === admin.id && session.sessionToken !== admin.sessionHash,
          ) ? (
            <div>
              <InlineAction
                action={revokeOtherSessions}
                label="Sign out my other devices"
                tone="danger"
                confirm="Sign out every other device signed in to your account?"
              />
            </div>
          ) : null}
        </Section>

        <Section
          title="Sign-in history"
          description="The latest 25 attempts. IP addresses are stored only as salted hashes."
        >
          {logins.length === 0 ? (
            <p className="text-sm text-muted">No sign-ins recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="label-mono text-faint">
                  <tr>
                    <th className="py-2 pr-4 font-normal">When</th>
                    {isOwner ? <th className="py-2 pr-4 font-normal">Email</th> : null}
                    <th className="py-2 pr-4 font-normal">Device</th>
                    <th className="py-2 font-normal">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {logins.map((event) => (
                    <tr key={event.id}>
                      <td className="py-2 pr-4 whitespace-nowrap text-muted">
                        {dateTime.format(event.createdAt)}
                      </td>
                      {isOwner ? (
                        <td className="py-2 pr-4 [overflow-wrap:anywhere]">{event.email}</td>
                      ) : null}
                      <td className="py-2 pr-4 text-muted">{describeDevice(event.userAgent)}</td>
                      <td className={cn("py-2", event.success ? "text-ok" : "text-red")}>
                        {event.success ? "Signed in" : (event.reason ?? "Failed")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {isOwner ? (
          <>
            <Section
              title="Admin users"
              description="Owners manage everything; editors change content, messages and leads; viewers only read."
            >
              <ul className="divide-y divide-line">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium [overflow-wrap:anywhere] text-fg">
                        {user.name ? `${user.name} · ` : ""}
                        {user.email}
                        {user.id === admin.id ? (
                          <span className="label-mono ml-2 text-ok">you</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-faint">
                        Since {dateTime.format(user.createdAt)} · two-factor{" "}
                        {user.totpEnabled ? "on" : "off"}
                      </p>
                    </div>
                    {user.id === admin.id ? (
                      <span className="label-mono text-muted">
                        {isRole(user.role) ? ROLE_LABELS[user.role] : user.role}
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <form action={setUserRole} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={user.id} />
                          <label className="sr-only" htmlFor={`role-${user.id}`}>
                            Role for {user.email}
                          </label>
                          <select
                            id={`role-${user.id}`}
                            name="role"
                            defaultValue={user.role}
                            className={cn(inputClass, "w-auto appearance-auto py-2")}
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-3.5 text-sm text-muted hover:text-fg"
                          >
                            Change
                          </button>
                        </form>
                        <InlineAction
                          action={removeUser}
                          hidden={{ id: user.id }}
                          label="Remove"
                          tone="danger"
                          confirm={`Remove ${user.email} from the admin? They are signed out at once.`}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Invite someone" description="The link works once, for 7 days.">
              <InviteForm action={inviteUser} />
              {invites.length > 0 ? (
                <ul className="divide-y divide-line border-t border-line">
                  {invites.map((invite) => (
                    <li
                      key={invite.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <p className="text-sm">
                        <span className="text-fg">{invite.email}</span>{" "}
                        <span className="text-muted">
                          · {isRole(invite.role) ? ROLE_LABELS[invite.role] : invite.role} ·{" "}
                          {invite.expires < new Date()
                            ? "expired"
                            : `expires ${dateTime.format(invite.expires)}`}
                        </span>
                      </p>
                      <InlineAction
                        action={revokeInvite}
                        hidden={{ id: invite.id }}
                        label="Cancel invite"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </Section>

            <AdminForm action={saveNotificationPrefs}>
              <FormSection title="Email alerts">
                <CheckField
                  label="Email me when a new lead comes in"
                  name="emailOnLead"
                  defaultChecked={prefs.emailOnLead}
                />
                <CheckField
                  label="Email me when a contact message arrives"
                  name="emailOnMessage"
                  defaultChecked={prefs.emailOnMessage}
                />
              </FormSection>
            </AdminForm>
          </>
        ) : null}
      </div>
    </>
  );
}
