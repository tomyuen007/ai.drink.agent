FROM python:3.12-slim

WORKDIR /app

COPY duckdb/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source maintaining structure so ROOT-relative lib/ imports work
COPY lib/ lib/
COPY duckdb/ duckdb/

VOLUME ["/data"]
EXPOSE 8000

# Run from duckdb/ so "api" module is importable directly
WORKDIR /app/duckdb
CMD ["python", "app.py"]
