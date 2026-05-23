-- Connection (when running manually):
-- sqlcmd -S localhost,1433 -U sa -P <SA_PASSWORD> -i app/mssql/init.sql

-- Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'wine_liquor')
    CREATE DATABASE wine_liquor;
GO

USE wine_liquor;
GO

-- Schema
IF NOT EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'wine')
    EXEC('CREATE SCHEMA wine');
GO

-- admin: full access for manual admin tasks
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'admin')
    CREATE LOGIN admin WITH PASSWORD = '123456';
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'admin')
BEGIN
    CREATE USER admin FOR LOGIN admin;
    EXEC sp_addrolemember 'db_owner', 'admin';
END
GO

-- app_user_admin: owner-level access for application admin operations
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'app_user_admin')
    CREATE LOGIN app_user_admin WITH PASSWORD = '123456';
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'app_user_admin')
BEGIN
    CREATE USER app_user_admin FOR LOGIN app_user_admin;
    EXEC sp_addrolemember 'db_owner', 'app_user_admin';
END
GO

-- app_user_rw: read/write access for application operations
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'app_user_rw')
    CREATE LOGIN app_user_rw WITH PASSWORD = '123456';
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'app_user_rw')
BEGIN
    CREATE USER app_user_rw FOR LOGIN app_user_rw;
    EXEC sp_addrolemember 'db_datareader', 'app_user_rw';
    EXEC sp_addrolemember 'db_datawriter', 'app_user_rw';
END
GO
