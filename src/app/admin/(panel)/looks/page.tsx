import { AdminForm } from "@/components/admin/AdminForm";
import { AdminHeader } from "@/components/admin/AdminUi";
import { FormSection, SelectField } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/auth/session";
import { getLookConfig } from "@/lib/data/settings";
import { LOOK_LABELS, LOOK_THEMES, LOOKS } from "@/lib/look";

import { saveLooks } from "../../actions";

export const metadata = { title: "Home looks" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const MODES = [
  ["random", "Random, never the same twice in a row"],
  ["sequential", "Sequential, one after another"],
  ["fixed", "Fixed, always one look"],
] as const;

export default async function LooksPage() {
  await requireAdmin();
  const config = await getLookConfig();

  return (
    <>
      <AdminHeader
        title="Home looks"
        description="Every visit to the home page shows one of these complete looks. Choose which are on and how the next one is picked."
      />
      <AdminForm action={saveLooks}>
        <fieldset className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <legend className="sr-only">Looks</legend>
          {LOOKS.map((look) => (
            <label key={look} className="group cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                value={look}
                defaultChecked={config.enabled.includes(look)}
                className="peer sr-only"
              />
              {/* A live preview: the same tokens as the site, scoped to this card. */}
              <span
                data-look={look}
                className="flex flex-col gap-3 overflow-hidden rounded-card border-2 border-transparent bg-bg p-4 text-fg opacity-60 ring-1 ring-line transition peer-checked:border-c1 peer-checked:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-c1"
                style={{ colorScheme: LOOK_THEMES[look] }}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg leading-none">{LOOK_LABELS[look]}</span>
                  <span className="label-mono rounded-pill bg-c1-soft px-2 py-1 text-c1-text">
                    {LOOK_THEMES[look]}
                  </span>
                </span>
                <span className="surface flex flex-col gap-2 rounded-tile border border-line p-3">
                  <span className="font-display text-xl leading-tight">
                    I keep <span className="highlight">networks</span> running
                  </span>
                  <span className="text-sm text-muted">Cards, type and accent of this look.</span>
                  <span className="flex gap-2">
                    <span className="btn-accent rounded-(--r-button) px-3 py-1.5 text-xs font-semibold">
                      See my work
                    </span>
                    <span className="rounded-(--r-button) border border-line-2 bg-surface-solid px-3 py-1.5 text-xs font-semibold">
                      Contact
                    </span>
                  </span>
                </span>
                <span className="flex gap-1.5" aria-hidden="true">
                  {[
                    "bg-tint-blue",
                    "bg-tint-mint",
                    "bg-tint-peach",
                    "bg-tint-lilac",
                    "bg-tint-butter",
                  ].map((tint) => (
                    <span key={tint} className={`h-3 flex-1 rounded-full ${tint}`} />
                  ))}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <FormSection title="Choosing the next look">
          <SelectField label="Mode" name="mode" options={MODES} defaultValue={config.mode} />
          <SelectField
            label="Fixed look (used in fixed mode)"
            name="fixed"
            options={LOOKS.map((look) => [look, LOOK_LABELS[look]] as const)}
            defaultValue={config.fixed}
          />
        </FormSection>
      </AdminForm>
    </>
  );
}
