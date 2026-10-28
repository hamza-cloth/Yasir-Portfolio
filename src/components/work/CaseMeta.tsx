import { GlassPanel } from "@/components/ui/GlassPanel";
import { Tag } from "@/components/ui/Tag";
import type { ProjectDetail } from "@/lib/content/types";
import { statusTone } from "@/lib/project-status";

const STACK_PREVIEW = 3;

// Up to four cards; any field without data is left out rather than shown empty.
export function CaseMeta({ project }: { project: ProjectDetail }) {
  const stack =
    project.stack.length > STACK_PREVIEW
      ? `${project.stack.slice(0, STACK_PREVIEW).join(", ")} +${project.stack.length - STACK_PREVIEW}`
      : project.stack.join(", ");

  const cards = [
    project.role ? { label: "Role", value: project.role } : null,
    project.type ? { label: "Type", value: project.type } : null,
    stack ? { label: "Stack", value: stack } : null,
  ].filter((card): card is { label: string; value: string } => card !== null);

  return (
    <dl className="mt-4 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <GlassPanel key={card.label} className="flex flex-col gap-2 rounded-card p-5">
          <dt className="label-mono text-muted">{card.label}</dt>
          <dd className="text-fg">{card.value}</dd>
        </GlassPanel>
      ))}
      <GlassPanel className="flex flex-col items-start gap-2 rounded-card p-5">
        <dt className="label-mono text-muted">Status</dt>
        <dd>
          <Tag tone={statusTone(project.statusLabel)}>{project.statusLabel}</Tag>
        </dd>
      </GlassPanel>
    </dl>
  );
}
