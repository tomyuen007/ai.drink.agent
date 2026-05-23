-- Connection (when running manually):
-- mysql -h 127.0.0.1 -P 3306 -u root -p < app/mysql/init.sql

USE wine_liquor;

-- admin: full access for manual admin tasks
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON wine_liquor.* TO 'admin'@'%';

-- app_user_admin: owner-level access for application admin operations
CREATE USER IF NOT EXISTS 'app_user_admin'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON wine_liquor.* TO 'app_user_admin'@'%';

-- app_user_rw: read/write access for application operations
CREATE USER IF NOT EXISTS 'app_user_rw'@'%' IDENTIFIED BY '123456';
GRANT SELECT, INSERT, UPDATE, DELETE ON wine_liquor.* TO 'app_user_rw'@'%';

FLUSH PRIVILEGES;
