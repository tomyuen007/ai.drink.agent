import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()


class PostgreSQLClient:
    def __init__(
        self,
        host: str = None,
        port: int = None,
        dbname: str = None,
        user: str = None,
        password: str = None,
        schema: str = "wine",
    ):
        self.host = host or os.getenv("POSTGRES_HOST", "localhost")
        self.port = int(port or os.getenv("POSTGRES_PORT", "5432"))
        self.dbname = dbname or os.getenv("POSTGRES_DB", "wine_liquor")
        self.user = user or os.getenv("POSTGRES_USER", "postgres")
        self.password = password or os.getenv("POSTGRES_PASSWORD", "")
        self.schema = schema
        self._conn = None

    def connect(self) -> "PostgreSQLClient":
        self._conn = psycopg2.connect(
            host=self.host,
            port=self.port,
            dbname=self.dbname,
            user=self.user,
            password=self.password,
            options=f"-c search_path={self.schema},public",
        )
        return self

    def disconnect(self):
        if self._conn:
            self._conn.close()
            self._conn = None

    def __enter__(self) -> "PostgreSQLClient":
        return self.connect()

    def __exit__(self, *_):
        self.disconnect()

    def execute(self, sql: str, params=None):
        with self._conn.cursor() as cur:
            cur.execute(sql, params)
        self._conn.commit()

    def fetchall(self, sql: str, params=None) -> list[dict]:
        with self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return [dict(r) for r in cur.fetchall()]

    def fetchone(self, sql: str, params=None) -> dict | None:
        with self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            return dict(row) if row else None

    def tables(self, schema: str = None) -> list[str]:
        rows = self.fetchall(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = %s ORDER BY table_name",
            (schema or self.schema,),
        )
        return [r["table_name"] for r in rows]

    def __repr__(self) -> str:
        return f"PostgreSQLClient(host={self.host!r}, port={self.port}, dbname={self.dbname!r}, user={self.user!r})"
