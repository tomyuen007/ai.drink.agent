import os
import sys
from pathlib import Path

import duckdb
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "lib"))
from data_downloader import DataDownloader  # noqa: E402

load_dotenv(ROOT / ".env")

# Lambda is read-only except /tmp; local dev stores under project root
_in_lambda  = bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
DB_PATH     = os.getenv(
    "DUCKDB_DATA_DIR",
    "/tmp/wine_liquor.duckdb" if _in_lambda else str(ROOT / "data" / "wine_liquor.duckdb"),
)
SAMPLES_DIR = os.getenv("SAMPLES_DIR", str(ROOT / "samples"))

DATASETS = {
    "iowa-liquor-sales": {
        "dataset_id": "m3tr-qhgy",
        "base_url": "https://data.iowa.gov/resource",
        "filename": "iowa.liquor.sales.csv",
    },
    "lcbo-product-catalogue": {
        "dataset_id": "w6m7-iahg",
        "base_url": "https://data.ontario.ca/resource",
        "filename": "lcbo.product.catalogue.csv",
    },
}

os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
_con = duckdb.connect(DB_PATH)

app = FastAPI(title="DuckDB REST API")


@app.get("/health")
def health():
    return {"status": "ok", "db": DB_PATH}


@app.get("/tables")
def tables():
    rows = _con.execute("SHOW TABLES").fetchall()
    return {"tables": [r[0] for r in rows]}


@app.post("/query")
async def query(request: Request):
    body = await request.json()
    sql = body.get("sql", "").strip()
    if not sql:
        return JSONResponse({"error": "sql field is required"}, status_code=400)
    try:
        cursor = _con.execute(sql)
        rows   = cursor.fetchall()
        cols   = [d[0] for d in cursor.description] if cursor.description else []
        return {"columns": cols, "data": rows, "row_count": len(rows)}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)


@app.get("/download")
def download(dataset: str, limit: int = 1000):
    if dataset not in DATASETS:
        return JSONResponse(
            {"error": f"unknown dataset '{dataset}'", "available": list(DATASETS)},
            status_code=400,
        )
    meta        = DATASETS[dataset]
    output_path = os.path.join(SAMPLES_DIR, meta["filename"])
    downloader  = DataDownloader(base_url=meta["base_url"])
    df = downloader.download(dataset_id=meta["dataset_id"], limit=limit, output_path=output_path)
    return {"dataset": dataset, "row_count": len(df), "columns": list(df.columns), "output_path": output_path}


# Lambda handler — Mangum adapts ASGI → Lambda event/context
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    handler = None  # not running in Lambda
