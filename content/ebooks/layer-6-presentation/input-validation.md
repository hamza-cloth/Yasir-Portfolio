Every piece of data that comes from outside your server, form fields, query strings, JSON bodies, headers, uploaded files, must be treated as untrusted until it is checked. Input validation is that check, and it belongs **on the server**.

## Two checks, two purposes

- **In the browser:** `required`, `type="email"`, `maxlength`. These give instant feedback and save a round trip. They are for the user's convenience.
- **On the server:** a schema that every request must pass. This is the one that protects the system, because anyone can skip the browser and send a request directly.

## Validate with a schema

Describe what valid data looks like, and reject everything else:

```ts
import { z } from "zod";

const messageSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(160),
  topic: z.enum(["job", "project", "other"]),
  body: z.string().trim().min(20).max(4000),
});

export async function sendMessage(formData: FormData) {
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.message.create({ data: parsed.data });
}
```

After parsing, `parsed.data` has exactly the fields you allowed, trimmed and typed. Extra fields are dropped, so nobody can sneak `isAdmin: true` into the record.

## Principles

- **Allow-list, don't block-list:** say what is allowed (an enum, a pattern, a length) rather than trying to list every bad input.
- **Check type, length, format and range.** Cap every string; an unlimited text field is an invitation.
- **Validate files by content**, not by name or the browser's MIME type: check the first bytes (the file signature) and the size.
- **Return useful errors** per field, without echoing internals.

## Validation is not the whole defence

Validation decides whether data is acceptable. You still need the right defence where the data is **used**:

| Risk              | Defence where it is used                               |
| ----------------- | ------------------------------------------------------ |
| SQL injection     | Parameterised queries or an ORM, never string-building |
| XSS               | Escape on output; React does this unless you bypass it |
| Path traversal    | Never build file paths from user input                 |
| Command injection | Never pass input to a shell                            |

## When it goes wrong

- **A field that "can't be empty" is empty in the database:** only the browser checked it.
- **A 500 error on odd input:** the server parsed without validating and crashed on the unexpected shape. It should have been a 400.
