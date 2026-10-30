Next.js is a framework for building React apps with a server. Pages are rendered on the server, with their data, and sent as HTML that appears immediately. Only the parts that need to be interactive ship JavaScript to the browser.

## Routing from folders

In the App Router, folders under `app/` are URLs:

```text
app/
  layout.tsx            shared shell for every page
  page.tsx              /
  notes/
    page.tsx            /notes
    [slug]/
      page.tsx          /notes/subnetting-without-the-headache
```

A `[slug]` folder is a dynamic segment; its value arrives in `params`.

## Server components by default

Components in `app/` run on the server unless marked otherwise. They can read the database directly and never send that code to the browser.

```tsx
export default async function NotesPage() {
  const notes = await db.note.findMany({ where: { published: true } });
  return (
    <ul>
      {notes.map((note) => (
        <li key={note.slug}>{note.title}</li>
      ))}
    </ul>
  );
}
```

## Client components for interaction

Anything that needs state, effects or browser events gets `"use client"` at the top of its file:

```tsx
"use client";

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? "Liked" : "Like"}</button>;
}
```

A server component can render a client component, passing serialisable props. Keep client components small and near the leaves, so most of the page stays server-rendered.

## Streaming

With `<Suspense>`, the server sends the page shell at once and streams slower sections in as their data arrives. The user reads the top of the page while the rest loads.

## Changing data

Server actions let a form call a server function directly:

```tsx
async function save(formData: FormData) {
  "use server";
  // validate, write to the database, then revalidate the cached page
}

<form action={save}>…</form>;
```

## Caching and rendering

Pages whose data does not change per request can be prerendered at build time and served instantly; pages that depend on the request are rendered on demand. Each major version has refined how this is configured, so check the docs for the version you run.

## When it goes wrong

- **"Hydration failed":** the server and browser rendered different HTML, often from dates, random numbers or `window` checks during render.
- **"useState only works in client components":** add `"use client"` to that file, or move the interactive part into a small client component.
- **A secret appears in the browser bundle:** only variables prefixed `NEXT_PUBLIC_` should ever reach client code.
