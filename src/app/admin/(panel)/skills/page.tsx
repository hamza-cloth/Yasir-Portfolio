import { AdminForm } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { FormSection, SelectField, TextField } from "@/components/admin/fields";
import { SkillRow } from "@/components/admin/SkillRow";
import { SkillDomain } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { SKILL_DOMAINS } from "@/lib/skill-domains";

import { addSkill, deleteSkill, updateSkill } from "../../actions";

export const metadata = { title: "Skills" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const DOMAINS = Object.values(SkillDomain).map(
  (domain) => [domain, SKILL_DOMAINS[domain].title] as const,
);

const LAYERS = [
  ["", "No layer"],
  ...[7, 6, 5, 4, 3, 2, 1].map((layer) => [String(layer), `L${layer}`] as const),
] as const;

export default async function SkillsAdminPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const skills = await db.skill.findMany({
    orderBy: [{ layer: "desc" }, { order: "asc" }],
    select: { id: true, name: true, layer: true, domain: true, published: true },
  });

  return (
    <>
      <AdminHeader
        title="Skills"
        description={`${skills.length} skills. The OSI layer sorts them on the Skills page; the domain groups them on the résumé.`}
      />

      <AdminForm action={addSkill} submitLabel="Add skill" className="mb-8">
        <FormSection title="Add a skill">
          <TextField label="Name" name="name" required className="md:col-span-2" />
          <SelectField label="OSI layer" name="layer" options={LAYERS} defaultValue="7" />
          <SelectField label="Domain" name="domain" options={[["", "No domain"], ...DOMAINS]} />
        </FormSection>
      </AdminForm>

      <ul className="surface divide-y divide-line rounded-card border border-line">
        {skills.map((skill) => (
          <SkillRow
            key={skill.id}
            skill={skill}
            domains={DOMAINS}
            save={updateSkill.bind(null, skill.id)}
            remove={deleteSkill}
          />
        ))}
      </ul>
    </>
  );
}
