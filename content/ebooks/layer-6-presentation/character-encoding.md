Computers store bytes, not letters. A character encoding is the rule that turns one into the other. Today that rule should almost always be **UTF-8**, and most garbled text is two programs disagreeing about it.

## Characters, code points, bytes

- **Unicode** gives every character a number, its **code point**: `A` is U+0041, `é` is U+00E9, `₹` is U+20B9.
- **UTF-8** decides how each code point is written as bytes.

| Character | Code point | UTF-8 bytes | Bytes |
| --------- | ---------- | ----------- | ----- |
| A         | U+0041     | 41          | 1     |
| é         | U+00E9     | C3 A9       | 2     |
| ₹         | U+20B9     | E2 82 B9    | 3     |
| 😀        | U+1F600    | F0 9F 98 80 | 4     |

Plain English text is identical in ASCII and UTF-8, which is why the problem hides until a name with an accent, a rupee sign or an emoji appears.

## How UTF-8 is built

The first byte says how long the character is:

- `0xxxxxxx`: one byte (ASCII)
- `110xxxxx`: start of a 2-byte character
- `1110xxxx`: start of a 3-byte character
- `11110xxx`: start of a 4-byte character
- `10xxxxxx`: a continuation byte

## Mojibake: reading the symptoms

When UTF-8 bytes are read as Windows-1252 (or Latin-1), each multi-byte character turns into several wrong ones:

| You see | It was   | What happened                  |
| ------- | -------- | ------------------------------ |
| `Ã©`    | `é`      | UTF-8 read as Windows-1252     |
| `â‚¹`   | `₹`      | Same mistake, 3-byte character |
| `�`     | anything | Bytes that are not valid UTF-8 |

## Say UTF-8 everywhere

```html
<meta charset="utf-8" />
```

```text
Content-Type: application/json; charset=utf-8
```

```sql
CREATE DATABASE app ENCODING 'UTF8';
```

Also: save source files as UTF-8, and in MySQL use `utf8mb4`, because its older `utf8` cannot store emoji.

## Length is not what it seems

```ts
"₹".length; // 1 (UTF-16 code units)
"😀".length; // 2
new TextEncoder().encode("₹").length; // 3 bytes
```

When a database column or an API limits length, know whether it counts bytes, code units or characters.

## When it goes wrong

- **CSV opens garbled in Excel:** save it as "UTF-8 with BOM", or import it and choose UTF-8.
- **Names fine on screen, broken in email:** the email was sent without a UTF-8 charset header.
- **Text cut off mid-character:** something truncated by bytes and split a multi-byte character.
