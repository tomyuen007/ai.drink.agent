# Wine & Liquor AI Agent Project

## Project Goal
Build a data cleaning pipeline + customer chatbot using Claude LLM, MCP, RAG, and a local PostgreSQL database.

---

## Two Core Objectives

### 1. Data Cleaning Pipeline
Use **Cowork + Claude** as an AI agent to:
- Ingest messy wine/liquor CSV datasets
- Identify and fix data quality issues (duplicates, nulls, inconsistent naming, formatting)
- Save cleaned data to a **local PostgreSQL database**

### 2. Customer Chatbot
Use **Claude + MCP + RAG** to:
- Answer customer inquiries about wine and liquor products
- Query the cleaned PostgreSQL database via MCP
- Use RAG for semantic product knowledge retrieval

---

## Target Dataset

### Iowa Liquor Sales
- **Source:** https://data.iowa.gov/Sales-Distribution/Iowa-Liquor-Sales/m3tr-qhgy
- **Why:** Real government transactional data — millions of rows, naturally messy
- **Known issues:** Inconsistent store names, product description variations, null prices, duplicate UPC codes, formatting inconsistencies across vendor names
- **Format:** CSV (very large), also available via Socrata API


---

## Proposed Architecture

```
Messy CSV/Excel Dataset
        ↓
Cowork + Claude (Data Cleaning Agent)
  - Detect schema issues
  - Normalize product/vendor names
  - Deduplicate records
  - Fill or flag nulls
        ↓
Clean Data → Local PostgreSQL Database
        ↓
MCP Server (exposes PostgreSQL tools to Claude)
        ↓
RAG Layer (embeddings on product/wine descriptions)
  - Vector DB (Chroma / FAISS / pgvector)
        ↓
Customer Chatbot (Claude LLM)
  - Answers product questions
  - Queries PostgreSQL via MCP
  - Retrieves context via RAG
```

---

## Folder Structure

```
wine.liquor/
├── lib/        # Shared Python library code (LLM client, data downloader, DB, generators)
├── server/     # Python only — Weather agent FastAPI server (port 8001)
├── duckdb/     # Python only — DuckDB REST API FastAPI server (port 8000)
├── rag/        # Python only — RAG layer (embeddings, vector store, retrieval)
├── mcp/        # Python only — MCP server (exposes tools to Claude)
├── agent/      # Python only — data cleaning and orchestration agents
├── ui/         # Expo (React Native) app — iOS, Android, Web
├── scripts/    # All shell scripts (.sh)
├── samples/    # Downloaded sample datasets (gitignored)
├── docker/     # Docker service configs (PostgreSQL, DuckDB, Firebase, etc.)
└── docker-compose.yml
```

**Conventions:**
- Shared Python library files go in `lib/`
- FastAPI servers go in `server/` — **Python only**
- `rag/`, `mcp/`, and `agent/` are **Python only** — no TypeScript or shell scripts
- `ui/` is **Expo (React Native) only** — all frontend code uses Expo; no plain HTML/CSS/JS
- All shell scripts go in `scripts/`
- All downloaded sample data goes in `samples/`
- All generated PDFs go in `docs/pdfs/` (gitignored)

---

## Tech Stack (To Be Decided)

| Component | Options |
|-----------|---------|
| LLM (production) | Claude API (claude-sonnet-4-6) |
| LLM (dev/testing) | Ollama (local, free) |
| LLM switching | `.env` file — `LLM_PROVIDER=claude` or `ollama` |
| Agent Framework | Claude MCP + Cowork |
| Database | PostgreSQL 16 + pgvector (local) |
| MCP Server | Custom Python MCP server |
| Vector DB | Chroma, FAISS, or pgvector |
| RAG Framework | LangChain or custom |
| Chatbot Interface | **Expo (React Native)** — iOS, Android, Web (in `ui/`) |
| Backend Language | Python (in `lib/`, `server/`, `duckdb/`) |
| Frontend Language | **Expo / React Native TypeScript** (in `ui/`) — no plain HTML/CSS |

---

## Two Distinct Claude Roles

