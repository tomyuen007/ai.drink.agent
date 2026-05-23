-- Connection (when running manually):
-- sqlplus sys/<ORACLE_PASSWORD>@//localhost:1521/XE AS SYSDBA @app/oracle/init.sql

CONNECT / AS SYSDBA

-- Disable password complexity so '123456' is accepted in dev
ALTER PROFILE DEFAULT LIMIT PASSWORD_VERIFY_FUNCTION NULL;

-- admin: full access for manual admin tasks
CREATE USER admin IDENTIFIED BY "123456";
GRANT CONNECT, RESOURCE, DBA TO admin;
GRANT UNLIMITED TABLESPACE TO admin;

-- app_user_admin: owner-level access for application admin operations
CREATE USER app_user_admin IDENTIFIED BY "123456";
GRANT CONNECT, RESOURCE, DBA TO app_user_admin;
GRANT UNLIMITED TABLESPACE TO app_user_admin;

-- app_user_rw: read/write access for application operations
CREATE USER app_user_rw IDENTIFIED BY "123456";
GRANT CONNECT TO app_user_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ANY TABLE TO app_user_rw;
