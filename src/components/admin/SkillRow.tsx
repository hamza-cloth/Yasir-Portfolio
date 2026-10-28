"use client";

import { useActionState } from "react";

import { useKeepValuesSubmit } from "@/hooks/useKeepValuesSubmit";
import { cn } from "@/lib/cn";

import type { FormResult } from "./AdminForm";
import { inputClass } from "./fields";

type SkillRowProps = {
  skill: {
    id: string;
    name: string;
    layer: number | null;
    domain: string | null;
    published: boolean;
  };
  domains: readonly (readonly [string, string])[];
  save: (previous: FormResult, formData: FormData) => Promise<FormResult>;
  remove: (formData: FormData) => Promise<void>;
};

const compact = cn(inputClass, "py-2 text-sm");

export function SkillRow({ skill, domains, save, remove }: SkillRowProps) {
  const [state, action, pending] = useActionState(save, {});
  const onSubmit = useKeepValuesSubmit(action);

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_5rem_minmax(0,1fr)_auto_auto]">
      <form id={`skill-${skill.id}`} action={action} onSubmit={onSubmit} className="contents">
        <input
          aria-label="Name"
          name="name"
          defaultValue={skill.name}
          className={compact}
          required
        />
        <select
          aria-label="OSI layer"
          name="layer"
          defaultValue={skill.layer ?? ""}
          className={cn(compact, "max-md:hidden")}
        >
          <option value="">–</option>
          {[7, 6, 5, 4, 3, 2, 1].map((layer) => (
            <option key={layer} value={layer}>
              L{layer}
            </option>
          ))}
        </select>
        <select
          aria-label="Domain"
          name="domain"
          defaultValue={skill.domain ?? ""}
          className={cn(compact, "max-md:hidden")}
        >
          <option value="">No domain</option>
          {domains.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input type="hidden" name="published" value={skill.published ? "on" : ""} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-9 items-center rounded-pill border border-line-2 px-3 text-sm text-muted hover:text-fg"
        >
          {pending ? "…" : state.error ? "Retry" : state.ok ? "Saved" : "Save"}
        </button>
      </form>
      <form
        action={remove}
        onSubmit={(event) => {
          if (!window.confirm(`Delete “${skill.name}”?`)) event.preventDefault();
        }}
        className="max-md:col-span-2 max-md:justify-self-end"
      >
        <input type="hidden" name="id" value={skill.id} />
        <button
          type="submit"
          className="inline-flex min-h-9 items-center px-2 text-sm text-red/80 hover:text-red"
        >
          Delete
        </button>
      </form>
      {state.error ? <p className="col-span-full text-sm text-red">{state.error}</p> : null}
    </li>
  );
}