### Role 1: Data Cleaning Agent
- Reads dirty CSV data
- Identifies schema and data quality issues
- Normalizes, deduplicates, and repairs records
- Writes clean data to PostgreSQL

### Role 2: Customer Chatbot
- Accepts natural language customer questions
- Uses MCP to query PostgreSQL for product/inventory data
- Uses RAG to retrieve relevant wine/liquor descriptions
- Returns accurate, grounded answers

---

## Key Learning Areas

1. **AI Agents** — Claude making multi-step decisions with tools
2. **MCP (Model Context Protocol)** — connecting Claude to external tools (PostgreSQL, file system, APIs)
3. **RAG (Retrieval-Augmented Generation)** — embedding wine descriptions into a vector store, retrieving relevant chunks at query time
4. **Cowork** — using Claude's desktop automation tool for data pipeline orchestration

---

## Open Questions / Next Steps

- [ ] Choose vector DB (Chroma recommended for local dev simplicity)
- [ ] Choose RAG framework (LangChain vs custom)
- [ ] Design PostgreSQL schema for cleaned wine/liquor data
- [ ] Build custom MCP server in Python to expose PostgreSQL
- [ ] Decide chatbot interface (web app, API endpoint, etc.)
- [ ] Download Iowa Liquor Sales dataset and profile its messiness
- [ ] Set up local PostgreSQL (Docker recommended for easy local dev)
- [ ] Install Ollama and pull a model for local dev testing
- [ ] Test llm_client.py switching between Claude and Ollama

---

## API & Tooling

- **Anthropic API Key:** stored as `ANTHROPIC_API_KEY` environment variable
- **Model:** `claude-sonnet-4-6`
- **API Tier:** Tier 2 (unlocked at $40 cumulative credit purchase)
- **Credits:** prepaid, expire 1 year from purchase date

### Quick API Test
```python
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY automatically

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.content[0].text)
```

---

## LLM Provider Switching

The project uses a unified `llm_client.py` wrapper that switches between Claude API and local Ollama based on `.env` settings. **No code changes needed to switch providers.**

### Strategy
- **Daily dev/iteration** → Ollama (free, local, no API credits burned)
- **Final testing + production** → Claude API (full quality)

### .env file
```env
# Switch between "claude" or "ollama"
LLM_PROVIDER=claude

# Claude settings
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6

# Ollama settings
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### llm_client.py — unified wrapper
```python
import os
from dotenv import load_dotenv
import anthropic
import requests

load_dotenv()

PROVIDER = os.getenv("LLM_PROVIDER", "ollama")

def chat(prompt: str, system: str = None) -> str:
    if PROVIDER == "claude":
        return _claude_chat(prompt, system)
    elif PROVIDER == "ollama":
        return _ollama_chat(prompt, system)
    else:
        raise ValueError(f"Unknown provider: {PROVIDER}")

