-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "looksEnabled" TEXT[] DEFAULT ARRAY['porcelain', 'midnight-ops', 'sunset-fibre', 'terminal', 'aurora']::TEXT[],
ADD COLUMN     "looksFixed" TEXT NOT NULL DEFAULT 'porcelain',
ADD COLUMN     "looksMode" TEXT NOT NULL DEFAULT 'random';
