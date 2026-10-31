import Link from "next/link";

import { resetPricing, savePricing } from "@/app/admin/system-actions";
import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader } from "@/components/admin/AdminUi";
import { FormSection } from "@/components/admin/fields";
import { CATEGORIES, FEATURE_GROUPS, FEATURES, PRICING, PROJECT_TYPES } from "@/config/pricing";
import { pageAdmin } from "@/lib/admin/guard";
import { getPriceTable } from "@/lib/data/pricing";
import { DEFAULT_PRICES, formatInr } from "@/lib/estimate";

export const metadata = { title: "Pricing" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

function PriceInput({
  name,
  label,
  value,
  fallback,
}: {
  name: string;
  label: string;
  value: number;
  fallback: number;
}) {
  const changed = value !== fallback;
  return (
    <label className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
      <span className="min-w-0 flex-1 text-sm text-fg">
        {label}
        {changed ? (
          <span className="ml-2 font-mono text-xs text-faint">default {formatInr(fallback)}</span>
        ) : null}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-sm text-muted">₹</span>
        <input
          type="number"
          name={name}
          min={0}
          step={500}
          defaultValue={value}
          className={`w-32 rounded-field border bg-bg/60 px-3 py-2 text-right font-mono text-sm text-fg ${changed ? "border-c1" : "border-line-2"}`}
        />
      </span>
    </label>
  );
}

export default async function PricingPage() {
  await pageAdmin("manage");
  const prices = await getPriceTable();
  const overridden =
    Object.entries(prices.base).filter(([id, value]) => DEFAULT_PRICES.base[id] !== value).length +
    Object.entries(prices.feature).filter(([id, value]) => DEFAULT_PRICES.feature[id] !== value)
      .length +
    (prices.cap === DEFAULT_PRICES.cap ? 0 : 1);

  return (
    <>
      <AdminHeader
        title="Pricing"
        description={`The prices behind the project planner at /estimate. Visitors never see these numbers until their report, where the total is shown as a range (×${PRICING.rangeLow} to ×${PRICING.rangeHigh}) after the platform, design, scale and delivery factors.`}
        action={{ href: "/estimate", label: "Open the planner" }}
      />
      <AdminForm action={savePricing} submitLabel="Save prices">
        <FormSection title="Launch pricing">
          <p className="text-sm text-muted md:col-span-2">
            No estimate goes above this amount: bigger builds keep their full scope and timeline,
            and the report shows the price held at this ceiling. Set 0 to remove it.
          </p>
          <PriceInput
            name="price-cap"
            label="Maximum estimate"
            value={prices.cap}
            fallback={DEFAULT_PRICES.cap}
          />
        </FormSection>
        <FormSection title="Base price per project type">
          <p className="text-sm text-muted md:col-span-2">
            The starting price of each type, before features. A changed price has a gold border.
          </p>
          {CATEGORIES.map((category) => {
            const types = PROJECT_TYPES.filter((type) => type.category === category.id);
            if (types.length === 0) return null;
            return (
              <div key={category.id} className="flex flex-col">
                <p className="label-mono mb-1 text-faint">{category.label}</p>
                <div className="divide-y divide-line">
                  {types.map((type) => (
                    <PriceInput
                      key={type.id}
                      name={`base-${type.id}`}
                      label={type.label}
                      value={prices.base[type.id] ?? type.base}
                      fallback={type.base}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </FormSection>
        <FormSection title="Price per feature and extra service">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.id} className="flex flex-col">
              <p className="label-mono mb-1 text-faint">{group.label}</p>
              <div className="divide-y divide-line">
                {FEATURES.filter((feature) => feature.group === group.id).map((feature) => (
                  <PriceInput
                    key={feature.id}
                    name={`feature-${feature.id}`}
                    label={feature.label}
                    value={prices.feature[feature.id] ?? feature.price}
                    fallback={feature.price}
                  />
                ))}
              </div>
            </div>
          ))}
        </FormSection>
      </AdminForm>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        {overridden > 0 ? (
          <InlineAction
            action={resetPricing}
            label={`Reset ${overridden} changed ${overridden === 1 ? "price" : "prices"} to the defaults`}
            tone="danger"
            confirm="Put every price back to the default?"
          />
        ) : (
          <p className="text-sm text-muted">Every price is at its default.</p>
        )}
        <Link href="/admin/estimates" className="text-sm text-c1-text hover:underline">
          Saved estimates
        </Link>
      </div>
    </>
  );
}
