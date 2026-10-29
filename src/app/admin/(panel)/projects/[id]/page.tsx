import { notFound } from "next/navigation";

import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import {
  CheckField,
  Field,
  FileField,
  FormSection,
  SelectField,
  TextArea,
  TextField,
} from "@/components/admin/fields";
import { ProjectCategory, ProjectVisual } from "@/generated/prisma/enums";
import { formatPairs } from "@/lib/admin/form-data";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { decisionsSchema } from "@/lib/validation/project";

import { deleteProject, saveProject } from "../../../actions";
import { uploadCover } from "../../../media-actions";

export const metadata = { title: "Edit project" };

const VISUALS = [
  [ProjectVisual.CLINIC_CONSOLE, "Clinic console"],
  [ProjectVisual.STOREFRONT, "Storefront + delivery"],
  [ProjectVisual.SEAT_MAP, "Seat map"],
] as const;

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  PRODUCT: "Product",
  WEB: "Web",
  NETWORKING: "Networking",
};

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { id } = await params;
  const isNew = id === "new";
  const project = isNew ? null : await db.project.findUnique({ where: { id } });
  if (!isNew && !project) notFound();

  const decisions = decisionsSchema.safeParse(project?.decisions ?? []);

  return (
    <>
      <AdminHeader
        title={project ? project.title : "New project"}
        back={{ href: "/admin/projects", label: "Projects" }}
      />
      <AdminForm
        action={saveProject.bind(null, project?.id ?? null)}
        submitLabel={isNew ? "Create project" : "Save project"}
      >
        <FormSection title="Basics">
          <TextField label="Title" name="title" defaultValue={project?.title} required />
          <TextField
            label="Slug"
            name="slug"
            defaultValue={project?.slug}
            hint="The URL: /work/your-slug"
            required
          />
          <TextField
            label="Tagline"
            name="tagline"
            defaultValue={project?.tagline}
            className="md:col-span-2"
            required
          />
          <TextArea
            label="Summary"
            name="summary"
            defaultValue={project?.summary}
            className="md:col-span-2"
            rows={3}
            required
          />
          <TextField
            label="Status"
            name="statusLabel"
            list="project-statuses"
            defaultValue={project?.statusLabel}
            hint="Pick one or type your own wording."
            required
          />
          <datalist id="project-statuses">
            <option value="In development" />
            <option value="In development (MVP)" />
            <option value="Working build" />
            <option value="Live" />
          </datalist>
          <SelectField
            label="Mockup"
            name="visual"
            options={VISUALS}
            defaultValue={project?.visual ?? ProjectVisual.CLINIC_CONSOLE}
          />
          <TextField label="Your role" name="role" defaultValue={project?.role ?? ""} />
          <TextField label="Type" name="type" defaultValue={project?.type ?? ""} />
          <Field label="Categories" className="md:col-span-2">
            <span className="flex flex-wrap gap-4">
              {Object.values(ProjectCategory).map((category) => (
                <CheckField
                  key={category}
                  name="categories"
                  value={category}
                  label={CATEGORY_LABELS[category]}
                  defaultChecked={project?.categories.includes(category) ?? false}
                />
              ))}
            </span>
          </Field>
        </FormSection>

        <FormSection title="Case study">
          <TextArea
            label="Overview"
            name="overview"
            defaultValue={project?.overview}
            rows={8}
            className="md:col-span-2"
            hint="Markdown."
            required
          />
          <TextArea
            label="Decisions"
            name="decisions"
            defaultValue={decisions.success ? formatPairs(decisions.data) : ""}
            rows={5}
            className="md:col-span-2"
            hint="One per line: Title :: Body"
          />
          <TextArea
            label="Stack"
            name="stack"
            defaultValue={project?.stack.join("\n")}
            rows={4}
            className="md:col-span-2"
            hint="One per line, or separated by commas."
          />
        </FormSection>

        <FormSection title="Publishing">
          <TextField
            label="Order"
            name="order"
            type="number"
            min={0}
            defaultValue={project?.order ?? 0}
            hint="Lower numbers come first."
          />
          <div className="flex items-end">
            <CheckField
              label="Published on the site"
              name="published"
              defaultChecked={project?.published ?? true}
            />
          </div>
        </FormSection>
      </AdminForm>

      {project ? (
        <section aria-labelledby="cover-title" className="mt-10 flex flex-col gap-4">
          <h2 id="cover-title" className="text-lg tracking-[-0.02em]">
            Cover image
          </h2>
          {project.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file
            <img
              src={project.coverImageUrl}
              alt={`Current cover for ${project.title}`}
              className="max-h-56 w-auto rounded-card border border-line object-cover"
            />
          ) : (
            <p className="text-sm text-muted">No cover yet; the site shows the drawn mockup.</p>
          )}
          <AdminForm action={uploadCover.bind(null, project.id)} submitLabel="Upload cover">
            <FileField
              label="Image"
              name="cover"
              accept="image/jpeg,image/png,image/webp"
              hint="JPG, PNG or WebP, up to 2 MB. Saved as WebP, at most 1600px wide."
              required
            />
          </AdminForm>
        </section>
      ) : null}

      {project ? (
        <div className="mt-10 flex items-center justify-between gap-4 rounded-card border border-red/25 p-5">
          <p className="text-sm text-muted">Deleting a project removes its case study page.</p>
          <InlineAction
            action={deleteProject}
            label="Delete project"
            tone="danger"
            confirm={`Delete “${project.title}” for good?`}
            hidden={{ id: project.id }}
          />
        </div>
      ) : null}
    </>
  );
}
