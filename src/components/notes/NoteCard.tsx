import Link from "next/link";

import { Card } from "@/components/ui/Card";
import type { NoteSummary } from "@/lib/content/types";

export function NoteCard({ note }: { note: NoteSummary }) {
  return (
    <Card as="article" interactive className="flex h-full flex-col gap-4">
      <ul className="flex flex-wrap gap-2" aria-label="Tags">
        {note.tags.map((tag) => (
          <li key={tag} className="label-mono text-c1-text">
            #{tag}
          </li>
        ))}
      </ul>
      <h3 className="text-[clamp(1.25rem,2vw,1.55rem)] leading-tight">
        {/* The link covers the whole card; only the title is announced as the link text. */}
        <Link
          href={`/notes/${note.slug}`}
          data-cursor="Read"
          className="after:absolute after:inset-0 after:rounded-card after:content-['']"
        >
          {note.title}
        </Link>
      </h3>
      <p className="text-muted">{note.excerpt}</p>
      <p className="label-mono mt-auto text-muted">{note.readingMinutes} min read</p>
    </Card>
  );
}
