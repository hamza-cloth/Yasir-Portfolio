JSON (JavaScript Object Notation) is the text format that almost every web API sends and receives. It is small, readable by people and supported by every language. It also has strict rules, and most "invalid JSON" errors come from forgetting one of them.

## Six types of value

```json
{
  "id": 42,
  "name": "Asha",
  "active": true,
  "manager": null,
  "roles": ["staff", "support"],
  "address": { "city": "Noida", "pin": "201301" }
}
```

| Type    | Example              |
| ------- | -------------------- |
| string  | `"Asha"`             |
| number  | `42`, `3.14`, `-1e3` |
| boolean | `true`, `false`      |
| null    | `null`               |
| array   | `["a", "b"]`         |
| object  | `{ "key": "value" }` |

There is no date type. Send dates as ISO 8601 strings, `"2026-10-30T12:00:00Z"`, and parse them deliberately.

## The rules people break

- Keys must be **double-quoted** strings: `{ "id": 1 }`, not `{ id: 1 }`.
- Strings use **double quotes** only.
- **No trailing commas** after the last item.
- **No comments.**
- No `undefined`, `NaN` or `Infinity`.

## Reading and writing it

```ts
const data = JSON.parse(text);
const text = JSON.stringify(data, null, 2);
```

`JSON.parse` throws on invalid input, so wrap it when the input comes from outside. And remember that a successful parse only proves the text is JSON, not that it has the fields you expect. Validate the shape next.

On the command line, `jq` formats and queries JSON:

```bash
curl -s https://api.example.com/tickets | jq '.[] | {id, status}'
```

## Numbers have limits

JavaScript stores numbers as 64-bit floats, so integers above 2^53 lose precision. Send large IDs, such as database bigints and money in paise, as strings.

## When it goes wrong

- **"Unexpected token < in JSON":** the server sent an HTML error page, not JSON. Check the status code and the response body.
- **"Unexpected end of JSON input":** the body was empty, often a 204 or a failed request.
- **IDs change by one at the end:** precision loss on a large number.
- **Garbled names:** the body was not sent or read as UTF-8.
