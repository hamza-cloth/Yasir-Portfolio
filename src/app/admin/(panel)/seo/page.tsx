import { AdminForm } from "@/components/admin/AdminForm";
import { AdminHeader } from "@/components/admin/AdminUi";
import { CheckField, FileField, FormSection, TextArea, TextField } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/auth/session";
import { getSeoSettings } from "@/lib/data/settings";
import { SEO_PAGES } from "@/lib/seo-pages";

import { saveSeo, uploadOgImage } from "../../media-actions";

export const metadata = { title: "SEO & settings" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function SeoPage() {
  await requireAdmin();
  const seo = await getSeoSettings();

  return (
    <>
      <AdminHeader
        title="SEO & settings"
        description="Override page titles and descriptions, set the social share image, and control indexing. Leave a field empty to use the page's built-in text."
      />

      <AdminForm action={saveSeo} className="mb-10">
        <FormSection title="Search engines">
          <CheckField
            label="Allow search engines to index the site"
            name="indexable"
            defaultChecked={seo.indexable}
          />
          <CheckField label="Publish sitemap.xml" name="sitemap" defaultChecked={seo.sitemap} />
        </FormSection>
        {SEO_PAGES.map((page) => (
          <FormSection key={page.path} title={`${page.label} · ${page.path}`}>
            <TextField
              label="Title"
              name={`seo[${page.path}][title]`}
              defaultValue={seo.pages[page.path]?.title ?? ""}
              maxLength={70}
              hint="Up to 70 characters."
            />
            <TextArea
              label="Description"
              name={`seo[${page.path}][description]`}
              defaultValue={seo.pages[page.path]?.description ?? ""}
              maxLength={170}
              rows={2}
              hint="Up to 170 characters."
            />
          </FormSection>
        ))}
      </AdminForm>

      <section aria-labelledby="og-title" className="flex flex-col gap-4">
        <h2 id="og-title" className="text-lg tracking-[-0.02em]">
          Social share image
        </h2>
        {seo.ogImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file
          <img
            src={seo.ogImageUrl}
            alt="Current share image"
            className="max-h-48 w-auto rounded-card border border-line"
          />
        ) : (
          <p className="text-sm text-muted">
            None uploaded: links show a generated card with your photo, name and role.
          </p>
        )}
        <AdminForm action={uploadOgImage} submitLabel="Upload share image">
          <FileField
            label="Image (1200×630 works best)"
            name="og"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </AdminForm>
      </section>
    </>
  );
}
