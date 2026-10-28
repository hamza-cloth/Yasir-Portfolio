import type { TimelineEntry } from "@/lib/timeline";

type InterfaceTableProps = {
  entries: TimelineEntry[];
};

// The record as router interfaces: one interface per role, course or degree.
export function InterfaceTable({ entries }: InterfaceTableProps) {
  return (
    <div className="glass overflow-hidden rounded-card">
      <p className="border-b border-line px-5 py-3 font-mono text-[0.85rem] text-c1-text">
        yasir@r1# show ip interface brief
      </p>
      <div className="overflow-x-auto" role="region" aria-label="Interface table" tabIndex={0}>
        <table className="w-full min-w-[640px] border-collapse font-mono text-[0.85rem]">
          <thead>
            <tr className="text-left text-muted">
              <th scope="col" className="px-5 py-3 font-medium">
                Interface
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Type
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id} className="border-t border-line">
                <td className="px-5 py-3 whitespace-nowrap text-fg">Gi0/{index + 1}</td>
                <td className="px-5 py-3 whitespace-nowrap text-c1-text">{entry.kind}</td>
                <td className="px-5 py-3 text-muted">
                  {entry.detail ? `${entry.heading} · ${entry.detail}` : entry.heading}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
