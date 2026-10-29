// Shown inside the admin shell while a section loads, including on every sidebar navigation.
export default function PanelLoading() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <span className="sr-only">Loading…</span>
      <div className="h-10 w-64 animate-pulse rounded-field bg-surface-2" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-card bg-surface-2" />
        <div className="h-24 animate-pulse rounded-card bg-surface-2" />
        <div className="h-24 animate-pulse rounded-card bg-surface-2" />
      </div>
      <div className="h-56 animate-pulse rounded-card bg-surface-2" />
    </div>
  );
}