def _claude_chat(prompt: str, system: str = None) -> str:
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env
    kwargs = {
        "model": os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"),
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        kwargs["system"] = system
    response = client.messages.create(**kwargs)
    return response.content[0].text

def _ollama_chat(prompt: str, system: str = None) -> str:
    payload = {
        "model": os.getenv("OLLAMA_MODEL", "llama3.2"),
        "prompt": prompt,
        "stream": False,
    }
    if system:
        payload["system"] = system
    response = requests.post(
        f"{os.getenv('OLLAMA_BASE_URL')}/api/generate",
        json=payload
    )
    return response.json()["response"]
```

### Usage in project code (never changes regardless of provider)
```python
from llm_client import chat

result = chat(
    prompt="Clean this wine record: Chardonnay, napa, 2019, $45.00",
    system="You are a data cleaning agent for wine records."
)
print(result)
```

### Install dependencies
```cmd
pip install anthropic python-dotenv requests
```

### Ollama setup (Windows)
```cmd
winget install Ollama.Ollama
ollama pull llama3.2
ollama run llama3.2
```

### API key isolation strategy
- **Claude CLI** → authenticates via `claude login` (uses Claude Pro subscription)
- **Project code** → reads `ANTHROPIC_API_KEY` from `.env` file (uses prepaid API credits)
- **ANTHROPIC_API_KEY is NOT set as a Windows system/user environment variable** — only lives in `.env` to prevent Claude CLI from accidentally consuming API credits

---

## Database Init — How Automatic Connection Works

Each database image handles connection automatically before running init scripts in `/docker-entrypoint-initdb.d/`:

| Database | Image | How it connects |
|---|---|---|
| PostgreSQL | `pgvector/pgvector:pg16` | Built-in entrypoint starts server, waits until ready, runs each `.sql` file via `psql` as `postgres` superuser connected to `POSTGRES_DB` |
| MySQL | `mysql:8.0` | Built-in entrypoint starts server, waits until ready, runs each `.sql` file via `mysql` as `root` using `MYSQL_ROOT_PASSWORD` |
| Oracle | `gvenzl/oracle-xe:21-slim` | Built-in entrypoint starts Oracle, waits until healthy, runs each `.sql` file via `sqlplus` connected as SYSDBA |
| MSSQL | `mcr.microsoft.com/mssql/server:2022-latest` | **No built-in init support** — requires custom `docker/mssql/entrypoint.sh` to poll readiness and run `sqlcmd` manually |

PostgreSQL, MySQL, and Oracle init scripts need no connection statement — the connection is already open when they run. MSSQL needed a custom entrypoint to replicate the same behaviour.

### Database Users

Each database is provisioned with three users:

| User | Access | Purpose |
|---|---|---|
| `admin` | Full (all privileges) | Manual admin tasks |
| `app_user_admin` | Full owner-level | Application admin operations |
| `app_user_rw` | SELECT, INSERT, UPDATE, DELETE | Application read/write operations |

---

## Docker Volume Management

All services use named Docker volumes for persistent data. Volumes survive container restarts but can be wiped when needed.

### Wipe a single service (e.g. LocalStack)
```bash
docker compose --profile localstack down && docker volume rm wine_liquor_localstack_data
```

### Wipe all volumes for a profile
```bash
# WARNING: removes all named volumes for every service in the compose file
docker compose --profile localstack down -v
```

### Volume reference

| Service | Volume name | Persists |
|---|---|---|
| localstack | `wine_liquor_localstack_data` | S3 buckets, DynamoDB tables, SQS/SNS, Secrets |
| mssql | `wine_liquor_mssql_data` | SQL Server databases |
| oracle | `wine_liquor_oracle_data` | Oracle schemas |
| mysql | `wine_liquor_mysql_data` | MySQL databases |
| postgresql | `wine_liquor_postgres_data` | PostgreSQL databases |
| firebase | `wine_liquor_firebase_data` | Firestore, Auth, Realtime DB |
| duckdb | `wine_liquor_duckdb_data` | DuckDB files |

---

## Current State — Resume Point
*Last updated: 2026-05-22*

### What is built

#### Folder structure
```
wine.liquor/
├── lib/                    # Shared Python library code
│   ├── llm_client.py       # LLM wrapper — switches between Claude and Ollama via .env
│   ├── data_downloader.py  # Socrata API downloader (Iowa, LCBO) with pagination
│   ├── db.py               # PostgreSQL connection class (PostgreSQLClient)
│   ├── generate_pdf.py     # Architecture PDF generator (outputs to docs/pdfs/)
│   └── requirements.txt    # Library dependencies
├── server/                 # Weather agent FastAPI server (Python only)
│   ├── weather_agent.py    # Weather agent — port 8001; RAG + Claude tool_use loop + MCP
│   └── requirements.txt    # Server dependencies
├── duckdb/                 # DuckDB REST API (Python only)
│   ├── api.py              # FastAPI — /health, /tables, /query, /download; Mangum Lambda handler
│   ├── app.py              # Standalone entry point — port 8000
│   └── requirements.txt    # DuckDB API dependencies
├── mcp/                    # MCP server (Python only)
│   ├── weather_server.py   # FastMCP — get_current_weather, get_forecast via Open-Meteo
│   └── requirements.txt
├── rag/                    # RAG layer (Python only)
│   ├── retriever.py        # ChromaDB + sentence-transformers; retrieve(query, n=3)
│   ├── knowledge.json      # 10 weather knowledge chunks (WMO codes, UV, humidity, etc.)
│   └── requirements.txt
├── agent/                  # Data cleaning + orchestration agents (Python only — empty)
├── ui/                     # Expo (React Native) — iOS, Android, Web
│   ├── App.tsx             # Weather chat UI — city input, question chips, answer display
│   ├── app.json            # Expo config
│   └── package.json        # expo ~52, react-native 0.76.5
├── terrorform/             # Terraform — independent per-app root modules
│   ├── modules/lambda_function/  # reusable Lambda + IAM module
│   ├── modules/lambda_layer/     # reusable Docker-build + layer-publish module
│   ├── layers/             # root: builds shared + deps layers, exports ARNs
│   ├── agent/              # root: deploys weather agent Lambda (source_dir = server/)
│   ├── duckdb/             # root: deploys DuckDB API Lambda
│   └── mcp/                # root: deploys MCP Lambda
├── docker/                 # Docker service configs + DB init scripts
│   ├── mssql/init.sql      # MSSQL init
│   ├── mssql/entrypoint.sh # Custom MSSQL startup (no built-in init support)
│   ├── mysql/init.sql      # MySQL init
│   ├── oracle/init.sql     # Oracle init
│   ├── postgresql/init.sql # PostgreSQL init — pgvector, wine schema, users
│   ├── duckdb/             # Dockerfile + requirements for DuckDB REST API
│   └── firebase/           # Firebase emulator config
├── scripts/
│   └── download_sample.sh  # curl script to download Iowa or LCBO sample data
├── samples/                # Downloaded datasets (gitignored)
│   ├── iowa.liquor.sales.csv      (1,000 rows)
│   └── lcbo.product.catalogue.csv (1,000 rows)
├── docs/
│   └── pdfs/               # All generated PDFs (gitignored) — run lib/generate_pdf.py to add
├── venv/                   # Root Python virtual environment
├── .env                    # API keys + DB credentials (gitignored)
├── .vscode/
│   ├── launch.json         # Debug configs: weather agent, DuckDB API, current file, Expo
│   └── settings.json       # Python interpreter → venv/bin/python
└── docker-compose.yml      # All services with named volumes
```

#### Weather demo — complete ✓
End-to-end stack working: Expo UI → FastAPI agent → RAG (ChromaDB) → Claude → MCP (Open-Meteo)

- **`server/weather_agent.py`** — FastAPI, port 8001. POST /ask `{city, question}` → RAG context + Claude tool_use loop → MCP weather call → answer
- **`mcp/weather_server.py`** — FastMCP stdio server. Tools: `get_current_weather(city)`, `get_forecast(city, days)`
- **`rag/retriever.py`** — ChromaDB + all-MiniLM-L6-v2. In-memory collection built from `knowledge.json` on first call
- **`ui/App.tsx`** — Expo React Native chat UI. AGENT_URL = `http://localhost:8001`

Start weather demo:
```bash
source venv/bin/activate
python server/weather_agent.py   # port 8001
cd ui && npm start               # Expo dev server
```

#### DuckDB API server — complete ✓
- **`duckdb/api.py`** — FastAPI, port 8000. Imports `DataDownloader` from `lib/`. Mangum Lambda handler included.
- **`duckdb/app.py`** — standalone entry point: `cd duckdb && python app.py`
- Endpoints: GET /health, GET /tables, POST /query, GET /download
- Lambda: `cd terrorform/duckdb && terraform apply` → exposes `duckdb_url`
- Docker: `docker compose --profile duckdb up -d`

#### Library code (`lib/`) — complete ✓
- **`llm_client.py`** — `LLM_PROVIDER=claude` or `ollama` in `.env`
- **`data_downloader.py`** — Socrata API paginator (Iowa, LCBO)
- **`db.py`** — `PostgreSQLClient`; context manager; reads `POSTGRES_*` from `.env`

#### Datasets available
| Name | API param | Source | Sample |
|---|---|---|---|
| Iowa Liquor Sales | `iowa-liquor-sales` | data.iowa.gov (Socrata) | ✓ 1,000 rows |
| LCBO Product Catalogue | `lcbo-product-catalogue` | data.ontario.ca (Socrata) | ✓ 1,000 rows |

#### Database users (all databases)
| User | Password | Access |
|---|---|---|
| `admin` | `123456` | Full |
| `app_user_admin` | `123456` | Owner-level |
| `app_user_rw` | `123456` | SELECT/INSERT/UPDATE/DELETE |

#### Docker services
```bash
docker compose --profile <name> up -d
# profiles: postgresql, mssql, mysql, oracle, firebase, duckdb, localstack, all
```

### What is NOT started yet — main project pipeline
- [ ] PostgreSQL schema for cleaned wine/liquor data
- [ ] Data cleaning agent (Claude reads Iowa CSV → fixes + loads to PostgreSQL)
- [ ] MCP server to expose PostgreSQL tools to Claude
- [ ] RAG layer over wine/liquor product descriptions
- [ ] Customer chatbot (Claude + MCP + RAG over the cleaned data)

**Next task:** Design PostgreSQL schema for Iowa Liquor Sales data, then build the data cleaning agent in `agent/`.

---

## Weather Demo — Learning Project

A minimal end-to-end demo showing UI + AI Agent + MCP + RAG working together, using free Open-Meteo weather data. Built before the main data-cleaning pipeline to validate the full stack.

### Architecture

```
ui/App.tsx  (Expo React Native)
     ↓  POST /ask  { city, question }
server/weather_agent.py  (FastAPI, port 8001)
     ├── rag/retriever.py  →  ChromaDB (sentence-transformers, local)
     │         rag/knowledge.json  (WMO codes, UV, wind, humidity, clothing tips)
     └── Claude claude-sonnet-4-6  (Anthropic API)
               ↓  tool_use
          mcp/weather_server.py  (FastMCP, stdio)
               ↓  HTTP
          Open-Meteo API  (free, no key needed)
```

### Folder layout

| Folder | Language | Purpose |
|--------|----------|---------|
| `mcp/` | Python | MCP server — `get_current_weather`, `get_forecast` tools |
| `rag/` | Python | ChromaDB + sentence-transformers retrieval over weather knowledge |
| `server/` | Python | FastAPI weather agent — port 8001 |
| `duckdb/` | Python | DuckDB REST API — port 8000 |
| `ui/` | TypeScript (Expo) | Chat UI — iOS, Android, Web via Expo |

> `rag/`, `mcp/`, and `server/` are **Python only**.

### .env keys used

```env
ANTHROPIC_API_KEY=sk-ant-...       # your Anthropic API key
ANTHROPIC_MODEL=claude-sonnet-4-6  # default model
```

### Setup & startup

**1. Install Python dependencies (once per component)**
```bash
pip install -r mcp/requirements.txt
pip install -r rag/requirements.txt
pip install -r server/requirements.txt
pip install -r duckdb/requirements.txt
```

**2. Set your API key in `.env`**
```bash
# edit .env and replace sk-ant-replace-me with your real key
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
```

**3. Build the TypeScript UI**
```bash
cd ui
npm install
npm run build      # compiles app.ts → dist/app.js
```

**4. Start the agent server**
```bash
python server/weather_agent.py
# → http://localhost:8001
```

**5. Open the UI**
```
Open ui/index.html in your browser
```

### Data sources

| Source | URL | Auth |
|--------|-----|------|
| Open-Meteo weather | https://api.open-meteo.com | None — free |
| Open-Meteo geocoding | https://geocoding-api.open-meteo.com | None — free |

---

## Terraform Structure — Enforced Convention

Each Python app has its own Terraform subfolder with independent state. Shared infrastructure lives in reusable modules. **Do not flatten this structure.**

### Folder layout

```
terrorform/
├── modules/                    ← reusable building blocks (not deployable alone)
│   ├── lambda_function/        ← module: Lambda function + IAM role
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── lambda_layer/           ← module: Docker build + layer publish
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── layers/                     ← root: builds shared + deps layers, exports ARNs
│   ├── provider.tf             ← S3 backend key: layers/terraform.tfstate
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf              ← exports deps_layer_arn, shared_layer_arn
│   └── terraform.tfvars
├── agent/                      ← root: deploys agent Lambda independently
│   ├── provider.tf             ← S3 backend key: agent/terraform.tfstate
│   ├── main.tf                 ← reads layer ARNs via terraform_remote_state
│   ├── outputs.tf              ← exposes agent_url (Lambda Function URL)
│   ├── variables.tf
│   └── terraform.tfvars
├── mcp/                        ← root: deploys MCP Lambda independently
│   ├── provider.tf             ← S3 backend key: mcp/terraform.tfstate
│   ├── main.tf
│   ├── variables.tf
│   └── terraform.tfvars
└── ui/                         ← root: deploys Expo web UI as Node.js Lambda
    ├── provider.tf             ← S3 backend key: ui/terraform.tfstate
    ├── main.tf                 ← builds expo web, packages with Express, Lambda Function URL
    ├── variables.tf            ← requires agent_url (from terrorform/agent output)
    └── terraform.tfvars
```

### Rules

- Every app gets its **own subfolder** under `terrorform/` with its own `provider.tf`, `main.tf`, `variables.tf`, `terraform.tfvars`
- Every **Python** app uses the **shared modules** (`../modules/lambda_function`, `../modules/lambda_layer`) — never copy-paste Lambda resource blocks
- The **Node.js UI** Lambda (`terrorform/ui/`) writes resources directly — the Python modules don't apply to Node.js runtimes
- Every app reads layer ARNs from `layers/` state via `terraform_remote_state` — never hardcode ARNs
- Each subfolder has its **own S3 state key** — states are never shared between apps
- `modules/` folders are **never deployed directly** — only called by a root module

### What is shared vs independent

| | Shared (`modules/`) | Each app (`agent/`, `mcp/`, etc.) |
|---|---|---|
| Lambda + IAM pattern | ✓ module | own resource names |
| Layer build logic | ✓ module | reads ARNs via remote state |
| Terraform state | ✗ | own S3 key |
| `lambda_arch` | same default (`x86_64`) | override per app |
| `python_version` | same default (`python3.12`) | override per app |

### Hardware & OS

- `lambda_arch = "x86_64"` (default) or `"arm64"` (Graviton2, ~20% cheaper)
- `terraform.tfvars` sets arch per app — one variable change updates Docker build platform, layer `compatible_architectures`, and function `architectures` automatically
- Docker (`null_resource` in `modules/lambda_layer`) builds packages **inside Amazon Linux** regardless of dev OS — Windows, WSL, Mac all produce identical Linux binaries

### Deploy order

```bash
# 1. Layers first (once, or when any requirements.txt changes)
cd terrorform/layers && terraform init && terraform apply

# 2. Python Lambdas — any order
cd terrorform/agent && terraform init && terraform apply
cd terrorform/mcp   && terraform init && terraform apply

# 3. Get the agent URL from agent outputs
cd terrorform/agent && terraform output agent_url
# → https://xxxx.lambda-url.us-east-1.on.aws/

# 4. Deploy UI — pass the agent URL so the web app can reach the agent
export TF_VAR_agent_url="https://xxxx.lambda-url.us-east-1.on.aws/"
cd terrorform/ui && terraform init && terraform apply
# → outputs ui_url: the public URL for the weather chat web app
```

### Secrets — never committed

```bash
export TF_VAR_anthropic_api_key="sk-ant-..."
export TF_VAR_postgres_password="..."
export TF_VAR_agent_url="https://xxxx.lambda-url.us-east-1.on.aws/"
cd terrorform/agent && terraform apply
```

### Always run Terraform from WSL

The `local-exec` provisioner uses `bash`. Run all `terraform` commands from a WSL terminal, not Windows cmd or PowerShell.

---

## References

- [Anthropic API Docs](https://docs.anthropic.com)
- [MCP Documentation](https://docs.anthropic.com/en/docs/mcp)
- [Claude Console](https://console.anthropic.com)
- [Iowa Liquor Sales Dataset](https://data.iowa.gov/Sales-Distribution/Iowa-Liquor-Sales/m3tr-qhgy)
- [Anthropic Rate Limits](https://docs.anthropic.com/en/api/rate-limits)
- [Ollama](https://ollama.com)
- [Ollama API Docs](https://github.com/ollama/ollama/blob/main/docs/api.md)
