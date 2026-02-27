-- Add sort_order column to biography
ALTER TABLE "biography" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;
