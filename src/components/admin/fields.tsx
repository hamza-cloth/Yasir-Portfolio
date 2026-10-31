import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export const inputClass =
  "w-full rounded-field border border-line-2 bg-bg/60 px-3.5 py-2.5 text-[0.95rem] text-fg placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-300 focus:border-c1/70 focus:shadow-[0_0_0_4px_var(--highlight)]";

type FieldProps = {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="label-mono text-faint">{label}</span>
      {children}
      {hint ? <span className="text-xs text-faint">{hint}</span> : null}
    </label>
  );
}

type TextProps = Omit<ComponentProps<"input">, "className"> & {
  label: string;
  hint?: string;
  className?: string;
};

export function TextField({ label, hint, className, ...props }: TextProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input className={inputClass} {...props} />
    </Field>
  );
}

type AreaProps = Omit<ComponentProps<"textarea">, "className"> & {
  label: string;
  hint?: string;
  className?: string;
};

export function TextArea({ label, hint, className, rows = 4, ...props }: AreaProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea rows={rows} className={cn(inputClass, "resize-y leading-relaxed")} {...props} />
    </Field>
  );
}

type SelectProps = Omit<ComponentProps<"select">, "className"> & {
  label: string;
  options: readonly (readonly [value: string, label: string])[];
  className?: string;
};

export function SelectField({ label, options, className, ...props }: SelectProps) {
  return (
    <Field label={label} className={className}>
      <select className={cn(inputClass, "appearance-auto")} {...props}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </Field>
  );
}

type CheckProps = Omit<ComponentProps<"input">, "className" | "type"> & {
  label: string;
};

export function CheckField({ label, ...props }: CheckProps) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-fg">
      <input type="checkbox" className="size-4 accent-(--c1)" {...props} />
      {label}
    </label>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="surface grid gap-5 rounded-card border border-line p-5 md:grid-cols-2 md:p-6">
      <legend className="sr-only">{title}</legend>
      <p className="label-mono text-c1-text md:col-span-2">{title}</p>
      {children}
    </fieldset>
  );
}

type FileProps = Omit<ComponentProps<"input">, "className" | "type"> & {
  label: string;
  hint?: string;
  className?: string;
};

export function FileField({ label, hint, className, ...props }: FileProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input
        type="file"
        className="block w-full text-sm text-muted file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-pill file:border-0 file:bg-c1-soft file:px-4 file:font-semibold file:text-c1-text"
        {...props}
      />
    </Field>
  );
}
