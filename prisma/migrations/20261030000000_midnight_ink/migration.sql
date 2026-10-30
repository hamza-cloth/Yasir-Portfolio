-- Midnight Ink becomes the brand look: offered first, and the look every visit opens on.
-- AlterTable
ALTER TABLE "SiteSettings" ALTER COLUMN "looksEnabled" SET DEFAULT ARRAY['midnight-ink', 'porcelain', 'midnight-ops', 'sunset-fibre', 'aurora']::TEXT[],
ALTER COLUMN "looksFixed" SET DEFAULT 'midnight-ink',
ALTER COLUMN "looksMode" SET DEFAULT 'fixed';

-- Existing settings: put Midnight Ink at the front of the enabled list (once) and make it fixed.
UPDATE "SiteSettings"
SET "looksEnabled" = array_prepend('midnight-ink', array_remove(COALESCE("looksEnabled", ARRAY[]::TEXT[]), 'midnight-ink')),
    "looksMode" = 'fixed',
    "looksFixed" = 'midnight-ink';
