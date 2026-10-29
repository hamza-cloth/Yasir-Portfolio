import { AdminForm } from "@/components/admin/AdminForm";
import { AdminHeader } from "@/components/admin/AdminUi";
import { CheckField, FormSection, TextArea, TextField } from "@/components/admin/fields";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { formatPairs } from "@/lib/admin/form-data";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/settings";
import { getProfilePhoto } from "@/lib/profile-photo";

import { saveSettings } from "../../actions";
import { removePhoto, uploadPhoto } from "../../media-actions";

export const metadata = { title: "Profile & settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();
  const photo = await getProfilePhoto(settings.photoUrl);

  return (
    <>
      <AdminHeader
        title="Profile & settings"
        description="Your name, contact details and the About page story. Saving updates the live site."
      />
      <section
        aria-labelledby="photo-title"
        className="surface mb-6 flex flex-col gap-5 rounded-card border border-line p-5 md:p-6"
      >
        <h2 id="photo-title" className="label-mono text-c1-text">
          Profile photo
        </h2>
        <PhotoUploader photo={photo} upload={uploadPhoto} remove={removePhoto} />
      </section>

      <AdminForm action={saveSettings}>
        <FormSection title="Identity">
          <TextField label="Name" name="name" defaultValue={settings.name} required />
          <TextField label="Location" name="location" defaultValue={settings.location} required />
          <TextField
            label="Role line"
            name="roleLine"
            defaultValue={settings.roleLine}
            className="md:col-span-2"
            hint="Shown under your name: “Software & Network Engineer · CCNA-trained · India”."
            required
          />
          <div className="flex items-end md:col-span-2">
            <CheckField
              label="Open to work (shows the green dot and badge)"
              name="openToWork"
              defaultChecked={settings.openToWork}
            />
          </div>
          <TextField
            label="Availability"
            name="availability"
            defaultValue={settings.availability}
            className="md:col-span-2"
            required
          />
        </FormSection>

        <FormSection title="Contact & profiles">
          <TextField
            label="Public email"
            name="email"
            type="email"
            defaultValue={settings.email}
            required
          />
          <TextField
            label="LinkedIn URL"
            name="linkedinUrl"
            type="url"
            defaultValue={settings.linkedinUrl ?? ""}
            placeholder="https://www.linkedin.com/in/…"
          />
          <TextField
            label="GitHub URL"
            name="githubUrl"
            type="url"
            defaultValue={settings.githubUrl ?? ""}
            placeholder="https://github.com/…"
          />
        </FormSection>

        <FormSection title="About page">
          <TextArea
            label="Story"
            name="aboutStory"
            rows={9}
            defaultValue={settings.aboutStory}
            className="md:col-span-2"
            hint="Markdown. Paragraphs are separated by a blank line; the first one is the headline."
            required
          />
          <TextArea
            label="Principles"
            name="principles"
            rows={5}
            defaultValue={formatPairs(settings.principles)}
            className="md:col-span-2"
            hint="One per line: Title :: Body"
          />
          <TextArea
            label="Now"
            name="nowItems"
            rows={4}
            defaultValue={settings.nowItems.join("\n")}
            className="md:col-span-2"
            hint="One item per line. Saving stamps today as the “updated” date."
          />
        </FormSection>
      </AdminForm>
    </>
  );
}
