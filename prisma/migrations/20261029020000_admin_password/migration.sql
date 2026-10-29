-- The admin password hash (argon2id) moves from an environment variable into the database.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- The Terminal look is removed: take it out of the enabled list and the default, and move a
-- site fixed on Terminal to Midnight Ops. No rows are deleted.
ALTER TABLE "SiteSettings" ALTER COLUMN "looksEnabled" SET DEFAULT ARRAY['porcelain', 'midnight-ops', 'sunset-fibre', 'aurora']::TEXT[];
UPDATE "SiteSettings" SET "looksEnabled" = array_remove("looksEnabled", 'terminal');
UPDATE "SiteSettings" SET "looksEnabled" = ARRAY['midnight-ops']::TEXT[] WHERE cardinality("looksEnabled") = 0;
UPDATE "SiteSettings" SET "looksFixed" = 'midnight-ops' WHERE "looksFixed" = 'terminal';
