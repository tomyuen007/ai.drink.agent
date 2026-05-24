import os
import uvicorn
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

if __name__ == "__main__":
    port = int(os.getenv("DUCKDB_PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=False)
