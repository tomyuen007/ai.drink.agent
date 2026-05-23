-- Connection (when running manually):
-- psql -h localhost -p 5432 -U postgres -d wine_liquor -f app/postgresql/init.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Schema
CREATE SCHEMA IF NOT EXISTS wine;

-- admin: full access for manual admin tasks
CREATE USER admin WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE wine_liquor TO admin;
GRANT ALL ON SCHEMA wine TO admin;
GRANT ALL ON SCHEMA public TO admin;

-- app_user_admin: owner-level access for application admin operations
CREATE USER app_user_admin WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE wine_liquor TO app_user_admin;
GRANT ALL ON SCHEMA wine TO app_user_admin;
GRANT ALL ON SCHEMA public TO app_user_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA wine GRANT ALL ON TABLES TO app_user_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user_admin;

-- app_user_rw: read/write access for application operations
CREATE USER app_user_rw WITH PASSWORD '123456';
GRANT CONNECT ON DATABASE wine_liquor TO app_user_rw;
GRANT USAGE ON SCHEMA wine TO app_user_rw;
GRANT USAGE ON SCHEMA public TO app_user_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA wine TO app_user_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA wine GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user_rw;
