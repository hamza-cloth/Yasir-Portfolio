-- Every refresh shows a new look: random becomes the default and the current setting. The admin
-- can still pick fixed or sequential under Looks.
-- AlterTable
ALTER TABLE "SiteSettings" ALTER COLUMN "looksMode" SET DEFAULT 'random';

UPDATE "SiteSettings" SET "looksMode" = 'random' WHERE "looksMode" = 'fixed';
