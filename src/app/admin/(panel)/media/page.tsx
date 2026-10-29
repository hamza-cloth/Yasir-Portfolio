import { InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { mediaUsage } from "@/lib/media";

import { deleteMedia } from "../../media-actions";

export const metadata = { title: "Media" };

export default async function MediaPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  const usage = await Promise.all(assets.map((asset) => mediaUsage(asset.url)));

  return (
    <>
      <AdminHeader
        title="Media library"
        description="Every uploaded file. A file still used anywhere cannot be deleted; replace or remove it where it is used first."
      />
      {assets.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          Nothing uploaded yet.
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] gap-4">
          {assets.map((asset, index) => {
            const usedBy = usage[index] ?? [];
            return (
              <li
                key={asset.id}
                className="surface flex flex-col overflow-hidden rounded-card border border-line"
              >
                {asset.contentType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an uploaded file
                  <img
                    src={asset.url}
                    alt=""
                    loading="lazy"
                    width={asset.width ?? undefined}
                    height={asset.height ?? undefined}
                    className="aspect-[4/3] w-full bg-surface-2 object-cover"
                  />
                ) : (
                  <span className="grid aspect-[4/3] place-items-center bg-surface-2 font-mono text-sm text-muted">
                    PDF
                  </span>
                )}
                <div className="flex flex-1 flex-col gap-2 p-3 text-sm">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener"
                    className="truncate font-medium hover:underline"
                  >
                    {asset.pathname}
                  </a>
                  <span className="text-xs text-muted">
                    {asset.kind} · {(asset.size / 1024).toFixed(0)} KB
                    {asset.width ? ` · ${asset.width}×${asset.height}` : ""}
                  </span>
                  <span className="text-xs text-muted">
                    {usedBy.length > 0 ? `Used by: ${usedBy.join(", ")}` : "Not used anywhere"}
                  </span>
                  <div className="mt-auto pt-1">
                    <InlineAction
                      action={deleteMedia}
                      label="Delete"
                      tone="danger"
                      disabled={usedBy.length > 0}
                      title={usedBy.length > 0 ? "In use, so it cannot be deleted" : undefined}
                      confirm="Delete this file from storage?"
                      hidden={{ id: asset.id }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
