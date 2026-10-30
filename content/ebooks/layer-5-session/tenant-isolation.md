A multi-tenant app serves many customers, the tenants, from one codebase and usually one database. Clinic A and Clinic B both use the same system. **Tenant isolation** is the guarantee that A can never read, change or even detect B's data, whatever URL or ID they send.

## Ways to separate tenants

| Model               | How                                  | Trade-off                                  |
| ------------------- | ------------------------------------ | ------------------------------------------ |
| Shared tables       | A `tenant_id` column on every row    | Cheapest; isolation depends on every query |
| Schema per tenant   | One schema each in the same database | Stronger; harder to migrate                |
| Database per tenant | Separate databases                   | Strongest; most expensive to run           |

Most apps start with shared tables. That makes the next rule non-negotiable.

## Every query is scoped

The tenant comes from the **signed-in session**, never from the request body, query string or a header the client controls.

```ts
// Wrong: trusts the ID alone
await db.patient.findUnique({ where: { id } });

// Right: the record must also belong to the caller's tenant
await db.patient.findFirst({ where: { id, tenantId: session.tenantId } });
```

If the record belongs to another tenant, the query finds nothing and the API returns **404**, not 403. A 403 would confirm that the record exists.

## Make the safe path the easy path

Relying on every developer to remember `tenantId` on every query will fail eventually. Add a layer that does it for them:

- A data-access helper or repository that always adds the tenant filter.
- An ORM extension or middleware that injects `tenantId` into every query.
- **PostgreSQL row-level security**, so the database itself refuses rows from other tenants:

```sql
ALTER TABLE patient ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_only ON patient
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

## Beyond the database

- **Files:** prefix storage paths with the tenant ID and check it before serving.
- **Caches:** include the tenant in every cache key, or one clinic may see another's cached page.
- **Background jobs:** carry the tenant ID with the job and scope everything the job touches.
- **Logs and exports:** never mix tenants in one export.

## Test it on purpose

Write tests that sign in as tenant A and request B's records by ID, through every endpoint. Each one must return nothing. Run them on every change.

## When it goes wrong

- **A tenant sees another's name in a dropdown:** a lookup query forgot the filter.
- **A report shows totals across all clinics:** an aggregate query ran without the tenant scope.
