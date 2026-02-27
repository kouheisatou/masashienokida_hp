-- CreateTable
CREATE TABLE "blog_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- Seed default categories
INSERT INTO "blog_categories" ("name", "slug", "sort_order") VALUES
  ('お知らせ',           'news',     1),
  ('コンサートのご案内',  'concert',  2),
  ('日常',              'daily',     3),
  ('練習・レッスン',     'practice',  4),
  ('旅',               'travel',    5),
  ('YouTube',          'youtube',   6),
  ('メディア',          'media',     7);

-- Add category_id column to blog_posts
ALTER TABLE "blog_posts" ADD COLUMN "category_id" UUID;

-- Migrate existing data: match category text to blog_categories.name
UPDATE "blog_posts" bp
SET "category_id" = bc."id"
FROM "blog_categories" bc
WHERE bp."category" = bc."name";

-- Drop old category column and index
DROP INDEX IF EXISTS "idx_blog_category";
ALTER TABLE "blog_posts" DROP COLUMN "category";

-- CreateIndex on new column
CREATE INDEX "idx_blog_category_id" ON "blog_posts"("category_id");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
