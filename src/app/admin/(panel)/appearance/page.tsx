import {
  saveAnnouncement,
  saveAppearance,
  saveMaintenance,
  saveSections,
} from "@/app/admin/system-actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminHeader } from "@/components/admin/AdminUi";
import {
  CheckField,
  FormSection,
  SelectField,
  TextArea,
  TextField,
} from "@/components/admin/fields";
import { pageAdmin } from "@/lib/admin/guard";
import { getSiteConfig } from "@/lib/data/site-config";
import { HOME_SECTIONS } from "@/lib/site-config";

export const metadata = { title: "Appearance" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function AppearancePage() {
  await pageAdmin("manage");
  const [appearance, announcement, maintenance, sections] = await Promise.all([
    getSiteConfig("appearance"),
    getSiteConfig("announcement"),
    getSiteConfig("maintenance"),
    getSiteConfig("sections"),
  ]);
  // Visible sections in their saved order, then the hidden ones in their default order.
  const ordered = [
    ...sections.home.map((id) => HOME_SECTIONS.find((section) => section.id === id)!),
    ...HOME_SECTIONS.filter((section) => !sections.home.includes(section.id)),
  ];

  return (
    <>
      <AdminHeader
        title="Appearance"
        description="Site-wide switches. Each form saves on its own and the live site updates at once. The home-page looks are under Home looks."
      />
      <div className="flex flex-col gap-8">
        <AdminForm action={saveAnnouncement}>
          <FormSection title="Announcement bar">
            <div className="md:col-span-2">
              <CheckField
                label="Show the bar above the header on every page"
                name="enabled"
                defaultChecked={announcement.enabled}
              />
            </div>
            <TextField
              label="Text"
              name="text"
              maxLength={160}
              defaultValue={announcement.text}
              placeholder="Taking on two new projects in December."
            />
            <TextField
              label="Link (optional)"
              name="href"
              defaultValue={announcement.href}
              placeholder="/hire or https://…"
              hint="A path on this site or a full https:// address."
            />
          </FormSection>
        </AdminForm>

        <AdminForm action={saveAppearance}>
          <FormSection title="Background and motion">
            <div className="md:col-span-2">
              <CheckField
                label="Show the dot globe behind the hero photo"
                name="watermark"
                defaultChecked={appearance.watermark}
              />
            </div>
            <TextField
              label="Globe strength (%)"
              name="watermarkOpacity"
              type="number"
              min={10}
              max={100}
              defaultValue={appearance.watermarkOpacity}
              hint="10 is barely there, 100 is bold. Default 50."
            />
            <SelectField
              label="Motion"
              name="motion"
              defaultValue={appearance.motion}
              options={[
                ["full", "Full: custom cursor and smooth scrolling"],
                ["calm", "Calm: no custom cursor or smooth scrolling"],
              ]}
            />
          </FormSection>
        </AdminForm>

        <AdminForm action={saveSections} submitLabel="Save sections">
          <FormSection title="Home-page sections">
            <p className="text-sm text-muted md:col-span-2">
              Untick to hide a section; lower numbers show first. The hero always comes first, and
              Testimonials appear only once at least one is approved.
            </p>
            <ol className="flex flex-col divide-y divide-line md:col-span-2">
              {ordered.map((section, index) => (
                <li
                  key={section.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-2"
                >
                  <CheckField
                    label={section.label}
                    name={`visible-${section.id}`}
                    defaultChecked={sections.home.includes(section.id)}
                  />
                  <label className="flex items-center gap-2 text-sm text-muted">
                    Order
                    <input
                      type="number"
                      name={`order-${section.id}`}
                      min={0}
                      max={99}
                      defaultValue={index + 1}
                      className="w-20 rounded-field border border-line-2 bg-bg/60 px-3 py-2 text-fg"
                    />
                  </label>
                </li>
              ))}
            </ol>
          </FormSection>
        </AdminForm>

        <AdminForm action={saveMaintenance}>
          <FormSection title="Maintenance mode">
            <div className="md:col-span-2">
              <CheckField
                label="Show a maintenance page to visitors (signed-in admins still see the site)"
                name="enabled"
                defaultChecked={maintenance.enabled}
              />
            </div>
            <TextArea
              label="Message"
              name="message"
              rows={3}
              maxLength={400}
              defaultValue={maintenance.message}
              className="md:col-span-2"
            />
          </FormSection>
        </AdminForm>
      </div>
    </>
  );
}
