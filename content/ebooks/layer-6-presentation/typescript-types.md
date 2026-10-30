TypeScript is JavaScript with types. You describe the shape of your data, and the compiler checks every use of it before the code runs: misspelled fields, missing arguments and values that might be `undefined` are caught while you type, not by a user.

## Describing data

```ts
type TicketStatus = "open" | "in_progress" | "closed";

type Ticket = {
  id: number;
  title: string;
  status: TicketStatus;
  assignee?: string;
};

function close(ticket: Ticket): Ticket {
  return { ...ticket, status: "closed" };
}

close({ id: 1, title: "VPN down", status: "done" });
// Error: Type '"done"' is not assignable to type 'TicketStatus'.
```

- A **union** of strings (`"open" | "closed"`) is clearer and safer than a free string.
- `?` marks an optional field; TypeScript then makes you handle the missing case.

## Narrowing

TypeScript follows your checks and narrows the type inside each branch:

```ts
type Result = { ok: true; data: Ticket } | { ok: false; error: string };

function show(result: Result) {
  if (result.ok) {
    console.log(result.data.title);
  } else {
    console.error(result.error);
  }
}
```

This pattern, a **discriminated union**, makes impossible states impossible to write.

## Types disappear at runtime

The compiler checks the code, then **erases** every type. The JavaScript that runs has none. So TypeScript cannot check data that arrives while the program runs: an API response, a form post, a file.

```ts
const ticket = (await res.json()) as Ticket; // a promise, not a check
```

That `as` only tells the compiler to trust you. Validate outside data with a schema instead, and let the schema produce the type:

```ts
import { z } from "zod";

const TicketSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(["open", "in_progress", "closed"]),
});

type Ticket = z.infer<typeof TicketSchema>;
const ticket = TicketSchema.parse(await res.json());
```

## Settings worth turning on

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

`strict` turns on null checks and much more. Run `tsc --noEmit` in CI so type errors fail the build.

## When it goes wrong

- **Types say it's a string, runtime says undefined:** the data came from outside and was cast with `as`, not validated.
- **`any` everywhere:** each `any` switches checking off. Use `unknown` and narrow it.
