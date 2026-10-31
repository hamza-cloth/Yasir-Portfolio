REST is a style for designing web APIs around **resources**. Each resource has a URL, the HTTP method says what to do with it, and the status code says what happened. When an API follows these conventions, developers can guess how it works before reading the docs.

## Nouns in the URL, verbs in the method

| Method | URL         | Meaning                  | Success |
| ------ | ----------- | ------------------------ | ------- |
| GET    | /tickets    | List tickets             | 200     |
| POST   | /tickets    | Create a ticket          | 201     |
| GET    | /tickets/42 | Read ticket 42           | 200     |
| PATCH  | /tickets/42 | Change some fields       | 200     |
| PUT    | /tickets/42 | Replace the whole ticket | 200     |
| DELETE | /tickets/42 | Delete it                | 204     |

Avoid verbs in paths such as `/getTickets` or `/deleteTicket?id=42`. Nested resources show relationships: `/tickets/42/comments`.

## Status codes that matter

| Code | Meaning                                      |
| ---- | -------------------------------------------- |
| 200  | OK                                           |
| 201  | Created; include a `Location` header         |
| 204  | Done, no body                                |
| 400  | The request is malformed or fails validation |
| 401  | Not authenticated                            |
| 403  | Authenticated, but not allowed               |
| 404  | No such resource (or not yours to see)       |
| 409  | Conflict, such as a duplicate                |
| 422  | Understood, but the data is invalid          |
| 429  | Too many requests; slow down                 |
| 500  | Server error: a bug, not the client's fault  |

## Safe and idempotent

- **GET** must never change anything. Crawlers and prefetchers will call it.
- **PUT** and **DELETE** are idempotent: sending the same request twice leaves the same result.
- **POST** is not. If a client might retry, accept an `Idempotency-Key` header so a double click does not create two orders.

## Consistent responses

```json
{
  "data": [{ "id": 42, "title": "VPN down", "status": "open" }],
  "page": { "next": "/tickets?cursor=eyJpZCI6NDJ9" }
}
```

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Title is required",
    "fields": { "title": "Required" }
  }
}
```

- Paginate lists; never return an unbounded table.
- Filter and sort with query parameters: `/tickets?status=open&sort=-createdAt`.
- Version the API (`/v1/…`) before the first breaking change, not after.

## Testing from the command line

```bash
curl -s https://api.example.com/v1/tickets/42 -H "Authorization: Bearer $TOKEN"
curl -s -X POST https://api.example.com/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Printer offline","priority":"normal"}'
```

## When it goes wrong

- **Every error is a 200 with `"success": false`:** clients and monitoring cannot tell failures apart. Use real status codes.
- **CORS errors in the browser only:** the API must send `Access-Control-Allow-Origin` for the site calling it.
