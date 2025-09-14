-- Drop unused tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS "analytics" CASCADE;
DROP TABLE IF EXISTS "links" CASCADE;
DROP TABLE IF EXISTS "profiles" CASCADE;
DROP TABLE IF EXISTS "themes" CASCADE;